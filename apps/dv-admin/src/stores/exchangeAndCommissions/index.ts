import { defineStore, storeToRefs } from "pinia";
import { getApiCurrenciesRate, putApiCurrenciesRate } from "@dv-admin/services/api/exchangeAndCommissions";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import { ref } from "vue";
import type { ICurrenciesRateResponse } from "@dv-admin/utils/types/api/apiGo";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@dv-admin/stores/auth";
const { notify } = useNotifications();

export const useExchangeAndCommissionsStore = defineStore("useExchangeAndCommissions", () => {
	const { user } = storeToRefs(useAuthStore());

	const { t } = useI18n();
	const isLoading = ref<boolean>(false);
	const isLoadingRate = ref<boolean>(false);
	const currentSource = ref<string>(user.value?.rate_source || "binance");
	const currenciesRate = ref<ICurrenciesRateResponse[]>([]);

	const getCurrenciesRate = async () => {
		try {
			isLoading.value = true;
			const data = await getApiCurrenciesRate(currentSource.value);
			if (data) currenciesRate.value = data;
		} catch (error: any) {
			currenciesRate.value = [];
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const putCurrenciesRate = async (rate_scale: string, rate_source: string) => {
		try {
			isLoadingRate.value = true;
			await putApiCurrenciesRate(rate_scale, rate_source);
			await getCurrenciesRate();
			notify(t("Crypto exchange settings have been changed"), "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingRate.value = false;
		}
	};

	return {
		isLoading,
		isLoadingRate,
		currentSource,
		currenciesRate,
		getCurrenciesRate,
		putCurrenciesRate
	};
});
