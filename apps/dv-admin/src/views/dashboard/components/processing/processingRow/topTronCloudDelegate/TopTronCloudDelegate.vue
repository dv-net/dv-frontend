<script setup lang="ts">
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import Amount from "@dv-admin/views/dashboard/components/processing/processingRow/amount/Amount.vue";
	import ChainInfo from "@dv-admin/views/dashboard/components/processing/processingRow/chainInfo/ChainInfo.vue";
	import ButtonWithdrawalFromProcessing from "@dv-admin/views/dashboard/components/processing/processingRow/buttonWithdrawalFromProcessing/ButtonWithdrawalFromProcessing.vue";
	import ButtonTronSetting from "@dv-admin/views/dashboard/components/processing/processingRow/buttonTronSetting/ButtonTronSetting.vue";

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
			<div class="plate">
				<div class="plate__content">
					<span class="plate__label">{{ $t("Payment price") }}:</span>
					<span class="plate__value">$0</span>
				</div>
				<span>·</span>
				<div class="plate__content">
					<span class="plate__label">{{ $t("Consumption today") }}:</span>
					<span class="plate__value">$0</span>
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
			.plate {
				gap: 8px;
				margin: 0 12px;
				align-self: stretch;
				@extend .center;
				flex-grow: 1;
				border-radius: 8px;
				border: 1px solid #e1e8f1;
				background: #fdf1ed;
				&__content {
					display: flex;
					align-items: center;
					gap: 4px;
					font-size: 14px;
					font-weight: 500;
					line-height: 20px;
					color: $black;
				}
				&__label {
					color: $secondary;
				}
			}
		}
	}
</style>