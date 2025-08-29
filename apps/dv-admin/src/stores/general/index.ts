import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getApiDictionary, getApiSystemVersions } from "@dv-admin/services/api/general";
import type { IDictionary, IDictionaryItemTimezones, ISystemVersions } from "@dv-admin/utils/types/api/apiGo";

export const useGeneralStore = defineStore("general", () => {
	const isLoading = ref<boolean>(false);
	const isLoadingDictionary = ref<boolean>(false);
	const dictionary = ref<IDictionary | null>(null);
	const systemVersions = ref<ISystemVersions | null>(null);
	const dictionaryTimezones = ref<IDictionaryItemTimezones[]>([]);
	const precisionCurrency = ref<Record<string, number>>({});
	const bitcoinLikeNetworks = ref<string[]>([]);
	const otpGlobalCode = ref<string | null>(null);
	const isShowOtpGlobalModal = ref<boolean>(false);
	const otpGlobalCallback = ref<(() => Promise<void>) | null>(null);

	const openOtpGlobalModal = (otpCallbackFn: () => Promise<void>) => {
		isShowOtpGlobalModal.value = true;
		otpGlobalCallback.value = otpCallbackFn;
	};

	const getDictionary = async (suppressNotify: boolean = false) => {
		try {
			isLoadingDictionary.value = true;
			const data = await getApiDictionary(suppressNotify);
			if (data) {
				dictionary.value = data;
				if (dictionary.value?.available_currencies?.length) {
					bitcoinLikeNetworks.value = dictionary.value.available_currencies
						.filter((item) => item.is_bitcoin_like)
						.map((item) => item.id);
					precisionCurrency.value = dictionary.value.available_currencies.reduce(
						(acc: Record<string, number>, item) => {
							acc[item.id] = item.precision;
							return acc;
						},
						{}
					);
				}
				dictionary.value.available_aml_providers.sort();
				dictionary.value.available_rate_sources = dictionary.value.available_rate_sources.sort((a) =>
					a.includes("dv-") ? 1 : -1
				);
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingDictionary.value = false;
		}
	};

	const getSystemVersions = async (suppressNotify: boolean = false) => {
		try {
			isLoading.value = true;
			const data = await getApiSystemVersions(suppressNotify);
			if (data) systemVersions.value = data;
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const hasNewVersion = computed<boolean>(
		() =>
			systemVersions.value?.new_backend_version?.need_for_update ||
			!!systemVersions.value?.new_processing_version?.need_for_update
	);

	return {
		isLoadingDictionary,
		otpGlobalCode,
		bitcoinLikeNetworks,
		otpGlobalCallback,
		isShowOtpGlobalModal,
		dictionary,
		precisionCurrency,
		hasNewVersion,
		dictionaryTimezones,
		systemVersions,
		isLoading,
		getDictionary,
		openOtpGlobalModal,
		getSystemVersions
	};
});
