import { defineStore } from "pinia";
import { ref } from "vue";
import {
	deleteApiWhitelistsProject,
	getApiWhitelistsProject,
	patchApiWhitelistsProject
} from "@dv-admin/services/api/projects";
import type { IWhitelistsResponse } from "@dv-admin/utils/types/api/apiGo.ts";

export const useWhiteListProjectStore = defineStore("whiteListProject", () => {
	const isLoadingDeleteWhiteList = ref<Record<string, boolean>>({});
	const whitelistsProject = ref<IWhitelistsResponse[]>([]);

	const getWhitelistsProject = async (uuid: string) => {
		try {
			const data = await getApiWhitelistsProject(uuid);
			if (data) {
				whitelistsProject.value = data.map((item) => ({ ip: item }));
			}
		} catch (error: any) {
			throw error;
		}
	};
	const patchWhitelistsProject = async (uuid: string, ip: string) => {
		try {
			await patchApiWhitelistsProject(uuid, ip);
			whitelistsProject.value.push({ ip });
		} catch (error: any) {
			throw error;
		}
	};
	const deleteWhitelistsProject = async (uuid: string, ip: string) => {
		try {
			isLoadingDeleteWhiteList.value[ip] = true;
			await deleteApiWhitelistsProject(uuid, ip);
			whitelistsProject.value = whitelistsProject.value.filter((item) => item.ip !== ip);
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingDeleteWhiteList.value[ip] = false;
		}
	};

	return {
		whitelistsProject,
		isLoadingDeleteWhiteList,
		getWhitelistsProject,
		patchWhitelistsProject,
		deleteWhitelistsProject
	};
});
