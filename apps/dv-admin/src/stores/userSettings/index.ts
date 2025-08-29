import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import { getApiUserSettings, postApiUserSettings } from "@dv-admin/services/api/systemSettings";
import type { ISettingsResponse } from "@dv-admin/utils/types/api/apiGo";
import { useGeneralStore } from "@dv-admin/stores/general";
const { notify } = useNotifications();

export const useUserSettingsStore = defineStore("userSettings", () => {
	const { otpGlobalCode } = storeToRefs(useGeneralStore());
	const { openOtpGlobalModal } = useGeneralStore();

	const isLoading = ref<boolean>(false);
	const isLoadingUpdateUserSettings = ref<boolean>(false);
	const userSettings = ref<ISettingsResponse[]>([]);

	const quickStartGuideSetting = computed(() =>
		userSettings.value.find((el) => el.name === "quick_start_guide_status")
	);

	const getUserSettings = async () => {
		try {
			isLoading.value = true;
			const data = await getApiUserSettings();
			if (data) userSettings.value = data;
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const postUserSettings = async (setting: ISettingsResponse, message = "Saved") => {
		try {
			if (setting.two_factor_verification_required && !otpGlobalCode.value) {
				openOtpGlobalModal(() => postUserSettings(setting, message));
				return;
			}
			isLoadingUpdateUserSettings.value = true;
			await postApiUserSettings(setting, otpGlobalCode.value);
			notify(message, "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingUpdateUserSettings.value = false;
		}
	};

	return {
		isLoading,
		isLoadingUpdateUserSettings,
		userSettings,
		quickStartGuideSetting,
		postUserSettings,
		getUserSettings
	};
});
