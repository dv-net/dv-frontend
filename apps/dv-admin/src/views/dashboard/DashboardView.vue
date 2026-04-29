<script setup lang="ts">
	import TransactionsList from "@dv-admin/views/dashboard/components/transactionsList/TransactionsList.vue";
	import Processing from "@dv-admin/views/dashboard/components/processing/Processing.vue";
	import Deposits from "@dv-admin/views/dashboard/components/deposits/Deposits.vue";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { useTransactionStore } from "@dv-admin/stores/history";
	import { onMounted, onUnmounted } from "vue";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import { storeToRefs } from "pinia";
	import { getLastDaysRange } from "@dv-admin/utils/helpers/dateParse";
	import Cards from "@dv-admin/views/dashboard/components/cards/Cards.vue";
	import BalancesHotWallets from "@dv-admin/views/dashboard/components/balancesHotWallets/BalancesHotWallets.vue";
	import WarningBanner from "@dv-admin/views/dashboard/components/warningBanner/WarningBanner.vue";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { computed } from "vue";
	import dayjs from "dayjs";

	const transactionStore = useTransactionStore();
	const authStore = useAuthStore();

	const { getProcessingWallets, getDepositSummary, getBalanceCurrentExchange, getBalancesCold } = useDashboardStore();
	const { transactions, transactionsPagination } = storeToRefs(transactionStore);
	const { getTransaction } = transactionStore;
	const { getWalletSummary, getWalletBalancesHot } = useHotWalletsStore();
	const { isShowMainLoader, user, isTwoFaResetExpiresAt, isLoadingDelete2Fa } = storeToRefs(authStore);
	const { deleteUser2FaReset } = authStore;
	const { getUserSettings } = useUserSettingsStore();

	const twoFaResetDaysLeft = computed<number>(() => {
		const expiresAt = user.value?.two_fa_reset_expires_at;
		if (!expiresAt) return 0;
		const expiresAtDate = dayjs(expiresAt);
		if (!expiresAtDate.isValid()) return 0;
		const diffDays = expiresAtDate.diff(dayjs(), "day", true);
		return Math.max(0, Math.ceil(diffDays));
	});

	const getAllDataPage = async () => {
		try {
			await Promise.all([
				getTransaction({
					page: 1,
					page_size: 500,
					type: "deposit",
					date: getLastDaysRange().dateTo,
					min_amount_usd: "1"
				}),
				getDepositSummary(),
				getWalletSummary(1),
				getProcessingWallets(),
				getWalletBalancesHot(),
				getUserSettings(),
				getBalanceCurrentExchange(),
				getBalancesCold()
			]);
		} catch (error: any) {
			console.error(error);
		} finally {
			isShowMainLoader.value = false;
		}
	};

	onMounted(async () => {
		await getAllDataPage();
	});
	onUnmounted(() => {
		transactions.value = [];
		transactionsPagination.value = null;
	});
</script>

<template>
	<div class="page">
		<div class="page__top">
			<h1 class="global-title-h1">{{ $t("Dashboard") }}</h1>
			<warning-banner
				v-if="isTwoFaResetExpiresAt"
				:text="$t('2FA reset was requested. 2FA will be reset in {days} days', { days: twoFaResetDaysLeft })"
				:button-text="$t('Cancel 2FA reset')"
				:button-loading="isLoadingDelete2Fa"
				@button-click="deleteUser2FaReset($t('You have cancelled the 2FA reset'))"
			/>
			<cards />
		</div>
		<balances-hot-wallets />
		<processing />
		<deposits />
		<transactions-list />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 40px;
		&__top {
			display: flex;
			flex-direction: column;
			gap: 32px;
		}
	}
</style>
