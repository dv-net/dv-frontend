import { defineStore } from "pinia";
import { ref } from "vue";
import { getApiKeyProject, postApiKeyProject } from "@dv-admin/services/api/projects";
import type { IStoreApiKeyResponse } from "@dv-admin/utils/types/api/apiGo";
import { useNotifications } from "@shared/utils/composables/useNotifications";

const { notify } = useNotifications();

export const useApiKeysProjectStore = defineStore("apiKeysProject", () => {
	const isLoadingCreateApiKey = ref<Record<string, boolean>>({});
	const keysProject = ref<IStoreApiKeyResponse[]>([]);

	const getKeyProject = async (uuid: string) => {
		try {
			const data = await getApiKeyProject(uuid);
			if (data) keysProject.value = data;
		} catch (error: any) {
			throw error;
		}
	};
	const postKeyProject = async (uuid: string, idApiKey: string, message: string) => {
		try {
			isLoadingCreateApiKey.value[idApiKey] = true;
			const data = await postApiKeyProject(uuid);
			if (data) keysProject.value = [data];
			notify(message, "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingCreateApiKey.value[idApiKey] = false;
		}
	};

	return {
		isLoadingCreateApiKey,
		keysProject,
		getKeyProject,
		postKeyProject
	};
});
