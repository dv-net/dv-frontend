import { defineStore } from "pinia";
import { ref } from "vue";
import { getApiTransaction, getApiTransactionStats } from "@dv-admin/services/api/history";
import type {
	ITransactionDashboardItem,
	ITransactionRequest,
	ITransactionStatsResponse
} from "@dv-admin/utils/types/api/apiGo";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
import { parsePagination } from "@dv-admin/utils/helpers/parsePagination";
import { filterTransactionsStartData } from "@dv-admin/utils/constants/history";

export const useTransactionStore = defineStore("transaction", () => {
	const isLoading = ref<boolean>(false);
	const isLoadingTransactionStats = ref<boolean>(false);
	const transactionsStats = ref<ITransactionStatsResponse[]>([]);
	const transactions = ref<ITransactionDashboardItem[]>([]);
	const transactionsPagination = ref<UItableMeta | null>(null);
	const isHideLowBalance = ref<boolean>(true);
	const filterTransactions = ref<ITransactionRequest>({ ...filterTransactionsStartData });

	const getTransaction = async (params?: ITransactionRequest) => {
		try {
			isLoading.value = true;
			filterTransactions.value.min_amount_usd = isHideLowBalance.value ? "1" : null;
			const data = await getApiTransaction(params || filterTransactions.value);
			if (data) {
				transactions.value = data.items;
				transactionsPagination.value = parsePagination(data.pagination);
			}
		} catch (error: any) {
			transactions.value = [];
			transactionsPagination.value = null;
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const getTransactionStats = async (params?: ITransactionRequest) => {
		try {
			isLoadingTransactionStats.value = true;
			filterTransactions.value.min_amount_usd = isHideLowBalance.value ? "1" : null;
			const data = await getApiTransactionStats(params || filterTransactions.value);
			if (data) transactionsStats.value = data;
		} catch (error: any) {
			transactionsStats.value = [];
			throw error;
		} finally {
			isLoadingTransactionStats.value = false;
		}
	};

	const resetDataTransaction = () => {
		filterTransactions.value = { ...filterTransactionsStartData };
	};

	return {
		isLoading,
		isHideLowBalance,
		transactions,
		filterTransactions,
		transactionsPagination,
		transactionsStats,
		getTransaction,
		resetDataTransaction,
		getTransactionStats
	};
});
