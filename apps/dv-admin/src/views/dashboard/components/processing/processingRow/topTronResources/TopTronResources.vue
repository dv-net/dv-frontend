<script setup lang="ts">
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import Amount from "@dv-admin/views/dashboard/components/processing/processingRow/amount/Amount.vue";
	import ChainInfo from "@dv-admin/views/dashboard/components/processing/processingRow/chainInfo/ChainInfo.vue";
	import ButtonWithdrawalFromProcessing from "@dv-admin/views/dashboard/components/processing/processingRow/buttonWithdrawalFromProcessing/ButtonWithdrawalFromProcessing.vue";
	import ButtonTronSetting from "@dv-admin/views/dashboard/components/processing/processingRow/buttonTronSetting/ButtonTronSetting.vue";
	import { formatDollars } from "@shared/utils/helpers/general.ts";
	import { calculationEnergyAndBandwidth } from "@dv-admin/utils/helpers/calculationEnergyAndBandwidth.ts";
	import { UiTooltip } from "@dv.net/ui-kit";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import { storeToRefs } from "pinia";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";

	const { processingWallets } = storeToRefs(useDashboardStore());

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();
	const emits = defineEmits(['close']);

	const isShowWithdrawalFromProcessing = defineModel<Record<string, boolean>>({ default: {}, required: true });
</script>

<template>
	<div class="tron">
		<div class="tron__column">
			<chain-info :data="data" />
		</div>
		<div class="tron__column">
			<amount :data="data" />
		</div>
		<div class="tron__column">
			<div class="tron__bars">
				<div class="bar">
					<div class="bar__content">
						<span class="center gap-4">
							<span class="bar__content-label">Energy</span>
							<tooltip-helper
								title="Energy"
								:text="
									$t(
										'A resource required to execute smart contracts without paying additional fees. To receive, use staking.'
									)
								"
								icon-size="sm"
							/>
						</span>
						<span>
							{{ formatDollars(calculationEnergyAndBandwidth(processingWallets, "energy").meaningStripe, "") }}
							{{ $t("out of") }}
							{{ formatDollars(data?.additional_data?.tron_data?.total_energy, "") }}
						</span>
					</div>
					<ui-tooltip
						class="bar__tooltip"
						mode="dark"
						position="top-start"
						title="Energy"
						is-gold-title
						:text="`${formatDollars(calculationEnergyAndBandwidth(processingWallets, 'energy').meaningStripe, '')} ${$t('Energy is reserved to replenish the costs incurred during previous transmissions')}`"
					>
						<div class="bar__inner">
							<div
								class="bar__totalused"
								:style="{ width: calculationEnergyAndBandwidth(processingWallets, 'energy').widthUse + '%' }"
							/>
						</div>
					</ui-tooltip>
				</div>
				<div class="bar">
					<div class="bar__content">
						<span class="center gap-4">
							<span class="bar__content-label">Bandwidth</span>
							<tooltip-helper
								title="Bandwidth"
								:text="
									$t(
										'A resource that allows you to make regular transactions (for example, transfer TRX) without a fee. To receive, use staking.'
									)
								"
								icon-size="sm"
							/>
						</span>
						<span>
							{{ formatDollars(calculationEnergyAndBandwidth(processingWallets, "bandwidth").meaningStripe, "") }}
							{{ $t("out of") }} {{ formatDollars(data?.additional_data?.tron_data?.total_bandwidth, "") }}
						</span>
					</div>
					<ui-tooltip
						class="bar__tooltip"
						mode="dark"
						position="top-start"
						title="Bandwidth"
						is-gold-title
						:text="`${formatDollars(calculationEnergyAndBandwidth(processingWallets, 'bandwidth').meaningStripe, '')} ${$t('Bandwidth is reserved to cover costs incurred during previous transmissions')}`"
					>
						<div class="bar__inner">
							<div
								class="bar__totalused"
								:style="{ width: calculationEnergyAndBandwidth(processingWallets, 'bandwidth').widthUse + '%' }"
							/>
						</div>
					</ui-tooltip>
				</div>
			</div>
		</div>
		<div class="tron__column">
			<div class="flex flex-grow-1 flex-x-end gap-20">
				<button-withdrawal-from-processing
					v-model="isShowWithdrawalFromProcessing"
					:currencyId="data.currency.id"
					@close="emits('close')"
				/>
				<button-tron-setting />
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.tron {
		display: grid;
		grid-template-columns: 230px 180px 1fr 100px;
		&__column {
			display: flex;
			align-items: center;
			padding: 0 8px;
			&:not(:last-child) {
				border-right: 1px solid #e1e8f1;
			}
		}
		&__bars {
			flex-grow: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 16px;
			.bar {
				display: flex;
				flex-direction: column;
				max-width: 223px;
				width: 100%;
				gap: 4px;
				&__content {
					display: flex;
					justify-content: space-between;
					color: #303345;
					font-size: 12px;
					font-weight: 500;
					line-height: 16px;
					&-label {
						color: #1f9649;
					}
				}
				&:deep(.bar__tooltip) {
					.ui-tooltip__trigger {
						width: 100%;
					}
				}
				&__inner {
					overflow: hidden;
					position: relative;
					display: flex;
					background-color: #ecf0f5;
					height: 4px;
					border-radius: 16px;
					width: 100%;
				}
				&__stacked {
					position: absolute;
					left: 0;
					height: 100%;
					background-color: #dd4c1e;
					border-radius: 16px;
				}
				&__use {
					position: absolute;
					z-index: 1;
					left: 0;
					height: 100%;
					background-color: #1f9649;
					border-radius: 16px;
				}
				&__totalused {
					position: absolute;
					left: 0;
					height: 100%;
					background-color: #1f9649;
					border-radius: 16px;
				}
			}
		}
	}
</style>