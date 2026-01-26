<script setup lang="ts">
	import { getColorBorderRow } from "@dv-admin/utils/helpers/dashboard.ts";
	import { computed, ref } from "vue";
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import TopTronResources from "@dv-admin/views/dashboard/components/processing/processingRow/topTronResources/TopTronResources.vue";
	import TopEvm from "@dv-admin/views/dashboard/components/processing/processingRow/topEvm/TopEvm.vue";
	import BlockWithdrawalFromProcessing from "@dv-admin/views/dashboard/components/processing/processingRow/blockWithdrawalFromProcessing/BlockWithdrawalFromProcessing.vue";
	import { storeToRefs } from "pinia";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { TRANSFER_TYPES } from "@dv-admin/utils/constants/settings";
	import TopTronBurntrx from "@dv-admin/views/dashboard/components/processing/processingRow/topTronBurntrx/TopTronBurntrx.vue";
	import TopTronCloudDelegate from "@dv-admin/views/dashboard/components/processing/processingRow/topTronCloudDelegate/TopTronCloudDelegate.vue";

	const { userSettings } = storeToRefs(useUserSettingsStore());

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();

	const isShowWithdrawalFromProcessing = ref<Record<string, boolean>>({});
	const blockWithdrawalFromProcessingRef = ref<InstanceType<typeof BlockWithdrawalFromProcessing> | null>(null);
	const amountRecommendReplenishing: number = 50;

	const isTron = computed<boolean>(() => data.currency.id === "TRX.Tron");

	const currentTronType = computed<string | null>(() => {
		const find = userSettings.value.find((item) => item.name === "transfer_type");
		return find ? find.value : null;
	});

	const currentCountTransfers = computed<string>(() => {
		const defaultValue: string = "0";
		if (isTron.value) {
			const countValue: number = parseFloat(data?.additional_data?.tron_data?.tron_transfer_data?.max_transfers_trc20);
			if (isNaN(countValue) || !isFinite(countValue)) return defaultValue;
			return String(Math.ceil(countValue * 0.75));
		} else if (data.currency.is_evm_like && data?.additional_data?.evm_data?.max_transfers_erc20) {
			return data.additional_data.evm_data.max_transfers_erc20;
		} else {
			return defaultValue;
		}
	});

	const currentColorBorderRow = computed<string>(() => {
		if (isTron.value && currentTronType.value !== TRANSFER_TYPES.BURNTRX) {
			return "green";
		}
		return getColorBorderRow(currentCountTransfers.value);
	});

	const showWarningColumn = computed<boolean>(
		() => parseFloat(currentCountTransfers.value) < amountRecommendReplenishing
	);

	const handleClose = () => {
		if (blockWithdrawalFromProcessingRef.value) {
			blockWithdrawalFromProcessingRef.value.clearForm();
		}
	};
</script>

<template>
	<div :class="['row', currentColorBorderRow]">
		<template v-if="isTron">
			<top-tron-resources
				v-if="currentTronType === TRANSFER_TYPES.RESOURCES"
				:data="data"
				v-model="isShowWithdrawalFromProcessing"
				@close="handleClose"
			/>
			<top-tron-burntrx
				v-else-if="currentTronType === TRANSFER_TYPES.BURNTRX"
				:data="data"
				v-model="isShowWithdrawalFromProcessing"
				:count-max-transfers="currentCountTransfers"
				:show-warning-column="showWarningColumn"
				@close="handleClose"
			/>
			<top-tron-cloud-delegate
				v-else-if="currentTronType === TRANSFER_TYPES.CLOUD_DELEGATE"
				:data="data"
				v-model="isShowWithdrawalFromProcessing"
				@close="handleClose"
			/>
			<div v-else class="center flex-grow-1">{{ $t("Not found") }}</div>
		</template>
		<top-evm
			v-else-if="data.currency.is_evm_like"
			:data="data"
			v-model="isShowWithdrawalFromProcessing"
			:count-max-transfers="currentCountTransfers"
			:show-warning-column="showWarningColumn"
			@close="handleClose"
		/>
		<div v-else class="center flex-grow-1">{{ $t("Not found") }}</div>
		<transition name="slide-fade">
			<block-withdrawal-from-processing
				ref="blockWithdrawalFromProcessingRef"
				v-show="isShowWithdrawalFromProcessing[data.currency.id]"
				:data="data"
			/>
		</transition>
	</div>
</template>

<style scoped lang="scss">
	.row {
		display: flex;
		flex-direction: column;
		padding: 12px 8px;
		border-radius: 12px;
		border: 1px solid #1f9649;
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
