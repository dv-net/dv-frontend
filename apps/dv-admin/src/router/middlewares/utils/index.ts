import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";

export const checkSystemInfo = async (): Promise<boolean> => {
	// Check if application is installed
	if (!useSystemSettingsStore().userRootSystemInfo) {
		await useSystemSettingsStore().getSystemInfo();
	}
	return !!useSystemSettingsStore().userRootSystemInfo?.initialized;
};
