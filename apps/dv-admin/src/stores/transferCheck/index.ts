import { defineStore } from "pinia";
import { getApiAmlCurrencies, getApiAmlHistory, getApiAmlKeys } from "@dv-admin/services/api/transferCheck.ts";
import { computed, ref } from "vue";
import type {
	IAmlHistoryFilterRequest,
	IAmlHistoryItemResponse,
	IAmlKeysResponse,
	IAmlScoreTransactionRequest
} from "@dv-admin/utils/types/api/apiGo.ts";
import type { IUiSelectOptions } from "@dv-admin/utils/types/general.ts";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
import { parsePagination } from "@dv-admin/utils/helpers/parsePagination.ts";

export const useTransferCheckStore = defineStore("transferCheck", () => {
	const isLoadingAmlKeys = ref<boolean>(false);
	const amlKeys = ref<IAmlKeysResponse[]>([]);
	const amlCurrencies = ref<IUiSelectOptions[]>([]);
	const isLoadingAmlHistory = ref<boolean>(false);
	const amlHistory = ref<IAmlHistoryItemResponse[]>([]);
	const amlHistoryPagination = ref<UItableMeta | null>(null);
	const amlHistoryFilter = ref<IAmlHistoryFilterRequest>({ page: 1 });
	const formAmlScoreTransaction = ref<IAmlScoreTransactionRequest>({
		currency_id: null,
		direction: null,
		output_address: null,
		provider_slug: "",
		tx_id: null
	});

	const isHaveKeysCurrentAml = computed<boolean>(() => {
		return amlKeys.value.every((item) => Boolean(item.value));
	});

	const getAmlKeys = async (slug: string) => {
		try {
			isLoadingAmlKeys.value = true;
			const data = await getApiAmlKeys(slug);
			if (data) amlKeys.value = data;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingAmlKeys.value = false;
		}
	};

	const getAmlHistory = async () => {
		try {
			isLoadingAmlHistory.value = true;
			const data = await getApiAmlHistory(amlHistoryFilter.value);
			if (data) {
				amlHistory.value = data.items;
				amlHistoryPagination.value = parsePagination(data.pagination);
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingAmlHistory.value = false;
		}
	};

	const getAmlCurrencies = async (slug: string) => {
		try {
			const data = await getApiAmlCurrencies(slug);
			if (data) amlCurrencies.value = data.map((item) => ({ label: item.id, value: item.id }));
		} catch (error: any) {
			throw error;
		}
	};

	return {
		isLoadingAmlKeys,
		isLoadingAmlHistory,
		amlHistory,
		formAmlScoreTransaction,
		amlHistoryPagination,
		amlCurrencies,
		amlKeys,
		amlHistoryFilter,
		isHaveKeysCurrentAml,
		getAmlKeys,
		getAmlCurrencies,
		getAmlHistory
	};
});
