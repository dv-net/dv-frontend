<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import IconHotWallets from "@dv-admin/components/icons/dashboard/IconHotWallets.vue";
	import { UiButton, UiIcon, UiSkeleton } from "@dv.net/ui-kit/dist";
	import IconExchange from "@dv-admin/components/icons/dashboard/IconExchange.vue";
	import IconColdWallet from "@dv-admin/components/icons/dashboard/IconColdWallets.vue";
	import { storeToRefs } from "pinia";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { computed } from "vue";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import Card from "@dv-admin/views/dashboard/components/cards/card/Card.vue";
	import { useI18n } from "vue-i18n";

	const { balancesExchanges, walletBalancesCold, isLoadingBalances } = storeToRefs(useDashboardStore());
	const { walletBalancesHot, isLoadingWalletBalancesHot } = storeToRefs(useHotWalletsStore());
	const { userSettings, isLoadingUpdateUserSettings } = storeToRefs(useUserSettingsStore());
	const { postUserSettings } = useUserSettingsStore();

	const { t } = useI18n();

	const disabledHotWalletsValues: string[] = ["system_suspended", "disabled"];

	const isDisabledHotWallets = computed<boolean>(() => {
		const find = userSettings.value.find((item) => item.name === "transfers_status");
		return Boolean(!find || disabledHotWalletsValues.includes(find.value));
	});

	const currentTransfersStatus = computed<string>(() => {
		const findIndex = userSettings.value.findIndex((item) => item.name === "transfers_status");
		if (findIndex === -1) return "unknown";
		return userSettings.value[findIndex].value;
	});

	const handleChangeHotWallets = async () => {
		const findIndex = userSettings.value.findIndex((item) => item.name === "transfers_status");
		if (findIndex === -1) return;
		userSettings.value[findIndex].value = disabledHotWalletsValues.includes(userSettings.value[findIndex].value)
			? "enabled"
			: "disabled";
		await postUserSettings(
			userSettings.value[findIndex],
			t(userSettings.value[findIndex].value === "enabled" ? "Transfers are enabled" : "Transfers are disabled")
		);
	};
</script>

<template>
	<block-section mode="grey-border" class="flex flex-column gap-16">
		<div class="cards">
			<template v-if="isLoadingBalances">
				<ui-skeleton :rows="1" :row-height="162" :item-border-radius="16" first-color="#fff" />
				<ui-skeleton :rows="1" :row-height="162" :item-border-radius="16" first-color="#fff" />
				<ui-skeleton :rows="1" :row-height="162" :item-border-radius="16" first-color="#fff" />
			</template>
			<template v-else>
				<card
					:no-current-exchange="!balancesExchanges?.total_usd"
					:icon="IconHotWallets"
					:amount="walletBalancesHot"
					:is-loading-amount="isLoadingWalletBalancesHot"
					:title="$t('On hot wallets')"
					:tooltip-text="`${$t('This is the balance of funds that have come from your clients')}.`"
				>
					<div :class="{ cards__bottom: true, 'no-margin': !balancesExchanges?.total_usd }">
						<ui-button
							class="cards__btn"
							:type="isDisabledHotWallets ? 'outline' : 'secondary'"
							:loading="isLoadingUpdateUserSettings"
							@click="handleChangeHotWallets"
							:outline-type-color="isDisabledHotWallets ? '#1f9649' : undefined"
						>
							<span>{{ $t(isDisabledHotWallets ? "Enable transfers" : "Suspend transfers") }}</span>
						</ui-button>
					</div>
				</card>

				<card
					v-if="balancesExchanges?.total_usd"
					:no-current-exchange="!balancesExchanges?.total_usd"
					:icon="IconExchange"
					:amount="balancesExchanges?.total_usd"
					:title="$t('Balance on the crypto exchange')"
					color="green"
					:tooltip-text="`${$t('This is the balance of funds that are on your crypto')}.`"
				>
					<ui-button
						class="cards__btn"
						:type="useExchangeSettingsStore().exchangeList?.swap_state === 'disabled' ? 'outline' : 'secondary'"
						:outline-type-color="
							useExchangeSettingsStore().exchangeList?.swap_state === 'disabled' ? '#1f9649' : undefined
						"
						:loading="useExchangeSettingsStore().isLoadingExchangeToggle['swap_state']"
						@click="
							useExchangeSettingsStore().postExchangeToggle(
								'swap_state',
								useExchangeSettingsStore().exchangeList?.swap_state
							)
						"
					>
						{{
							$t(
								useExchangeSettingsStore().exchangeList?.swap_state === "disabled"
									? "Enable exchanges"
									: "Stop exchanges"
							)
						}}
					</ui-button>
				</card>

				<card
					v-if="balancesExchanges?.total_usd"
					:no-current-exchange="!balancesExchanges?.total_usd"
					:icon="IconColdWallet"
					:amount="walletBalancesCold"
					:title="$t('On cold wallets')"
					color="blue"
					:tooltip-text="`${$t('This is the balance of funds that have been withdrawn to your wallets from the crypto exchange')}.`"
				>
					<ui-button
						class="cards__btn"
						:type="useExchangeSettingsStore().exchangeList?.withdrawal_state === 'disabled' ? 'outline' : 'secondary'"
						:outline-type-color="
							useExchangeSettingsStore().exchangeList?.withdrawal_state === 'disabled' ? '#1f9649' : undefined
						"
						:loading="useExchangeSettingsStore().isLoadingExchangeToggle['withdrawal_state']"
						@click="
							useExchangeSettingsStore().postExchangeToggle(
								'withdrawal_state',
								useExchangeSettingsStore().exchangeList?.withdrawal_state
							)
						"
					>
						{{
							$t(
								useExchangeSettingsStore().exchangeList?.withdrawal_state === "disabled"
									? "Enable withdrawal"
									: "Pause withdrawal"
							)
						}}
					</ui-button>
				</card>
			</template>
		</div>

		<div v-if="currentTransfersStatus === 'system_suspended'" class="cards__warning">
			<ui-icon name="error" type="400" color="#dd4c1e" />
			<p class="warning__text">
				{{
					$t(
						"We have suspended transfers because we were unable to perform automatic withdrawals from the crypto exchange - your account there may have been temporarily blocked. To enable transfers again, please disable the automatic withdrawal function from the crypto exchange"
					)
				}}
			</p>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.cards {
		display: flex;
		gap: 18px;

		&__bottom {
			display: flex;
			flex-direction: column;
			gap: 12px;
			margin-top: auto;

			&.no-margin {
				margin-top: 0;
			}
		}

		&__btn {
			margin-top: auto;
			width: 100%;
		}

		&__warning {
			display: flex;
			gap: 8px;
			border-radius: 8px;
			border: 1px solid #dd4c1e;
			background-color: #fcede8;
			padding: 12px;
			&__text {
				color: $black;
				font-size: 11px;
				font-weight: 500;
				line-height: 15px;
			}
		}
	}
</style>
