import {
	getApiCurrenciesProject,
	getApiOneProject,
	getApiProjects,
	getApiStoreArchivedList,
	getApiStoreSecret,
	getApiStoreSettingList,
	postApiStoreArchive,
	postApiStoreSecret,
	postApiStoreUnarchive,
	putApiOneProject
} from "@dv-admin/services/api/projects";
import type {
	ICurrencyStore,
	IStoreResponse,
	IStoreSettingsList,
} from "@dv-admin/utils/types/api/apiGo";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { useGeneralStore } from "@dv-admin/stores/general";
import { useApiKeysProjectStore } from "@dv-admin/stores/projects/apiKeys";
import { useProjectsWebhooksStore } from "@dv-admin/stores/projects/webhooks";
import { webhooksFormStartData } from "@dv-admin/stores/projects/utils";
import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";
import { useAuthStore } from "@dv-admin/stores/auth";

const { notify } = useNotifications();

export const useProjectsStore = defineStore("projects", () => {
	const { keysProject } = storeToRefs(useApiKeysProjectStore());
	const { webhooksProject } = storeToRefs(useProjectsWebhooksStore());
	const { dictionary, otpGlobalCode } = storeToRefs(useGeneralStore());
	const { getRootSettings } = useSystemSettingsStore();
	const { openOtpGlobalModal } = useGeneralStore();
	const { getWebhooksProject } = useProjectsWebhooksStore();
	const { getKeyProject } = useApiKeysProjectStore();

	const isLoading = ref<boolean>(false);
	const isLoadingEditProject = ref<boolean>(false);
	const isLoadingGenerateSecretKey = ref<boolean>(false);
	const webhooksSecret = ref<string>("");
	const currentProject = ref<IStoreResponse | null>(null);
	const projects = ref<IStoreResponse[]>([]);
	const currenciesProject = ref<ICurrencyStore[]>([]);
	const checkedCurrenciesProject = ref<string[]>([]);
	const selectAllCurrenciesProject = ref<boolean>(false);
	const selectedProject = ref<string | null>(null);
	const archivedProjects = ref<IStoreResponse[]>([]);
	const storeSettingList = ref<IStoreSettingsList[]>([]);

	// CRUD for project information
	const getProjects = async () => {
		try {
			isLoading.value = true;
			projects.value = await getApiProjects();
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};
	const getStoreArchivedList = async () => {
		try {
			isLoading.value = true;
			archivedProjects.value = await getApiStoreArchivedList();
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};
	const postStoreArchive = async (uuid: string, message: string) => {
		try {
			if (!otpGlobalCode.value) {
				openOtpGlobalModal(() => postStoreArchive(uuid, message));
			} else {
				await postApiStoreArchive(uuid, otpGlobalCode.value);
				notify(message, "success");
				await getProjects();
			}
		} catch (error: any) {
			throw error;
		}
	};
	const postStoreUnarchive = async (uuid: string) => {
		try {
			if (!otpGlobalCode.value) {
				openOtpGlobalModal(() => postStoreUnarchive(uuid));
			} else {
				await postApiStoreUnarchive(uuid, otpGlobalCode.value);
				await getStoreArchivedList();
			}
		} catch (error: any) {
			throw error;
		}
	};
	const getAllInfoProjects = async (uuid: string) => {
		try {
			isLoading.value = true;
			await Promise.all([
				useAuthStore().isRootUser ? getRootSettings() : Promise.resolve(),
				getOneProjects(uuid),
				getKeyProject(uuid),
				getWebhooksProject(uuid),
				getStoreSecret(uuid),
				getStoreSettingList(uuid),
				// postApiStoreSetting(uuid, { name: "external_wallet_email_notification", value: "disabled" }),
			]);
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};
	const getStoreSecret = async (uuid: string) => {
		try {
			const secret = await getApiStoreSecret(uuid);
			if (secret) webhooksSecret.value = secret;
		} catch (error: any) {
			throw error;
		}
	};
	const getStoreSettingList = async (uuid: string) => {
		try {
			const data = await getApiStoreSettingList(uuid);
			if (data) {
				storeSettingList.value = data.map(item => ({ ...item, value: item.value === "enabled" }));
			}
		} catch (error: any) {
			throw error;
		}
	};
	const postStoreSecret = async (uuid: string, message: string) => {
		try {
			isLoadingGenerateSecretKey.value = true;
			const secret = await postApiStoreSecret(uuid);
			if (secret) webhooksSecret.value = secret;
			notify(message, "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingGenerateSecretKey.value = false;
		}
	};
	const getOneProjects = async (uuid: string) => {
		try {
			const data = await getApiOneProject(uuid);
			if (data) {
				currentProject.value = data;
				await getCurrenciesProject(uuid);
			}
		} catch (error: any) {
			throw error;
		}
	};
	const putOneProject = async (message: string) => {
		try {
			if (!currentProject.value) {
				return notify("Unknown error");
			}
			isLoadingEditProject.value = true;
			await putApiOneProject(currentProject.value);
			notify(message, "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingEditProject.value = false;
		}
	};
	const getCurrenciesProject = async (uuid: string) => {
		try {
			const data = await getApiCurrenciesProject(uuid);
			if (data) {
				if (dictionary.value?.available_currencies?.length) {
					currenciesProject.value = dictionary.value.available_currencies.map((item) => ({
						currency_id: item.id,
						code: item.code,
						name: item.name,
						enabled: data.includes(item.id)
					}));
				}
				checkedCurrenciesProject.value = data;
				selectAllCurrenciesProject.value = currenciesProject.value.length === data.length;
			}
		} catch (error: any) {
			throw error;
		}
	};

	const resetCurrentProject = () => {
		currentProject.value = null;
		webhooksSecret.value = "";
		keysProject.value = [];
		currenciesProject.value = [];
		checkedCurrenciesProject.value = [];
		selectAllCurrenciesProject.value = false;
		webhooksProject.value = structuredClone(webhooksFormStartData);
	};

	return {
		projects,
		isLoading,
		isLoadingEditProject,
		currentProject,
		currenciesProject,
		webhooksSecret,
		selectedProject,
		isLoadingGenerateSecretKey,
		archivedProjects,
		checkedCurrenciesProject,
		selectAllCurrenciesProject,
		storeSettingList,

		postStoreSecret,
		postStoreArchive,
		postStoreUnarchive,
		getStoreArchivedList,
		getProjects,
		getAllInfoProjects,
		getOneProjects,
		getStoreSettingList,
		putOneProject,
		getCurrenciesProject,
		resetCurrentProject
	};
});
