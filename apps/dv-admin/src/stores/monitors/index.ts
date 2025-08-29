import { defineStore } from "pinia";
import { ref } from "vue";
import { getApiMonitors, getApiMonitorsSlug } from "@dv-admin/services/api/monitors";
import type { IMonitorsCurrentTypeListResponse, IMonitorsResponse } from "@dv-admin/utils/types/api/apiGo";

export const useMonitorsStore = defineStore("monitors", () => {
	const isLoading = ref<boolean>(false);
	const isLoadingMonitorsSlug = ref<boolean>(false);
	const monitorsTypes = ref<IMonitorsResponse[]>([]);
	const monitorsCurrentTypeList = ref<IMonitorsCurrentTypeListResponse[]>([]);
	const getMonitors = async () => {
		try {
			isLoading.value = true;
			const data = await getApiMonitors();
			if (data) monitorsTypes.value = data;
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const getMonitorsSlug = async (slug: string) => {
		try {
			isLoadingMonitorsSlug.value = true;
			const data = await getApiMonitorsSlug(slug);
			if (data) monitorsCurrentTypeList.value = data;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingMonitorsSlug.value = false;
		}
	};

	const resetMonitorsSlug = () => {
		monitorsCurrentTypeList.value = [];
	};

	return {
		isLoading,
		isLoadingMonitorsSlug,
		monitorsTypes,
		monitorsCurrentTypeList,
		getMonitors,
		getMonitorsSlug,
		resetMonitorsSlug
	};
});
