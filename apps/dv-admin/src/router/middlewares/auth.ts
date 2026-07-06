import type { RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@dv-admin/stores/auth";
import { checkSystemInfo } from "@dv-admin/router/middlewares/utils";

export const auth = async (to: RouteLocationNormalized, _: RouteLocationNormalized) => {
	if (!(await checkSystemInfo())) {
		return { name: "installer" };
	}
	if (!useAuthStore().isLoggedIn) {
		return { name: "sign-in" };
	}
	// If the user has not confirmed the mnemonic, then we redirect to confirmation-mnemonics
	if (!useAuthStore().user) await useAuthStore().getUser();
	if (useAuthStore().isConfirmSeedUser && to.name === "confirmation-mnemonics") return { name: "dashboard" };
	if (!useAuthStore().isConfirmSeedUser && to.name !== "confirmation-mnemonics")
		return { name: "confirmation-mnemonics" };
	return true;
};
