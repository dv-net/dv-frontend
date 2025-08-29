import router from "@dv-admin/router";
import { useAuthStore } from "@dv-admin/stores/auth";
import { useGeneralStore } from "@dv-admin/stores/general";
import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
import i18n from "@dv-admin/utils/plugins/i18n";
import { loadLocaleMessages } from "@dv-admin/utils/plugins/i18n/helpers";

export const getStartDataProject = async () => {
	try {
		await Promise.all([
			useGeneralStore().getDictionary(),
			useGeneralStore().getSystemVersions(),
			useAuthStore().getInfoUser2Fa(),
			useAuthStore().setOwnerDataPolling(),
			useHotWalletsStore().setWalletHotBalancePolling(),
			useUserSettingsStore().getUserSettings()
		]);
	} catch (error: any) {
		console.error(error);
	}
};

export const intiRequests = async () => {
	try {
		await router.isReady();
		await loadLocaleMessages(i18n.global.locale.value);
		if (useAuthStore().isLoggedIn) {
			await useAuthStore().initStore();
		}
	} catch (error: any) {
		console.error(error);
	}
};
