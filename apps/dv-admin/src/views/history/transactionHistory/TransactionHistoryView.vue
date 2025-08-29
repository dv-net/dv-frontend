<script setup lang="ts">
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general";
	import { UiTable, UiLink } from "@dv.net/ui-kit";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { storeToRefs } from "pinia";
	import { computed, onMounted, ref, watch } from "vue";
	import { useTransactionStore } from "@dv-admin/stores/history";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import type { UiTableHeader, UiTableSortObject } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import { useI18n } from "vue-i18n";
	import { getLinkSearch } from "@shared/utils/helpers/linkExplorer";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import ConvertHistoryTable from "@dv-admin/components/common/exchanges/convertHistoryTable/ConvertHistoryTable.vue";
	import WithdrawalHistoryTable from "@dv-admin/components/common/exchanges/withdrawalHistoryTable/WithdrawalHistoryTable.vue";
	import ChartTransactions from "@dv-admin/views/history/transactionHistory/components/chartTransactions/ChartTransactions.vue";
	import { useRoute, useRouter } from "vue-router";
	import {
		type ENUM_TRANSACTIONS_TYPES,
		tabsClearQuery,
		TRANSACTIONS_TYPES,
		TRANSACTIONS_TYPES_ARRAY
	} from "@dv-admin/utils/constants/history";
	import { useScroll } from "@shared/utils/composables/useScroll.ts";
	import BlockFilterTransactions from "@dv-admin/views/history/transactionHistory/components/blockFilterTransactions/BlockFilterTransactions.vue";
	import type { showedHistoryTableType } from "@dv-admin/utils/types/api/apiGo.ts";

	const router = useRouter();
	const route = useRoute();
	const savedTab = route.query.tab as ENUM_TRANSACTIONS_TYPES;

	const { t } = useI18n();
	const { moveToSavedPositionScroll } = useScroll("history");

	const { transactions, isLoading, transactionsPagination, filterTransactions } = storeToRefs(useTransactionStore());
	const { getTransaction, getTransactionStats } = useTransactionStore();
	const { getConnectedExchanges } = useWithdrawalStore();

	const tab = ref<ENUM_TRANSACTIONS_TYPES>(TRANSACTIONS_TYPES.USER_REPLENISHMENTS);
	const selectedExchange = ref<string>();

	const showedTable = ref<showedHistoryTableType>("transactions");
	const childComponentConvertHistoryTable = ref<InstanceType<typeof ConvertHistoryTable> | null>(null);
	const childComponentWithdrawalHistoryTable = ref<InstanceType<typeof WithdrawalHistoryTable> | null>(null);

	const headers = computed<UiTableHeader[]>(() => [
		{
			name: "created_at",
			label: t("Date and time"),
			width: "160",
			sortName: "created_at_index",
			sortable: "custom"
		},
		{ name: "amount_usd", label: t("Total"), sortable: "custom" },
		{ name: "tx_hash", label: t("Transaction details") },
		{ name: "user_email", label: t("Email"), sortable: "custom" },
		{ name: "more", width: "130" }
	]);

	const changePageHandler = (pagination: UiPaginationMeta) => {
		filterTransactions.value.page = pagination.page;
		getTransaction(filterTransactions.value);
	};

	const handleChangeFilter = async () => {
		transactionsPagination.value = null;
		await Promise.all([
			getTransaction(filterTransactions.value),
			getTransactionStats(filterTransactions.value),
			childComponentConvertHistoryTable.value
				? childComponentConvertHistoryTable.value.getExchangeOrder(selectedExchange.value, 1)
				: Promise.resolve(),
			childComponentWithdrawalHistoryTable.value
				? childComponentWithdrawalHistoryTable.value.getExchangeWithdrawal(selectedExchange.value, 1)
				: Promise.resolve()
		]);
	};

	const sortTransactions = async (row: UiTableSortObject) => {
		filterTransactions.value.sort_by = row.name;
		filterTransactions.value.sort_direction = row.order;
		await getTransaction(filterTransactions.value);
	};

	const changeTabs = async (tabValue: ENUM_TRANSACTIONS_TYPES, isOnMounted: boolean = false) => {
		tab.value = tabValue;
		if (!isOnMounted) {
			filterTransactions.value.page = 1;
		}
		await router.replace({
			query: {
				...(tabsClearQuery.includes(tabValue) ? {} : filterTransactions.value),
				tab: tabValue
			}
		});

		switch (tabValue) {
			case TRANSACTIONS_TYPES.USER_REPLENISHMENTS:
				filterTransactions.value.type = "deposit";
				showedTable.value = "transactions";
				await handleChangeFilter();
				break;
			case TRANSACTIONS_TYPES.WITHDRAWALS_FROM_HOT:
				filterTransactions.value.type = "transfer";
				showedTable.value = "transactions";
				await handleChangeFilter();
				break;
			case TRANSACTIONS_TYPES.EXCHANGES_ON_THE_EXCHANGE:
				showedTable.value = "exchange";
				break;
			case TRANSACTIONS_TYPES.WITHDRAWALS_FROM_THE_EXCHANGE:
				showedTable.value = "withdrawal";
				break;
		}
	};

	watch(
		filterTransactions,
		async (newValue) => {
			await router.replace({
				query: {
					...(tabsClearQuery.includes(tab.value) ? {} : { ...route.query, ...newValue }),
					tab: tab.value
				}
			});
		},
		{ deep: true }
	);

	onMounted(async () => {
		filterTransactions.value = { ...filterTransactions.value, ...route.query };
		await changeTabs(
			TRANSACTIONS_TYPES_ARRAY.includes(savedTab) ? savedTab : TRANSACTIONS_TYPES.USER_REPLENISHMENTS,
			true
		);
		moveToSavedPositionScroll();
		await getConnectedExchanges();
	});
</script>

<template>
	<block-filter-transactions
		v-model:selectedExchange="selectedExchange"
		v-model:tab="tab"
		:changeFilter="handleChangeFilter"
		:changeTabs="changeTabs"
		:showedTable="showedTable"
	/>

	<chart-transactions v-if="showedTable === 'transactions'" />

	<ui-table
		v-if="showedTable === 'transactions'"
		:loading="isLoading"
		:headers="headers"
		:data="transactions"
		:meta="transactionsPagination"
		class="table"
		@sort-change="sortTransactions"
		@change-pagination="changePageHandler"
		:isShowPerPageSelect="false"
		table-layout="fixed"
	>
		<template #body-cell-created_at="{ row }">{{ formatDate(row.created_at) }}</template>

		<template #body-cell-amount_usd="{ row }">
			<div class="table__details">
				<b>{{ formatDollars(row.amount_usd) }}</b>
				<span class="table__point">•</span>
				<div class="table__blockchain">
					<blockchain-icon :type="row.currency.id" width="16px" height="16px" />
					<span>{{ formatAmountBlockchain(row.amount, row?.currency?.id) }}</span>
					<span class="table__blockchain-currency">{{ getCurrentCoin(row?.currency?.id) }}</span>
				</div>
			</div>
		</template>

		<template #body-cell-tx_hash="{ row }">
			<display-hash
				type="transaction"
				:hash="row.tx_hash"
				:currency-id="row.currency.id"
				:is-link="false"
				size-icon="sm"
				:countPrefix="7"
				:countSuffix="9"
			/>
		</template>

		<template #body-cell-user_email="{ row }">
			<template v-if="row.user_email">{{ row.user_email }}</template>
			<div v-else-if="row.untrusted_email" style="font-style: italic">{{ row.untrusted_email }}</div>
			<template v-else>—</template>
		</template>

		<template #body-cell-more="{ row }">
			<ui-link :to="getLinkSearch('transaction', row.tx_hash)">{{ $t("Read more") }}</ui-link>
		</template>
	</ui-table>

	<convert-history-table
		ref="childComponentConvertHistoryTable"
		v-else-if="showedTable === 'exchange'"
		:slug="selectedExchange"
	/>
	<withdrawal-history-table
		ref="childComponentWithdrawalHistoryTable"
		v-else-if="showedTable === 'withdrawal'"
		:slug="selectedExchange"
	/>
</template>

<style scoped lang="scss">
	.table {
		&__details {
			display: flex;
			align-items: center;
			gap: 8px;
			b {
				width: 50px;
				text-align: right;
			}
		}
		&__blockchain {
			display: flex;
			align-items: center;
			gap: 4px;
			font-size: 14px;
			&-currency {
				text-transform: uppercase;
			}
		}
		&__point {
			color: $grey-opacity;
		}
	}
</style>
