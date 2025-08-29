import { defineStore } from "pinia";
import { ref } from "vue";
import type { IExchangePairsResponse } from "@dv-admin/utils/types/api/apiGo";
import { getApiExchangePairs, getApiExchangeUserPairs, putApiExchangePairs } from "@dv-admin/services/api/withdrawal";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import { useI18n } from "vue-i18n";

const { notify } = useNotifications();

export const useAutoExchangeStore = defineStore("autoExchange", () => {
	const { t } = useI18n();
	const isLoading = ref<boolean>(false);
	const isLoadingPutExchangePairs = ref<boolean>(false);
	const exchangePairs = ref<IExchangePairsResponse[]>([]);
	const exchangeUserPairs = ref<string[]>([]);

	const getAllExchangePairs = async (slug: string) => {
		try {
			isLoading.value = true;
			await Promise.all([getExchangePairs(slug), getExchangeUserPairs(slug)]);
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const getExchangePairs = async (slug: string) => {
		try {
			const data = await getApiExchangePairs(slug);
			if (data) exchangePairs.value = data;
		} catch (error: any) {
			throw error;
		}
	};

	const getExchangeUserPairs = async (slug: string) => {
		try {
			const data = await getApiExchangeUserPairs(slug);
			if (data) exchangeUserPairs.value = data.map((item) => item.display_name);
		} catch (error: any) {
			throw error;
		}
	};

	const putExchangePairs = async (slug: string) => {
		try {
			isLoadingPutExchangePairs.value = true;
			const result = exchangeUserPairs.value
				.map((item) => exchangePairs.value.find((el) => el.display_name.toUpperCase() === item.toUpperCase()))
				.filter(Boolean) as IExchangePairsResponse[];
			await putApiExchangePairs(slug, result);
			notify(t("Auto exchange saved"), "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingPutExchangePairs.value = false;
		}
	};

	const deleteExchangePairs = async (slug: string, pair: string) => {
		try {
			exchangeUserPairs.value = exchangeUserPairs.value.filter((item) => item !== pair);
		} catch (error: any) {
			throw error;
		}
	};

	return {
		isLoading,
		exchangePairs,
		exchangeUserPairs,
		isLoadingPutExchangePairs,
		getExchangePairs,
		getExchangeUserPairs,
		putExchangePairs,
		deleteExchangePairs,
		getAllExchangePairs
	};
});
