import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
	postApiExchangeKeyUpdates,
	getApiExchangeList,
	getApiExchangeDepositUpdate,
	deleteApiExchangeKeys,
	postApiExchangeToggleSwaps,
	postApiExchangeToggleWithdrawals,
	postApiExchangeTest
} from "@dv-admin/services/api/exchangeSettings";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import type {
	IExchangeDepositAddressesResponse,
	IExchangeListResponse,
	IExchangeTestRequest
} from "@dv-admin/utils/types/api/apiGo";
import { useI18n } from "vue-i18n";
import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
const { notify } = useNotifications();

export const useExchangeSettingsStore = defineStore("exchangeSettings", () => {
	const { t } = useI18n();

	const isLoading = ref<boolean>(false);
	const isLoadingDeleteKeys = ref<boolean>(false);
	const isLoadingUpdateKeys = ref<boolean>(false);
	const isLoadingExchangeToggle = ref<Record<string, boolean>>({});
	const isShowBannerSuccess = ref<boolean>(false);
	const exchangeList = ref<IExchangeListResponse | null>(null);
	const depositAddresses = ref<IExchangeDepositAddressesResponse[]>([]);
	const activeExchange = computed(() => exchangeList.value?.current_exchange);

	const getExchangeList = async () => {
		try {
			isLoading.value = true;
			const data = await getApiExchangeList();
			if (data) {
				exchangeList.value = data;
				exchangeList.value.exchanges = data.exchanges.sort((a, b) => (a.slug > b.slug ? 1 : -1));
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const getExchangeDepositUpdate = async (slug: string) => {
		try {
			const data = await getApiExchangeDepositUpdate(slug);
			if (data) depositAddresses.value = data;
		} catch (error: any) {
			throw error;
		}
	};

	const postExchangeKeyUpdates = async (slug: string, message: string) => {
		try {
			if (!exchangeList.value || !exchangeList.value?.exchanges?.length) return;
			isLoadingUpdateKeys.value = true;
			const findIndex: number = exchangeList.value.exchanges.findIndex((item) => item.slug === slug);
			if (findIndex === -1) return;
			exchangeList.value.exchanges[findIndex].keys = exchangeList.value.exchanges[findIndex].keys.map((item) => {
				return { ...item, value: item.value || null };
			});
			const accessKey = exchangeList.value.exchanges[findIndex].keys.find((item) => item.name === "access_key");
			const apiKey = exchangeList.value.exchanges[findIndex].keys.find((item) => item.name === "api_key");
			const secret = exchangeList.value.exchanges[findIndex].keys.find((item) => item.name === "secret_key");
			const passphrase = exchangeList.value.exchanges[findIndex].keys.find((item) => item.name === "pass_phrase");
			const key = accessKey?.value || apiKey?.value;
			const body: IExchangeTestRequest = {
				slug,
				credentials: {
					...(key ? { key } : {}),
					...(secret?.value ? { secret: secret.value } : {}),
					...(passphrase?.value ? { passphrase: passphrase.value } : {})
				}
			};
			// Check keys before connection
			await postApiExchangeTest(body);
			await postApiExchangeKeyUpdates(exchangeList.value.exchanges[findIndex].slug, {
				keys: exchangeList.value.exchanges[findIndex].keys
			});
			await Promise.all([
				useWithdrawalStore().getConnectedExchanges(),
				getExchangeDepositUpdate(exchangeList.value.exchanges[findIndex].slug)
			]);
			isShowBannerSuccess.value = true;
			notify(message, "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingUpdateKeys.value = false;
		}
	};

	const deleteExchangeKeys = async (slug: string) => {
		try {
			isLoadingDeleteKeys.value = true;
			await deleteApiExchangeKeys(slug);
			await useWithdrawalStore().getConnectedExchanges();
			notify(t("Crypto exchange keys deleted"), "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingDeleteKeys.value = false;
		}
	};

	const postExchangeToggle = async (type: string, new_state?: string) => {
		try {
			isLoadingExchangeToggle.value[type] = true;
			if (!exchangeList.value) return;
			const currentExchange: string | null = exchangeList.value.current_exchange;
			const newState = new_state === "disabled" ? "enabled" : "disabled";
			if (!currentExchange) {
				return notify(t("Set the current exchange"));
			}
			if (type === "withdrawal_state") {
				await postApiExchangeToggleWithdrawals(currentExchange, newState);
				if (exchangeList.value) exchangeList.value.withdrawal_state = newState;
				notify(t(newState === "enabled" ? "Withdrawals are enabled" : "Withdrawals are disabled"), "success");
			} else if (type === "swap_state") {
				await postApiExchangeToggleSwaps(currentExchange, newState);
				if (exchangeList.value) exchangeList.value.swap_state = newState;
				notify(t(newState === "enabled" ? "Exchanges are enabled" : "Exchanges are disabled"), "success");
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingExchangeToggle.value[type] = false;
		}
	};

	const resetExchangeSettings = () => {
		isShowBannerSuccess.value = false;
	};

	return {
		isLoading,
		isLoadingUpdateKeys,
		isLoadingDeleteKeys,
		isLoadingExchangeToggle,
		exchangeList,
		isShowBannerSuccess,
		depositAddresses,
		activeExchange,
		deleteExchangeKeys,
		getExchangeList,
		postExchangeKeyUpdates,
		resetExchangeSettings,
		postExchangeToggle
	};
});
