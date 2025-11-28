import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import {
	getApiBalanceCurrentExchange,
	getApiBalancesCold,
	getApiDepositSummary,
	getApiProcessingWallets,
	getApiTronResourceExpenses,
	postApiWithdrawalFromProcessing
} from "@dv-admin/services/api/dashboard";
import type {
	IBalancesCurrentExchange,
	IDepositSummaryRequest,
	IDepositSummaryResponse,
	IProcessingWalletsResponse,
	ITronResourceExpensesRequest,
	ITronResourceExpensesResponse,
	IWithdrawalFromProcessingRequest
} from "@dv-admin/utils/types/api/apiGo";
import type { BlockchainType } from "@shared/utils/types/blockchain";
import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
import type { IDepositFilteredSummary } from "@dv-admin/utils/types/schemas";
import { formatDate, getLastDaysRange } from "@dv-admin/utils/helpers/dateParse.ts";
import { getDepositPercentages } from "@dv-admin/utils/helpers/dashboard.ts";
import { useGeneralStore } from "@dv-admin/stores/general";
import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { getCurrentCoin } from "@shared/utils/helpers/general.ts";

const { notify } = useNotifications();

export const useDashboardStore = defineStore("dashboard", () => {
	const { exchangeList } = storeToRefs(useExchangeSettingsStore());
	const { otpGlobalCode } = storeToRefs(useGeneralStore());

	const { getExchangeList } = useExchangeSettingsStore();
	const { openOtpGlobalModal } = useGeneralStore();

	const router = useRouter();
	const { t } = useI18n();
	const isLoadingDeposit = ref<boolean>(false);
	const walletBalancesCold = ref<string>("");
	const processingWallets = ref<IProcessingWalletsResponse[]>([]);
	const isLoadingProcessingWallets = ref<boolean>(false);
	const depositSummary = ref<IDepositFilteredSummary[]>([]);
	const balancesExchanges = ref<IBalancesCurrentExchange | null>(null);
	const isLoadingBalances = ref<boolean>(false);
	const tronResourceExpenses = ref<ITronResourceExpensesResponse | null>(null);
	const depositTronSummary = ref<IDepositSummaryResponse[]>([]);

	const getProcessingWallets = async () => {
		try {
			isLoadingProcessingWallets.value = true;
			const data = await getApiProcessingWallets();
			if (data) {
				processingWallets.value = data.sort((a, b) => {
					if (a.currency.id === ("TRX.Tron" as BlockchainType)) return -1;
					if (b.currency.id === ("TRX.Tron" as BlockchainType)) return 1;
					return 0;
				});
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingProcessingWallets.value = false;
		}
	};

	const getDepositSummary = async () => {
		try {
			isLoadingDeposit.value = true;
			const data = await getApiDepositSummary();
			if (data) {
				console.log(data);
				// depositSummary.value = data.map((item) => ({
				// 	...item,
				// 	isMoreDetails: false,
				// 	details_by_currency: Object.entries(item.details_by_currency).map(([currency, data]) => {
				// 		const coin = getCurrentCoin(currency)
				// 		return {
				// 			...item,
				// 			currency: coin,
				// 		}
				// 	})
				// }))



				// depositSummary.value = data.map((item) => {
				// 	const total = item.transactions_count;
				// 	const details = Object.entries(item.details_by_currency).map(([currency, data]) => ({ currency, ...data }));
				// 	return {
				// 		date: item.date,
				// 		sum_usd: item.sum_usd,
				// 		transactions_count: item.transactions_count,
				// 		type: item.type,
				// 		isMoreDetails: false,
				// 		details_by_currency: getDepositPercentages(details, total)
				// 	};
				// });
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingDeposit.value = false;
		}
	};

	const getBalanceCurrentExchange = async () => {
		try {
			isLoadingBalances.value = true;
			await getExchangeList();
			if (!exchangeList.value?.current_exchange) return;
			const data = await getApiBalanceCurrentExchange(exchangeList.value.current_exchange);
			if (data) balancesExchanges.value = data;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingBalances.value = false;
		}
	};

	const getBalancesCold = async () => {
		try {
			const data = await getApiBalancesCold();
			if (data) walletBalancesCold.value = data;
		} catch (error: any) {
			throw error;
		}
	};

	// Chart tron
	const getTronResourceExpenses = async () => {
		try {
			const body: ITronResourceExpensesRequest = {
				date_from: getLastDaysRange(7).dateFromWithTime,
				date_to: getLastDaysRange(7).dateToWithTime,
				resolution: "hour"
			};
			const data = await getApiTronResourceExpenses(body);
			if (data) tronResourceExpenses.value = data;
		} catch (error: any) {
			throw error;
		}
	};

	const getTronDepositSummary = async () => {
		try {
			const params: IDepositSummaryRequest = {
				date_from: getLastDaysRange(7).dateFromWithTime,
				date_to: getLastDaysRange(7).dateToWithTime,
				currency_ids: ["TRX.Tron", "USDT.Tron"],
				resolution: "hour"
			};
			const data = await getApiDepositSummary(params);
			if (data) {
				depositTronSummary.value = data.map((item) => {
					return { ...item, date: formatDate(item.date, "YYYY-MM-DD") };
				});
			}
		} catch (error: any) {
			throw error;
		}
	};

	const postWithdrawalFromProcessing = async (params: IWithdrawalFromProcessingRequest, clearForm: () => void) => {
		try {
			if (!otpGlobalCode.value) {
				openOtpGlobalModal(() => postWithdrawalFromProcessing(params, clearForm));
			} else {
				await postApiWithdrawalFromProcessing({ ...params, totp: otpGlobalCode.value });
				clearForm();
				notify(t("Withdrawal was successful"), "success");
				router.push({ name: "dashboard" });
			}
		} catch (error: any) {
			throw error;
		}
	};

	return {
		isLoadingDeposit,
		processingWallets,
		depositSummary,
		walletBalancesCold,
		balancesExchanges,
		isLoadingProcessingWallets,
		isLoadingBalances,
		tronResourceExpenses,
		depositTronSummary,
		getProcessingWallets,
		getDepositSummary,
		getBalanceCurrentExchange,
		getBalancesCold,
		getTronResourceExpenses,
		getTronDepositSummary,
		postWithdrawalFromProcessing
	};
});
