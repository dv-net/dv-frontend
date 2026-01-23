<script setup lang="ts">
	import { getColorBorderRow } from "@dv-admin/utils/helpers/dashboard.ts";
	import { computed, ref } from "vue";
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import TopTron from "@dv-admin/views/dashboard/components/processing/processingRow/topTron/TopTron.vue";
	import TopEvm from "@dv-admin/views/dashboard/components/processing/processingRow/topEvm/TopEvm.vue";
	import BlockWithdrawalFromProcessing from "@dv-admin/views/dashboard/components/processing/processingRow/blockWithdrawalFromProcessing/BlockWithdrawalFromProcessing.vue";

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();

	const isShowWithdrawalFromProcessing = ref<Record<string, boolean>>({});

	const isTron = computed<boolean>(() => data.currency.id === "TRX.Tron");

	const currentCountTransfers = computed<string>(() => {
		const defaultValue: string = "0";
		if (data.currency.id === "TRX.Tron") {
			const countValue: number = parseFloat(data?.additional_data?.tron_data?.tron_transfer_data?.max_transfers_trc20);
			if (isNaN(countValue) || !isFinite(countValue)) return defaultValue;
			return String(Math.ceil(countValue * 0.75));
		} else if (data.currency.is_evm_like && data?.additional_data?.evm_data?.max_transfers_erc20) {
			return data.additional_data.evm_data.max_transfers_erc20;
		} else {
			return defaultValue;
		}
	});
</script>

<template>
	<div :class="['row', getColorBorderRow(currentCountTransfers)]">
		<top-tron v-if="isTron" :data="data" />
		<top-evm v-else-if="data.currency.is_evm_like" :data="data" v-model="isShowWithdrawalFromProcessing" />
		<div v-else class="center">{{ $t("Not found") }}</div>
		<transition name="slide-fade">
			<block-withdrawal-from-processing v-show="isShowWithdrawalFromProcessing[data.currency.id]" :data="data" />
		</transition>
	</div>
</template>

<style scoped lang="scss">
	.row {
		display: flex;
		flex-direction: column;
		padding: 12px 8px;
		border-radius: 12px;
		border: 1px solid #ff9e00;
		flex-shrink: 0;
		min-height: 64px;
		&.red {
			border: 1px solid #dd4c1e;
		}
		&.green {
			border: 1px solid #1f9649;
		}
		&.orange {
			border: 1px solid #ff9e00;
		}
		.slide-fade-enter-active {
			transition: all 0.3s ease-out;
		}
		.slide-fade-leave-active {
			transition: all 0.3s ease-in;
		}
		.slide-fade-enter-from {
			transform: translateY(-10px);
			opacity: 0;
		}
		.slide-fade-leave-to {
			transform: translateY(-10px);
			opacity: 0;
		}
	}
</style>
