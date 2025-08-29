import { defineStore } from "pinia";
import { ref } from "vue";
import {
	deleteApiExchangeWithdrawalSetting,
	getApiCurrenciesRateSource,
	getApiExchangeChains,
	getApiExchangeWithdrawalRules,
	getApiExchangeWithdrawalSetting,
	postApiExchangeWithdrawalSetting,
	patchApiExchangeWithdrawalSetting
} from "@dv-admin/services/api/withdrawal";
import type {
	ICurrenciesRateSource,
	IExchangeChainsResponse,
	IExchangeWithdrawalRulesResponse,
	IWithdrawalSettingRequest,
	IWithdrawalSettingResponse
} from "@dv-admin/utils/types/api/apiGo";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import { useI18n } from "vue-i18n";

const { notify } = useNotifications();

export const useWithdrawalExchangeStore = defineStore("withdrawalExchange", () => {
	const { t } = useI18n();
	const isLoadingPostWithdrawalSetting = ref<boolean>(false);
	const isLoadingExchangeWithdrawalSettingList = ref<boolean>(false);
	const isLoadingPatchWithdrawalSetting = ref<boolean>(false);
	const exchangeChainsList = ref<IExchangeChainsResponse[]>([]);
	const exchangeWithdrawalSettingList = ref<IWithdrawalSettingResponse[]>([]);
	const withdrawalRules = ref<IExchangeWithdrawalRulesResponse[]>([]);
	const withdrawalCurrenciesRateSource = ref<ICurrenciesRateSource[]>([]);

	const getExchangeChains = async (slug: string) => {
		try {
			const data = await getApiExchangeChains(slug);
			if (data) exchangeChainsList.value = data;
		} catch (error: any) {
			throw error;
		}
	};

	const getExchangeWithdrawalRules = async (slug: string) => {
		try {
			const dataRules = await getApiExchangeWithdrawalRules(slug);
			if (dataRules) withdrawalRules.value = dataRules;
			const dataRate = await getApiCurrenciesRateSource(slug);
			if (dataRate) withdrawalCurrenciesRateSource.value = dataRate;
		} catch (error: any) {
			throw error;
		}
	};

	const getExchangeWithdrawalSetting = async (slug: string) => {
		try {
			isLoadingExchangeWithdrawalSettingList.value = true;
			const data = await getApiExchangeWithdrawalSetting(slug);
			if (data) exchangeWithdrawalSettingList.value = data;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingExchangeWithdrawalSettingList.value = false;
		}
	};

	const postExchangeWithdrawalSetting = async (slug: string, body: IWithdrawalSettingRequest) => {
		try {
			isLoadingPostWithdrawalSetting.value = true;
			const currency_id = exchangeChainsList.value.find(
				(item) => item.chain === body.chain && item.ticker === body.ticker
			)?.currency_id;
			if (!currency_id) return;
			body.currency_id = currency_id;
			const data = await postApiExchangeWithdrawalSetting(slug, body);
			if (data) exchangeWithdrawalSettingList.value.push(data);
			notify(t("Rule added"), "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingPostWithdrawalSetting.value = false;
		}
	};

	const patchExchangeWithdrawalSetting = async (slug: string, settingId: string, enabled: boolean) => {
		try {
			isLoadingPatchWithdrawalSetting.value = true;
			const data = await patchApiExchangeWithdrawalSetting(slug, settingId, enabled);
			if (data) {
				const setting = exchangeWithdrawalSettingList.value.find((el) => el.id === settingId);
				if (setting) setting.enabled = data.enabled;
			}
			notify(t(data.enabled ? "Rule enabled" : "Rule disabled"), "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingPatchWithdrawalSetting.value = false;
		}
	};

	const deleteExchangeWithdrawalSetting = async (slug: string, id: string) => {
		try {
			exchangeWithdrawalSettingList.value = exchangeWithdrawalSettingList.value.filter((item) => item.id !== id);
			await deleteApiExchangeWithdrawalSetting(slug, id);
			notify(t("Rule deleted"), "success");
		} catch (error: any) {
			throw error;
		}
	};

	return {
		exchangeChainsList,
		isLoadingExchangeWithdrawalSettingList,
		isLoadingPostWithdrawalSetting,
		isLoadingPatchWithdrawalSetting,
		exchangeWithdrawalSettingList,
		withdrawalRules,
		withdrawalCurrenciesRateSource,
		getExchangeWithdrawalSetting,
		postExchangeWithdrawalSetting,
		patchExchangeWithdrawalSetting,
		getExchangeChains,
		getExchangeWithdrawalRules,
		deleteExchangeWithdrawalSetting
	};
});
