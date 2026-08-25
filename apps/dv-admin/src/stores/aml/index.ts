import { defineStore, storeToRefs } from "pinia";
import {
	getApiAmlHistory,
	getApiAmlKeys,
	getApiAmlRiskRules,
	getApiAmlSettings,
	getApiAmlSignals,
	getApiAmlStatistics,
	postApiAmlRiskRules
} from "@dv-admin/utils/services/aml.ts";
import { computed, ref } from "vue";
import type {
	IAmlHistoryFilterRequest,
	IAmlHistoryItemResponse,
	IAmlKeysResponse,
	IAmlRiskRuleRequest,
	IAmlRiskRuleResponse,
	IAmlScoreTransactionRequest,
	IAmlSettingsResponse,
	IAmlSignalCategoryResponse,
	IAmlStatisticsResponse
} from "@dv-admin/utils/types/api/apiGo.ts";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
import { parsePagination } from "@dv-admin/utils/helpers/parsePagination.ts";
import { useGeneralStore } from "@dv-admin/stores/general";

export const useAmlStore = defineStore("aml", () => {
	const isLoadingAmlKeys = ref<boolean>(false);
	const isLoadingAmlSettings = ref<boolean>(false);
	const isLoadingAmlRiskRules = ref<boolean>(false);
	const isLoadingPutAmlRiskRules = ref<boolean>(false);
	const isLoadingAmlStatistics = ref<boolean>(false);
	const amlKeys = ref<IAmlKeysResponse[]>([]);
	const amlKeysByProvider = ref<Record<string, IAmlKeysResponse[]>>({});
	const isLoadingAmlHistory = ref<boolean>(false);
	const amlHistory = ref<IAmlHistoryItemResponse[]>([]);
	const amlHistoryPagination = ref<UItableMeta | null>(null);
	const amlHistoryFilter = ref<IAmlHistoryFilterRequest>({ page: 1 });
	const amlSettings = ref<IAmlSettingsResponse | null>(null);
	const amlStatistics = ref<IAmlStatisticsResponse | null>(null);
	const amlRiskRules = ref<IAmlRiskRuleResponse[]>([]);
	const amlSignalCategories = ref<IAmlSignalCategoryResponse[]>([]);
	const formAmlScoreTransaction = ref<IAmlScoreTransactionRequest>({
		currency_id: null,
		direction: null,
		output_address: null,
		provider_slug: "",
		tx_id: null
	});

	const hasFilledKeys = (keys: IAmlKeysResponse[] | undefined): boolean =>
		Boolean(keys?.length && keys.every((item) => Boolean(item.value)));

	const isProviderConnected = (slug: string): boolean => hasFilledKeys(amlKeysByProvider.value[slug]);

	const connectedProviderSlugs = computed<string[]>(() =>
		Object.keys(amlKeysByProvider.value).filter((slug) => isProviderConnected(slug))
	);

	const isHaveKeysCurrentAml = computed<boolean>(() => {
		const slug = formAmlScoreTransaction.value.provider_slug;
		if (slug && slug in amlKeysByProvider.value) return isProviderConnected(slug);
		return hasFilledKeys(amlKeys.value);
	});

	const isCurrentProviderEnabled = computed<boolean>(() => {
		const slug = formAmlScoreTransaction.value.provider_slug;
		return Boolean(amlSettings.value?.enabled && amlSettings.value?.provider_slug === slug);
	});

	const syncCurrentAmlKeys = (slug?: string) => {
		const currentSlug = slug || formAmlScoreTransaction.value.provider_slug;
		if (currentSlug && amlKeysByProvider.value[currentSlug]) {
			amlKeys.value = amlKeysByProvider.value[currentSlug];
		}
	};

	const getAmlKeys = async (slug: string) => {
		try {
			isLoadingAmlKeys.value = true;
			const data = await getApiAmlKeys(slug);
			const keys = data || [];
			amlKeysByProvider.value = { ...amlKeysByProvider.value, [slug]: keys };
			if (!formAmlScoreTransaction.value.provider_slug || formAmlScoreTransaction.value.provider_slug === slug) {
				amlKeys.value = keys;
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingAmlKeys.value = false;
		}
	};

	const getAllAmlKeys = async () => {
		const { dictionary } = storeToRefs(useGeneralStore());
		const slugs = dictionary.value?.available_aml_providers.map((provider) => provider.slug) ?? [];
		if (!slugs.length) return;

		try {
			isLoadingAmlKeys.value = true;
			const results = await Promise.all(
				slugs.map(async (slug) => {
					try {
						const data = await getApiAmlKeys(slug);
						return [slug, data || []] as const;
					} catch {
						return [slug, []] as const;
					}
				})
			);
			amlKeysByProvider.value = Object.fromEntries(results);
			syncCurrentAmlKeys();
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
					syncCurrentAmlKeys(data.provider_slug);
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

	const getAmlStatistics = async () => {
		try {
			isLoadingAmlStatistics.value = true;
			const data = await getApiAmlStatistics();
			if (data) amlStatistics.value = data;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingAmlStatistics.value = false;
		}
	};

	return {
		isLoadingAmlRiskRules,
		isLoadingAmlHistory,
		isLoadingAmlStatistics,
		amlHistory,
		amlSettings,
		amlStatistics,
		amlRiskRules,
		amlSignalCategories,
		formAmlScoreTransaction,
		amlHistoryPagination,
		amlKeys,
		amlHistoryFilter,
		connectedProviderSlugs,
		isHaveKeysCurrentAml,
		isCurrentProviderEnabled,
		syncCurrentAmlKeys,
		getAmlKeys,
		getAllAmlKeys,
		getAmlHistory,
		getAmlStatistics,
		getAmlSettings,
		getAmlRiskRules,
		putAmlRiskRules
	};
});
