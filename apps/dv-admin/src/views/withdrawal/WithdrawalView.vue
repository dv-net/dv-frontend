<script setup lang="ts">
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import { computed, onMounted } from "vue";
	import WithdrawalTable from "@dv-admin/views/withdrawal/components/withdrawalTable/WithdrawalTable.vue";
	import { UiButton, UiSkeleton } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import { useI18n } from "vue-i18n";

	const { getWithdrawalRules, getExchangeDepositAddresses } = useWithdrawalStore();
	const { userSettings, isLoadingUpdateUserSettings, isLoading } = storeToRefs(useUserSettingsStore());
	const { postUserSettings } = useUserSettingsStore();
	const { getUserSettings } = useUserSettingsStore();
	const { getExchangeList } = useExchangeSettingsStore();

	const { t } = useI18n();

	const isDisabledHotWallets = computed<boolean>(() => {
		const find = userSettings.value.find((item) => item.name === "transfers_status");
		return Boolean(!find || find.value === "disabled");
	});

	const handleChangeHotWallets = async () => {
		const findIndex = userSettings.value.findIndex((item) => item.name === "transfers_status");
		if (findIndex === -1) return;
		userSettings.value[findIndex].value = userSettings.value[findIndex].value === "disabled" ? "enabled" : "disabled";
		await postUserSettings(
			userSettings.value[findIndex],
			t(
				isDisabledHotWallets.value
					? "Transfers from hot wallets are disabled"
					: "Transfers from hot wallets are enabled"
			)
		);
	};

	onMounted(async () => {
		await Promise.all([getUserSettings(), getWithdrawalRules(), getExchangeList(), getExchangeDepositAddresses()]);
	});
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("Withdrawal rules") }}</h1>
		<ui-skeleton v-if="isLoading" :rows="1" :rowHeight="78" :item-border-radius="12" class="mt-32 mb-24" />
		<div v-else class="info">
			<div class="info__content">
				<div class="info__inner-text">
					<span>{{ $t("Hot wallet forwarding") }}:</span>
					<span class="info__status" :class="{ disabled: isDisabledHotWallets }">
						{{ $t(isDisabledHotWallets ? "Disabled " : "Enabled") }}
					</span>
				</div>
				<p class="info__text">
					{{
						$t(
							isDisabledHotWallets
								? "All funds received by hot wallets will remain there until you enable forwarding"
								: "Forwarding is enabled. All funds received by hot wallets will be forwarded to cold wallets"
						)
					}}
				</p>
			</div>
			<ui-button
				size="sm"
				:type="isDisabledHotWallets ? 'secondary' : 'negative'"
				left-icon-name="check-circle"
				:loading="isLoadingUpdateUserSettings"
				@click="handleChangeHotWallets"
			>
				{{ $t(isDisabledHotWallets ? "Turn on" : "Turn off") }}
			</ui-button>
		</div>
		<withdrawal-table />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		.info {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 15px;
			padding: 16px 24px;
			border-radius: 12px;
			border: 1px solid $grey;
			background-color: $blue-opacity;
			margin: 32px 0 24px;
			&__content {
				max-width: 708px;
				width: 100%;
				display: flex;
				flex-direction: column;
				gap: 4px;
			}
			&__inner-text {
				display: flex;
				align-items: center;
				gap: 4px;
				color: $black;
				font-size: 16px;
				font-weight: 500;
				line-height: 24px;
			}
			&__text {
				color: $secondary;
				font-size: 14px;
				font-weight: 400;
				line-height: 16px;
			}
			&__status {
				color: #1f9649;
				&.disabled {
					color: #dd4c1e;
				}
			}
		}
	}
</style>
