<script setup lang="ts">
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import { storeToRefs } from "pinia";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import PriceOutput from "@dv-admin/components/ui/priceOutput/PriceOutput.vue";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import SendButton from "@dv-admin/views/hotWallets/components/sendButton/SendButton.vue";
	import { UiCheckbox, UiTable } from "@dv.net/ui-kit";
	import { computed } from "vue";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import { useI18n } from "vue-i18n";

	const { wallets, walletsPagination, isLoading } = storeToRefs(useHotWalletsStore());
	const { getWallets, handleSelectWallet } = useHotWalletsStore();

	const { t } = useI18n();

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "checkbox", width: "40" },
		{
			name: "currency_id",
			label: t("Blockchain")
		},
		{ name: "amount", label: t("Total") },
		{ name: "link", label: t("Hot wallet address") },
		{
			name: "button",
			width: "110"
		}
	]);

	const changePageHandler = async (pagination: UiPaginationMeta) => {
		if (walletsPagination.value) walletsPagination.value.page = pagination.page;
		await getWallets("pagination");
	};
</script>

<template>
	<div class="flex-column">
		<ui-table
			:loading="isLoading"
			:headers="headers"
			:data="wallets"
			:meta="walletsPagination"
			@change-pagination="changePageHandler"
			table-layout="fixed"
			:isShowPerPageSelect="false"
		>
			<template #body-cell-checkbox="{ row }">
				<ui-checkbox size="sm" v-model="row.isSelected" @change="handleSelectWallet(row)" />
			</template>

			<template #body-cell-currency_id="{ row }">
				<blockchain-card :type="row.currency_id" />
			</template>

			<template #body-cell-amount="{ row }">
				<price-output :amount="row.amount" :currencyId="row.currency_id" :amountUsd="row.amount_usd" />
			</template>

			<template #body-cell-link="{ row }">
				<display-hash type="address" :hash="row.address" size-icon="sm" :currency-id="row.currency_id" />
			</template>

			<template #body-cell-button="{ row }">
				<send-button :data="row" size-button="sm" placement="bottom-end" />
			</template>
		</ui-table>
	</div>
</template>
