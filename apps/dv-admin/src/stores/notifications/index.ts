import { defineStore } from "pinia";
import { ref } from "vue";
import { getApiNotifications, getApiNotificationsTypes } from "@dv-admin/services/api/notifications";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
import type {
	INotificationsItemResponse,
	INotificationsRequest,
	INotificationsTypesResponse
} from "@dv-admin/utils/types/api/apiGo.ts";
import { parsePagination } from "@dv-admin/utils/helpers/parsePagination.ts";

export const useNotificationsStore = defineStore("notifications", () => {
	const isLoading = ref<boolean>(false);
	const notificationsList = ref<INotificationsItemResponse[]>([]);
	const notificationsTypes = ref<INotificationsTypesResponse[]>([]);
	const notificationsPagination = ref<UItableMeta | null>(null);
	const notificationsFilter = ref<INotificationsRequest>({
		page: 1,
		types: null,
		destinations: null,
		channels: null
	});

	const getNotifications = async () => {
		try {
			isLoading.value = true;
			const data = await getApiNotifications(notificationsFilter.value);
			if (data) {
				notificationsList.value = data.items;
				notificationsPagination.value = parsePagination(data.pagination);
				notificationsFilter.value.page = data.pagination.page || notificationsFilter.value.page;
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const getNotificationsTypes = async () => {
		try {
			const data = await getApiNotificationsTypes();
			if (data) notificationsTypes.value = data;
		} catch (error: any) {
			throw error;
		}
	};

	return {
		isLoading,
		notificationsList,
		notificationsPagination,
		notificationsFilter,
		notificationsTypes,
		getNotifications,
		getNotificationsTypes
	};
});
