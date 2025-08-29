import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@dv-admin/stores/auth";
import { checkSystemInfo } from "@dv-admin/router/middlewares/utils";

export const auth = async (to: RouteLocationNormalized, _: RouteLocationNormalized, next: NavigationGuardNext) => {
	if (!(await checkSystemInfo())) {
		return next({ name: "installer" });
	}
	if (!useAuthStore().isLoggedIn) {
		return next({ name: "sign-in" });
	}
	// If the user has not confirmed the mnemonic, then we redirect to confirmation-mnemonics
	if (!useAuthStore().user) await useAuthStore().getUser();
	if (useAuthStore().isConfirmSeedUser && to.name === "confirmation-mnemonics") return next({ name: "dashboard" });
	if (!useAuthStore().isConfirmSeedUser && to.name !== "confirmation-mnemonics")
		return next({ name: "confirmation-mnemonics" });
	return next();
};
