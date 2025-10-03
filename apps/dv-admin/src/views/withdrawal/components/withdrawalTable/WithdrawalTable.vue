<script setup lang="ts">
	import { storeToRefs } from "pinia";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import { useRouter } from "vue-router";
	import { UiButton, UiSkeleton } from "@dv.net/ui-kit";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import type { IWithdrawalRulesResponse } from "@dv-admin/utils/types/api/apiGo";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import { useI18n } from "vue-i18n";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";

	const { withdrawalRules, depositAddresses, isLoading } = storeToRefs(useWithdrawalStore());
	const { exchangeList } = storeToRefs(useExchangeSettingsStore());
	const router = useRouter();
	const { t } = useI18n();

	const displayMessageWallets = (row: IWithdrawalRulesResponse) => {
		if (!exchangeList.value || !exchangeList.value?.current_exchange) {
			return `${t("Ordinary")} (${row.addressees.length}) / ${t("Exchange")} (0)`;
		}
		const currentExchange = depositAddresses.value.find((item) => item.slug === exchangeList.value?.current_exchange);
		if (!currentExchange) {
			return `${t("Ordinary")} (${row.addressees.length}) / ${t("Exchange")} (0)`;
		}
		const uniqueDepositAddresses = new Set(currentExchange.addresses.map((item) => item.address));
		let count: number = 0;
		for (const item of row.addressees) {
			if (uniqueDepositAddresses.has(item.address)) count++;
		}
		return `${t("Ordinary")} (${row.addressees.length - count}) / ${t("Exchange")} (${count})`;
	};
</script>

<template>
	<block-section class="cryptocurrencies">
		<div class="cryptocurrencies__header">
			<div>{{ $t("Cryptocurrency") }}</div>
			<div class="flex gap-4">
				{{ $t("Regular addresses") }}
				<tooltip-helper
					:title="$t('Regular addresses')"
					:text="$t('Added by you manually (for example, a cold wallet).')"
				/>
				/
				{{ $t("crypto exchange") }}
				<tooltip-helper
					:title="$t('Exchange')"
					:text="$t('Withdrawal addresses added by you for specific crypto exchanges.')"
				/>
			</div>
			<div />
		</div>
		<ui-skeleton
			v-if="isLoading"
			:rows="15"
			:rowHeight="45"
			:item-border-radius="8"
			:rows-gap="8"
		/>
		<div v-else class="cryptocurrencies__rows">
			<div v-for="item in withdrawalRules" :key="item.id" class="cryptocurrencies__row">
				<div>
					<blockchain-card :type="item.currency.id" />
				</div>
				<div class="addresses">
					<div v-if="item?.addressees?.length" class="addresses__text addresses__text--green">
						{{ displayMessageWallets(item) }}
					</div>
					<div v-else class="addresses__text">
						<span>{{ $t("Not set") }}</span>
						<tooltip-helper
							:title="$t('Add wallets')"
							:text="
									$t(
										'All funds received on hot wallets will remain there. It is necessary to specify your wallets for transfer'
									)
								"
						/>
					</div>
				</div>
				<div>
					<ui-button
						type="secondary"
						size="sm"
						@click="router.push({ name: `withdrawal-addresses`, params: { currencyId: item?.currency?.id } })"
					>
						{{ $t("Change wallets") }}
					</ui-button>
				</div>
			</div>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.cryptocurrencies {
		display: flex;
		flex-direction: column;
		gap: 12px;
		&__header {
			display: grid;
			grid-template-columns: 1fr 1fr 160px;
			gap: 20px;
			color: $grey-opacity;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			padding: 0 12px;
		}
		&__rows {
			display: flex;
			flex-direction: column;
			border-radius: 12px;
			border: 1px solid #ecf0f5;
		}
		&__row {
			display: grid;
			grid-template-columns: 1fr 1fr 160px;
			gap: 20px;
			padding: 12px;
			border-bottom: 1px solid #ecf0f5;
			&:last-child {
				border-bottom: unset;
			}
			.addresses {
				display: flex;
				align-items: center;
				gap: 24px;
				font-size: 14px;
				font-weight: 500;
				color: $black;
				justify-content: space-between;
				&__text {
					display: flex;
					align-items: center;
					gap: 4px;
					color: #dd4c1e;
					font-size: 14px;
					font-weight: 500;
					&--green {
						color: #1f9649;
					}
				}
			}
		}
	}
</style>
