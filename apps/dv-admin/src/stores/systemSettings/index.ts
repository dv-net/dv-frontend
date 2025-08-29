import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import type { ISettingData, ISettingsResponse, ISystemInfoResponse } from "@dv-admin/utils/types/api/apiGo";
import {
	deleteApiRootSetting,
	getApiProcessingCallbackUrl,
	getApiRootSettings,
	getApiSystemInfo,
	postApiProcessingCallbackUrl,
	postApiRootSetting
} from "@dv-admin/services/api/systemSettings";
import { splitDomain } from "@shared/utils/helpers/general";
import { useGeneralStore } from "@dv-admin/stores/general";

export const useSystemSettingsStore = defineStore("systemSettings", () => {
	const { otpGlobalCode } = storeToRefs(useGeneralStore());
	const { openOtpGlobalModal } = useGeneralStore();

	const isLoading = ref<boolean>(false);
	const userRootSystemInfo = ref<ISystemInfoResponse | null>(null);
	const rootSettings = ref<ISettingsResponse[]>([]);
	const rootGroupSettings = ref<ISettingData>({ general: [], mailer: [], processing: [] });
	const callbackDomain = ref<string>("");
	const callbackPathname = ref<string>("");

	const getSystemInfo = async () => {
		try {
			const data = await getApiSystemInfo();
			if (data) userRootSystemInfo.value = data;
		} catch (error: any) {
			throw error;
		}
	};

	const getRootSettings = async () => {
		try {
			isLoading.value = true;
			const data = await getApiRootSettings();
			const dataCallbackUrl = await getApiProcessingCallbackUrl();
			if (data) {
				rootSettings.value = data;
				// Group settings
				rootGroupSettings.value = data.reduce<ISettingData>(
					(acc, item) => {
						const labels: Set<string> = new Set(item.name.split("_"));
						if (labels.has("processing")) {
							acc.processing.push(item);
						} else if (labels.has("mailer")) {
							acc.mailer.push(item);
						} else {
							acc.general.push(item);
						}
						return acc;
					},
					{ general: [], mailer: [], processing: [] }
				);
				rootGroupSettings.value.mailer = rootGroupSettings.value.mailer.filter((el) => el.name !== "mailer_protocol");
			}
			if (dataCallbackUrl) {
				const result = splitDomain(dataCallbackUrl);
				if (!result) return;
				callbackDomain.value = result.base;
				callbackPathname.value = result.path;
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const postRootSetting = async (field: string, isInput?: boolean) => {
		try {
			const find: ISettingsResponse | undefined = rootSettings.value.find((item) => item.name === field);
			if (!find) return;
			if (find.two_factor_verification_required && !otpGlobalCode.value) {
				openOtpGlobalModal(() => postRootSetting(field, isInput));
				return;
			}
			if (isInput) {
				find.value
					? await postApiRootSetting(find, otpGlobalCode.value)
					: await deleteApiRootSetting(field, otpGlobalCode.value);
			} else {
				await postApiRootSetting(find, otpGlobalCode.value);
			}
		} catch (error: any) {
			throw error;
		}
	};

	const postProcessingCallbackUrl = async () => {
		try {
			const fullUrl: string = callbackDomain.value + callbackPathname.value;
			const result = splitDomain(fullUrl);
			if (!result) return;
			await postApiProcessingCallbackUrl(callbackDomain.value);
		} catch (error: any) {
			throw error;
		}
	};

	return {
		isLoading,
		callbackDomain,
		callbackPathname,
		userRootSystemInfo,
		rootSettings,
		rootGroupSettings,
		getSystemInfo,
		postRootSetting,
		getRootSettings,
		postProcessingCallbackUrl
	};
});
