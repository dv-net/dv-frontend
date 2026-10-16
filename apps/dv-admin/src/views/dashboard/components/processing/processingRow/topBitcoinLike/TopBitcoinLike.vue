<script setup lang="ts">
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import ChainInfo from "@dv-admin/views/dashboard/components/processing/processingRow/chainInfo/ChainInfo.vue";
	import Amount from "@dv-admin/views/dashboard/components/processing/processingRow/amount/Amount.vue";
	import ButtonWithdrawalFromProcessing from "@dv-admin/views/dashboard/components/processing/processingRow/buttonWithdrawalFromProcessing/ButtonWithdrawalFromProcessing.vue";

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();
	const emits = defineEmits(["close"]);

	const isShowWithdrawalFromProcessing = defineModel<Record<string, boolean>>({ required: true });
</script>

<template>
	<div class="bitcoin">
		<div class="bitcoin__column">
			<chain-info :data="data" />
		</div>
		<div class="bitcoin__column">
			<amount :data="data" />
		</div>
		<div class="bitcoin__column" />
		<div class="bitcoin__column">
			<button-withdrawal-from-processing
				v-model="isShowWithdrawalFromProcessing"
				:currencyId="data.currency.id"
				@close="emits('close')"
			/>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.bitcoin {
		display: grid;
		grid-template-columns: 230px 180px 1fr 50px;
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
