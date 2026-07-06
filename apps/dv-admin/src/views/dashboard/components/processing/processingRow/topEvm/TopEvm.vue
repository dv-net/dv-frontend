<script setup lang="ts">
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import ChainInfo from "@dv-admin/views/dashboard/components/processing/processingRow/chainInfo/ChainInfo.vue";
	import Amount from "@dv-admin/views/dashboard/components/processing/processingRow/amount/Amount.vue";
	import PaymentsCount from "@dv-admin/views/dashboard/components/processing/processingRow/paymentsCount/PaymentsCount.vue";
	import Warning from "@dv-admin/views/dashboard/components/processing/processingRow/warning/Warning.vue";
	import ButtonWithdrawalFromProcessing from "@dv-admin/views/dashboard/components/processing/processingRow/buttonWithdrawalFromProcessing/ButtonWithdrawalFromProcessing.vue";

	const { data, countMaxTransfers } = defineProps<{
		data: IProcessingWalletsResponse;
		countMaxTransfers: string;
		showWarningColumn: boolean;
	}>();
	const emits = defineEmits(["close"]);

	const isShowWithdrawalFromProcessing = defineModel<Record<string, boolean>>({ required: true });
</script>

<template>
	<div class="evm" :class="{ 'recommend-topping': showWarningColumn }">
		<div class="evm__column">
			<chain-info :data="data" />
		</div>
		<div class="evm__column">
			<amount :data="data" />
		</div>
		<div class="evm__column">
			<payments-count :count-max-transfers="countMaxTransfers" />
		</div>
		<div v-if="showWarningColumn" class="evm__column">
			<warning :count-max-transfers="countMaxTransfers" />
		</div>
		<div class="evm__column">
			<button-withdrawal-from-processing
				v-model="isShowWithdrawalFromProcessing"
				:currencyId="data.currency.id as string"
				@close="emits('close')"
			/>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.evm {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		row-gap: 16px;

		@include mediamin(768) {
			grid-template-columns: 230px 180px 1fr 50px;

			&.recommend-topping {
				grid-template-columns: 230px 180px 1fr 1fr 50px;
			}
		}

		&__column {
			display: flex;
			align-items: center;
			padding: 0 8px;
			&:not(:last-child) {
				border-right: 1px solid $grey;
			}
		}
	}
</style>
