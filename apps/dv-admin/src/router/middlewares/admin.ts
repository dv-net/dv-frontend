import { useAuthStore } from "@dv-admin/stores/auth";
import { checkSystemInfo } from "@dv-admin/router/middlewares/utils";

export const admin = async () => {
	if (!(await checkSystemInfo())) return { name: "installer" };
	if (!useAuthStore().isLoggedIn) return { name: "sign-in" };
	if (!useAuthStore().user) await useAuthStore().getUser();
	if (!useAuthStore().isConfirmSeedUser) return { name: "confirmation-mnemonics" };
	if (!useAuthStore().isRootUser) return { name: "dashboard" };

	return true;
};
