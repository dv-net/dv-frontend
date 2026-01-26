<script setup lang="ts">
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import Amount from "@dv-admin/views/dashboard/components/processing/processingRow/amount/Amount.vue";
	import ChainInfo from "@dv-admin/views/dashboard/components/processing/processingRow/chainInfo/ChainInfo.vue";
	import ButtonWithdrawalFromProcessing from "@dv-admin/views/dashboard/components/processing/processingRow/buttonWithdrawalFromProcessing/ButtonWithdrawalFromProcessing.vue";
	import ButtonTronSetting from "@dv-admin/views/dashboard/components/processing/processingRow/buttonTronSetting/ButtonTronSetting.vue";
	import PaymentsCount from "@dv-admin/views/dashboard/components/processing/processingRow/paymentsCount/PaymentsCount.vue";
	import Warning from "@dv-admin/views/dashboard/components/processing/processingRow/warning/Warning.vue";

	const { data, countMaxTransfers, showWarningColumn } = defineProps<{
		data: IProcessingWalletsResponse;
		countMaxTransfers: string;
		showWarningColumn: boolean;
	}>();
	const emits = defineEmits(['close']);

	const isShowWithdrawalFromProcessing = defineModel<Record<string, boolean>>({ default: {}, required: true });
</script>

<template>
	<div class="tron" :class="{ 'recommend-topping': showWarningColumn }">
		<div class="tron__column">
			<chain-info :data="data" />
		</div>
		<div class="tron__column">
			<amount :data="data" />
		</div>
		<div class="tron__column">
			<payments-count :count-max-transfers="countMaxTransfers" />
		</div>
		<div v-if="showWarningColumn" class="tron__column">
			<warning :count-max-transfers="countMaxTransfers" />
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
		&.recommend-topping {
			grid-template-columns: 230px 180px 1fr 1fr 100px;
		}
		&__column {
			display: flex;
			align-items: center;
			padding: 0 8px;
			&:not(:last-child) {
				border-right: 1px solid #e1e8f1;
			}
		}
	}
</style>