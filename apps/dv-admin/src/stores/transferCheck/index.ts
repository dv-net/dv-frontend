import { defineStore } from "pinia";
import {
	getApiAmlHistory,
	getApiAmlKeys,
	getApiAmlRiskRules,
	getApiAmlSettings,
	getApiAmlSignals,
	postApiAmlRiskRules
} from "@dv-admin/utils/services/transferCheck.ts";
import { computed, ref } from "vue";
import type {
	IAmlHistoryFilterRequest,
	IAmlHistoryItemResponse,
	IAmlKeysResponse,
	IAmlRiskRuleRequest,
	IAmlRiskRuleResponse,
	IAmlScoreTransactionRequest,
	IAmlSettingsResponse,
	IAmlSignalCategoryResponse
} from "@dv-admin/utils/types/api/apiGo.ts";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
import { parsePagination } from "@dv-admin/utils/helpers/parsePagination.ts";

export const useTransferCheckStore = defineStore("transferCheck", () => {
	const isLoadingAmlKeys = ref<boolean>(false);
	const isLoadingAmlSettings = ref<boolean>(false);
	const isLoadingAmlRiskRules = ref<boolean>(false);
	const isLoadingPutAmlRiskRules = ref<boolean>(false);
	const amlKeys = ref<IAmlKeysResponse[]>([]);
	const isLoadingAmlHistory = ref<boolean>(false);
	const amlHistory = ref<IAmlHistoryItemResponse[]>([]);
	const amlHistoryPagination = ref<UItableMeta | null>(null);
	const amlHistoryFilter = ref<IAmlHistoryFilterRequest>({ page: 1 });
	const amlSettings = ref<IAmlSettingsResponse | null>(null);
	const amlRiskRules = ref<IAmlRiskRuleResponse[]>([]);
	const amlSignalCategories = ref<IAmlSignalCategoryResponse[]>([]);
	const formAmlScoreTransaction = ref<IAmlScoreTransactionRequest>({
		currency_id: null,
		direction: null,
		output_address: null,
		provider_slug: "",
		tx_id: null
	});

	const isHaveKeysCurrentAml = computed<boolean>(() => {
		return amlKeys.value.length > 0 && amlKeys.value.every((item) => Boolean(item.value));
	});

	const isCurrentProviderEnabled = computed<boolean>(() => {
		const slug = formAmlScoreTransaction.value.provider_slug;
		return Boolean(amlSettings.value?.enabled && amlSettings.value?.provider_slug === slug);
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

	const getAmlSettings = async () => {
		try {
			isLoadingAmlSettings.value = true;
			const data = await getApiAmlSettings();
			if (data && "provider_slug" in data) {
				amlSettings.value = data;
				if (data.provider_slug) {
					formAmlScoreTransaction.value.provider_slug = data.provider_slug;
				}
			} else {
				amlSettings.value = null;
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingAmlSettings.value = false;
		}
	};

	const getAmlRiskRules = async (slug: string) => {
		try {
			isLoadingAmlRiskRules.value = true;
			const [rules, signals] = await Promise.all([
				getApiAmlRiskRules(slug),
				getApiAmlSignals(slug).catch(() => [] as IAmlSignalCategoryResponse[])
			]);
			if (rules) amlRiskRules.value = rules;
			amlSignalCategories.value = signals || [];
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingAmlRiskRules.value = false;
		}
	};

	const putAmlRiskRules = async (slug: string, rules: IAmlRiskRuleRequest[]) => {
		try {
			isLoadingPutAmlRiskRules.value = true;
			const data = await postApiAmlRiskRules(slug, rules);
			if (data) {
				const byType = new Map(data.map((rule) => [rule.risk_type, rule]));
				amlRiskRules.value = amlRiskRules.value.map((rule) => byType.get(rule.risk_type) ?? rule);
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingPutAmlRiskRules.value = false;
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

	return {
		isLoadingAmlKeys,
		isLoadingAmlSettings,
		isLoadingAmlRiskRules,
		isLoadingPutAmlRiskRules,
		isLoadingAmlHistory,
		amlHistory,
		amlSettings,
		amlRiskRules,
		amlSignalCategories,
		formAmlScoreTransaction,
		amlHistoryPagination,
		amlKeys,
		amlHistoryFilter,
		isHaveKeysCurrentAml,
		isCurrentProviderEnabled,
		getAmlKeys,
		getAmlHistory,
		getAmlSettings,
		getAmlRiskRules,
		putAmlRiskRules
	};
});
