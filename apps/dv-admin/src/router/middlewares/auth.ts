import type { RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@dv-admin/stores/auth";
import { checkSystemInfo } from "@dv-admin/router/middlewares/utils";

export const auth = async (to: RouteLocationNormalized) => {
	if (!(await checkSystemInfo())) {
		return { name: "installer" };
	}
	if (!useAuthStore().isLoggedIn) {
		return { name: "sign-in" };
	}
	if (!useAuthStore().user) await useAuthStore().getUser();
	if (useAuthStore().isConfirmSeedUser && to.name === "confirmation-mnemonics") return { name: "dashboard" };
	if (!useAuthStore().isConfirmSeedUser && to.name !== "confirmation-mnemonics") {
		return { name: "confirmation-mnemonics" };
	}
};
