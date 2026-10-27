<script setup lang="ts">
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import { storeToRefs } from "pinia";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import SendButton from "@dv-admin/views/hotWallets/components/sendButton/SendButton.vue";
	import { UiCheckbox, UiTable, UiTooltip, UiIcon } from "@dv.net/ui-kit";
	import { computed } from "vue";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import { useI18n } from "vue-i18n";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general";

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
			:row-class="(row) => (row.dirty ? 'row--dirty' : '')"
			@change-pagination="changePageHandler"
			table-layout="fixed"
			:isShowPerPageSelect="false"
		>
			<template #body-cell-checkbox="{ row }">
				<ui-checkbox size="sm" v-model="row.isSelected" @change="handleSelectWallet(row)" />
			</template>

			<template #body-cell-currency_id="{ row }">
				<div class="currency-cell">
					<blockchain-card :type="row.currency_id" />
					<ui-tooltip
						v-if="row.dirty"
						:title="$t('Dirty address')"
						:text="$t('This address has been marked as dirty and permanently removed from automatic allocation. Any funds received to this wallet require manual withdrawal processing')"
					>
						<ui-icon name="warning" type="filled" color="#f04438" size="sm" class="pointer" />
					</ui-tooltip>
				</div>
			</template>

			<template #body-cell-amount="{ row }">
				<div class="amount">
					<span>{{ formatDollars(row.amount_usd, { countPartMoreOneDollar: 2 }) }}</span>
					<span>•</span>
					<span class="amount__muted">{{ formatAmountBlockchain(row.amount, { currencyId: row.currency_id }) }}</span>
					<span class="amount__muted">{{ getCurrentCoin(row.currency_id) }}</span>
				</div>
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

<style scoped lang="scss">
	.amount {
		display: flex;
		align-items: center;
		gap: 4px;
		color: $black;
		font-size: 14px;
		font-weight: 400;
		line-height: 20px;

		&__muted {
			color: $secondary;
			text-transform: uppercase;
		}
	}

	.currency-cell {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	:deep(.row--dirty) td {
		background-color: #fff5f5;
	}
</style>
