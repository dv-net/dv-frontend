<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { storeToRefs } from "pinia";
	import { UiSkeleton } from "@dv.net/ui-kit";
	import { computed } from "vue";
	import TronItem from "@dv-admin/views/dashboard/components/processing/components/TronItem.vue";
	import BlockchainItem from "@dv-admin/views/dashboard/components/processing/components/BlockchainItem.vue";

	const { processingWallets, isLoadingProcessingWallets } = storeToRefs(useDashboardStore());

	const isVisibleTable = computed<boolean>(() => {
		if (isLoadingProcessingWallets.value) return true;
		return Boolean(processingWallets.value.length);
	});
</script>

<template>
	<block-section
		v-if="isVisibleTable"
		class="processing"
		:title="$t('Processing balances')"
		:infoText="$t('The funds in these wallets are used to make payments and cover fees for transfers to hot wallets')"
		:isLoading="isLoadingProcessingWallets"
	>
		<ui-skeleton v-if="isLoadingProcessingWallets" :rows="4" :row-height="70" :rows-gap="16" :item-border-radius="16" />
		<div v-else class="processing__table">
			<div v-for="item in processingWallets" :key="item.address">
				<tron-item v-if="item.currency.id === 'TRX.Tron'" :data="item" />

				<blockchain-item v-else :data="item" />
			</div>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.processing {
		display: flex;
		flex-direction: column;
		gap: 20px;

		&__table {
			display: flex;
			flex-direction: column;
			gap: 16px;
		}
	}
</style>
