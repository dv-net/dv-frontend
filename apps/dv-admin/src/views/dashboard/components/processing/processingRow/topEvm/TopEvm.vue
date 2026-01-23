<script setup lang="ts">
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import ChainInfo from "@dv-admin/views/dashboard/components/processing/processingRow/chainInfo/ChainInfo.vue";
	import { formatAmountBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import { getDeclensionTransfers } from "@dv-admin/utils/helpers/declensions.ts";
	import IconDollarEth from "@dv-admin/components/icons/dashboard/IconDollarEth.vue";
	import { computed } from "vue";
	import { UiIcon, UiTooltip } from "@dv.net/ui-kit";
	import IconDanger from "@dv-admin/components/icons/dashboard/IconDanger.vue";
	import IconWithdrawalFromProcessing from "@dv-admin/components/icons/dashboard/IconWithdrawalFromProcessing.vue";

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();

	const isShowWithdrawalFromProcessing = defineModel<Record<string, boolean>>({ default: {}, required: true });
	const amountRecommendReplenishing: number = 50;

	const countMaxTransfers = computed<string>(() => data?.additional_data?.evm_data?.max_transfers_erc20 || "0");
	const showWarningColumn = computed<boolean>(() => parseFloat(countMaxTransfers.value) < amountRecommendReplenishing);
</script>

<template>
	<div class="evm" :class="{ 'recommend-topping': showWarningColumn }">
		<div class="evm__column">
			<chain-info :data="data" />
		</div>
		<div class="evm__column">
			<div class="amount">
				{{ formatAmountBlockchain(data.balance.native_token, data.currency.id) }}
				{{ getCurrentCoin(data.currency.id) }}
			</div>
		</div>
		<div class="evm__column">
			<div class="payments-count">
				<icon-dollar-eth class="payments-count__icon" />
				<span class="payments-count__text">
					{{ $t("Enough for") }} {{ countMaxTransfers }}
					{{ $t(getDeclensionTransfers(Number(countMaxTransfers))) }}
				</span>
			</div>
		</div>
		<div v-if="showWarningColumn" class="evm__column">
			<div class="warning">
				<ui-tooltip
					mode="dark"
					position="top-start"
					is-gold-title
					:title="$t('We recommend to top up')"
					:text="$t('payments_dashboard', { count: countMaxTransfers })"
				>
					<icon-danger />
				</ui-tooltip>
				<span class="warning__text">{{ $t("We recommend to top up") }}</span>
			</div>
		</div>
		<div class="evm__column">
			<div class="withdrawal-from-processing">
				<transition name="fade-scale" mode="out-in">
					<ui-icon
						v-if="isShowWithdrawalFromProcessing[data.currency.id]"
						key="close"
						type="400"
						name="close"
						size="lg"
						color="#444444"
						class="withdrawal-from-processing__close"
						@click="isShowWithdrawalFromProcessing[data.currency.id] = false"
					/>
					<ui-tooltip
						v-else
						key="withdrawal"
						:title="`${$t('Withdrawal from processing')} ${$t('wallets.many3')}`"
						:text="$t('You can withdraw funds from the current processing ring')"
					>
						<icon-withdrawal-from-processing
							class="pointer flex-shrink-0"
							@click="isShowWithdrawalFromProcessing[data.currency.id] = true"
						/>
					</ui-tooltip>
				</transition>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.evm {
		display: grid;
		grid-template-columns: 230px 180px 1fr 50px;
		&.recommend-topping {
			grid-template-columns: 230px 180px 1fr 1fr 50px;
		}
		&__column {
			display: flex;
			align-items: center;
			padding: 0 8px;
			&:not(:last-child) {
				border-right: 1px solid #e1e8f1;
			}
			.amount {
				color: $black;
				font-size: 18px;
				font-weight: 400;
				padding-left: 12px;
			}
			.payments-count {
				display: flex;
				align-items: center;
				gap: 8px;
				color: $black;
				font-size: 14px;
				font-weight: 500;
				padding-left: 12px;
				line-height: 20px;
				&__icon {
					flex-shrink: 0;
				}
				&__text {
					word-break: break-word;
				}
			}
			.warning {
				display: flex;
				align-items: center;
				gap: 8px;
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				padding-left: 12px;
				line-height: 20px;
				&__text {
					word-break: break-word;
				}
			}
			.withdrawal-from-processing {
				display: flex;
				justify-content: flex-end;
				flex-grow: 1;
				&__close {
					transition: transform 0.3s ease-in-out;
					@media (hover: hover) {
						&:hover {
							cursor: pointer;
							transform: scale(1.01);
						}
					}
				}
			}
		}
		.fade-scale-enter-active {
			transition: all 0.2s ease-out;
		}
		.fade-scale-leave-active {
			transition: all 0.2s ease-in;
		}
		.fade-scale-enter-from {
			opacity: 0;
			transform: scale(0.8);
		}
		.fade-scale-leave-to {
			opacity: 0;
			transform: scale(0.8);
		}
	}
</style>