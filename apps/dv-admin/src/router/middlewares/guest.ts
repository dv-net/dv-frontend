import type { RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@dv-admin/stores/auth";
import { checkSystemInfo } from "@dv-admin/router/middlewares/utils";
import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";

export const guest = async (to: RouteLocationNormalized) => {
	if (!(await checkSystemInfo())) {
		return { name: "installer" };
	}
	if (!useSystemSettingsStore().userRootSystemInfo) await useSystemSettingsStore().getSystemInfo();
	if (useSystemSettingsStore().userRootSystemInfo?.registration_state === "disabled" && to.name === "sign-up") {
		return { name: "sign-in" };
	}
	if (useAuthStore().isLoggedIn) {
		if (!useUserSettingsStore().quickStartGuideSetting) await useUserSettingsStore().getUserSettings();
		if (useUserSettingsStore().quickStartGuideSetting?.value === "incompleted") {
			return { name: "quick-start" };
		}
		return { name: "dashboard" };
	}
};
