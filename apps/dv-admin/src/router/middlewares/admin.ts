import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@dv-admin/stores/auth";
import { checkSystemInfo } from "@dv-admin/router/middlewares/utils";

export const admin = async (to: RouteLocationNormalized, _: RouteLocationNormalized, next: NavigationGuardNext) => {
	if (!(await checkSystemInfo())) return next({ name: "installer" });
	if (!useAuthStore().isLoggedIn) return next({ name: "sign-in" });
	if (!useAuthStore().user) await useAuthStore().getUser();
	if (!useAuthStore().isConfirmSeedUser) return next({ name: "confirmation-mnemonics" });
	if (!useAuthStore().isRootUser) return next({ name: "dashboard" });
	return next();
};
