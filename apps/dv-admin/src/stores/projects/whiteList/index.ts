import { defineStore } from "pinia";
// import { ref } from "vue";
// import {
// 	deleteApiWhitelistsProject,
// 	getApiWhitelistsProject,
// 	patchApiWhitelistsProject
// } from "@dv-admin/services/api/projects";
// import type { IWhitelistsPatchRequest } from "@dv-admin/utils/types/api/apiGo";
export const useWhiteListProjectStore = defineStore("whiteListProject", () => {
	// TODO: ====== Remove after 20.06.2024 ======
	// const addWhitelistsProject = ref<string>("");
	// const isLoadingDeleteWhiteList = ref<boolean>(false);
	// const whitelistsProject = ref<string[]>([]);

	// const getWhitelistsProject = async (uuid: string) => {
	// 	try {
	// 		whitelistsProject.value = await getApiWhitelistsProject(uuid);
	// 	} catch (error: any) {
	// 		throw error;
	// 	}
	// };
	// const patchWhitelistsProject = async () => {
	// 	try {
	// 		const body: IWhitelistsPatchRequest = {
	// 			ip: addWhitelistsProject.value
	// 		};
	// 		await patchApiWhitelistsProject(useProjectsStore().currentProject.id, body);
	// 		whitelistsProject.value.push(addWhitelistsProject.value);
	// 	} catch (error: any) {
	// 		throw error;
	// 	}
	// };
	// const deleteWhitelistsProject = async (ip: string) => {
	// 	try {
	// 		isLoadingDeleteWhiteList.value = true;
	// 		await deleteApiWhitelistsProject(useProjectsStore().currentProject.id, ip);
	// 		whitelistsProject.value = whitelistsProject.value.filter((item) => item !== ip);
	// 	} catch (error: any) {
	// 		throw error;
	// 	} finally {
	// 		isLoadingDeleteWhiteList.value = false;
	// 	}
	// };

	return {
		// whitelistsProject,
		// addWhitelistsProject,
		// isLoadingDeleteWhiteList,
		// getWhitelistsProject,
		// patchWhitelistsProject,
		// deleteWhitelistsProject
	};
});
