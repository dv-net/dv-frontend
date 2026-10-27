<script setup lang="ts">
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import ChainInfo from "@dv-admin/views/dashboard/components/processing/processingRow/chainInfo/ChainInfo.vue";
	import Amount from "@dv-admin/views/dashboard/components/processing/processingRow/amount/Amount.vue";
	import ButtonWithdrawalFromProcessing from "@dv-admin/views/dashboard/components/processing/processingRow/buttonWithdrawalFromProcessing/ButtonWithdrawalFromProcessing.vue";
	import IconNetworkFee from "@dv-admin/components/icons/dashboard/IconNetworkFee.vue";

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
		<div class="bitcoin__column">
			<div class="bitcoin__hint">
				<icon-network-fee class="bitcoin__hint-icon" />
				<span>{{ $t("Network fee is taken from this wallet") }}</span>
			</div>
		</div>
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
		&__hint {
			display: flex;
			align-items: center;
			gap: 8px;
			padding-left: 12px;
			color: $black;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;

			span {
				word-break: break-word;
			}
		}
		&__hint-icon {
			flex-shrink: 0;
			color: $secondary;
		}
	}
</style>
