import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@dv-admin/stores/auth";
import { checkSystemInfo } from "@dv-admin/router/middlewares/utils";
import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";

export const guest = async (to: RouteLocationNormalized, _: RouteLocationNormalized, next: NavigationGuardNext) => {
	if (!(await checkSystemInfo())) {
		return next({ name: "installer" });
	}
	// If registration is disabled, then redirect to login
	if (!useSystemSettingsStore().userRootSystemInfo) await useSystemSettingsStore().getSystemInfo();
	if (useSystemSettingsStore().userRootSystemInfo?.registration_state === "disabled" && to.name === "sign-up") {
		return next({ name: "sign-in" });
	}
	// Redirect to dashboard or quick-start
	if (useAuthStore().isLoggedIn) {
		if (!useUserSettingsStore().quickStartGuideSetting) await useUserSettingsStore().getUserSettings();
		if (useUserSettingsStore().quickStartGuideSetting?.value === "incompleted") {
			return next({ name: "quick-start" });
		} else {
			return next({ name: "dashboard" });
		}
	}
	return next();
};
