<script setup lang="ts">
	import { UiButton, UiSkeleton, UiSwitch } from "@dv.net/ui-kit";
	import Balances from "@dv-admin/views/hotWallets/components/balances/Balances.vue";
	import HotWalletsTable from "@dv-admin/views/hotWallets/components/hotWalletsTable/HotWalletsTable.vue";
	import SavePhrasesDialog from "@dv-admin/views/hotWallets/components/savePhrasesDialog/SavePhrasesDialog.vue";
	import { onMounted, onUnmounted, ref } from "vue";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import { checkIsJSON } from "@shared/utils/helpers/general";
	import Filters from "@dv-admin/views/hotWallets/components/filters/Filters.vue";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import HotWalletsCards from "@dv-admin/views/hotWallets/components/hotWalletsCards/HotWalletsCards.vue";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import { storeToRefs } from "pinia";
	import { USER } from "@dv-admin/utils/constants/user";
	import NotFoundMessage from "@dv-admin/components/ui/notFoundMessage/NotFoundMessage.vue";

	const { getWallets, getWalletSummary, resetDataHotWallets } = useHotWalletsStore();
	const { isHideLowBalance, isLoading, walletSummary } = storeToRefs(useHotWalletsStore());

	const isOpenModalSeeds = ref<boolean>(false);
	const toggleView = ref<boolean>(false);

	const handleChangeVisibleBalance = async () => {
		await Promise.all([getWallets(), getWalletSummary(undefined, true)]);
	};

	onMounted(async () => {
		const currentStateView: string | null = localStorage.getItem(USER.HOT_WALLETS_VIEW);
		if (currentStateView !== null && checkIsJSON(currentStateView)) {
			const result: any = JSON.parse(currentStateView);
			if (typeof result === "boolean") toggleView.value = result;
		}
		await Promise.all([getWallets(), getWalletSummary(undefined, true)]);
	});

	onUnmounted(() => {
		resetDataHotWallets();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Transfers')" back-name-route="transfers" />

		<div class="page__title">
			<h1 class="global-title-h2">{{ $t("Hot wallets") }}</h1>
			<ui-button class="button-gap-4" type="secondary" @click="isOpenModalSeeds = true">
				{{ $t("Download seed phrases") }}
				<tooltip-helper
					:title="$t('Download seed phrases')"
					:text="$t('Used to restore access to your wallets. We recommend storing them in a secure place.')"
				/>
			</ui-button>
			<save-phrases-dialog v-model="isOpenModalSeeds" type="seeds" />
		</div>

		<template v-if="walletSummary.length === 0 && isLoading">
			<ui-skeleton :rows="1" :row-height="20" :item-border-radius="16" class="mb-30" />
			<ui-skeleton :rows="1" :row-height="315" :item-border-radius="16" class="mb-24" />
			<ui-skeleton :rows="1" :row-height="210" :item-border-radius="16" />
		</template>

		<template v-else-if="walletSummary.length !== 0">
			<div class="flex flex-y-center gap-8 mb-30">
				<ui-switch
					v-model="isHideLowBalance"
					:label="$t('Hide addresses with low balance')"
					@change="handleChangeVisibleBalance"
				/>
				<tooltip-helper
					:title="$t('Hide addresses with low balance')"
					:text="
						$t(
							'If this option is enabled, we will hide and not take into account small balances, crypto-spam and dust on the wallets'
						)
					"
				/>
			</div>

			<balances />

			<div class="wallets">
				<div class="wallets__filter">
					<filters v-model:toggle-view="toggleView" />
				</div>
				<div class="wallets__list">
					<hot-wallets-table v-if="toggleView" />

					<hot-wallets-cards v-else />
				</div>
			</div>
		</template>
		<not-found-message
			v-else
			:text="$t(`You don’t have any hot wallets yet.`)"
		/>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;

		&__title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 20px;
			margin: 24px 0 32px;

			.button-gap-4 {
				:deep(.ui-button__content) {
					gap: 4px;
				}
			}
		}

		.wallets {
			display: flex;
			flex-direction: column;
			border-radius: 16px;
			border: 1px solid $grey;
			background-color: $blue-opacity;
			margin-top: 24px;

			&__filter {
				display: flex;
				flex-direction: column;
			}

			&__list {
				display: flex;
				padding: 30px 24px 24px 24px;
			}
		}
	}
</style>
