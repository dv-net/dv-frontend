import router from "@pay/router";
import i18n from "@pay/utils/plugins/i18n";
import { loadLocaleMessages } from "@pay/utils/plugins/i18n/helpers";

export const getStartDataProject = async () => {
	try {
		await Promise.all([]);
	} catch (error: any) {
		console.error(error);
	}
};

export const intiRequests = async () => {
	try {
		await router.isReady();
		await loadLocaleMessages(i18n.global.locale.value);
	} catch (error: any) {
		console.error(error);
	}
};
