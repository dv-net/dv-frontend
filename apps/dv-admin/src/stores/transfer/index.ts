import { defineStore } from "pinia";
import { ref } from "vue";
import { deleteApiTransfer, getApiTransfer, getApiTransferPrefetch } from "@dv-admin/services/api/transfer";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import type {
	IPagination,
	ITransferItem,
	ITransferPrefetchResponse,
	ITransferRequest
} from "@dv-admin/utils/types/api/apiGo";
import { useI18n } from "vue-i18n";
const { notify } = useNotifications();

export const useTransferStore = defineStore("transfer", () => {
	const { t } = useI18n();
	const isLoadingPrefetch = ref<boolean>(true);
	const isLoadingTransferNew = ref<boolean>(true);
	const transferPrefetch = ref<ITransferPrefetchResponse[]>([]);
	const transferNew = ref<ITransferItem[]>([]);
	const transferAll = ref<ITransferItem[]>([]);
	const transferAllPagination = ref<IPagination | null>(null);
	const transferFailed = ref<ITransferItem[]>([]);
	const transferFailedPagination = ref<IPagination | null>(null);
	const transferCompleted = ref<ITransferItem[]>([]);
	const transferCompletedPagination = ref<IPagination | null>(null);

	const getTransferPrefetch = async () => {
		try {
			const data = await getApiTransferPrefetch();
			if (data) transferPrefetch.value = data;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingPrefetch.value = false;
		}
	};

	const getTransferNew = async () => {
		try {
			const params: ITransferRequest = {
				stages: ["in_progress"],
				page_size: 1000
			};
			const data = await getApiTransfer(params);
			if (data.items) transferNew.value = data.items;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingTransferNew.value = false;
		}
	};

	const getTransferAll = async () => {
		try {
			const params: ITransferRequest = {
				stages: ["completed", "failed"],
				page: transferAllPagination.value?.page || 1,
				page_size: 10
			};
			const data = await getApiTransfer(params);
			if (data.items) transferAll.value = data.items;
			if (data.pagination) transferAllPagination.value = data.pagination;
		} catch (error: any) {
			throw error;
		}
	};

	const getTransferCompleted = async () => {
		try {
			const params: ITransferRequest = {
				stages: ["completed"],
				page: transferCompletedPagination.value?.page || 1,
				page_size: 10
			};
			const data = await getApiTransfer(params);
			if (data.items) transferCompleted.value = data.items;
			if (data.pagination) transferCompletedPagination.value = data.pagination;
		} catch (error: any) {
			throw error;
		}
	};

	const getTransferFailed = async () => {
		try {
			const params: ITransferRequest = {
				stages: ["failed"],
				page: transferFailedPagination.value?.page || 1,
				page_size: 10
			};
			const data = await getApiTransfer(params);
			if (data.items) transferFailed.value = data.items;
			if (data.pagination) transferFailedPagination.value = data.pagination;
		} catch (error: any) {
			throw error;
		}
	};

	const deleteTransfer = async (ids: string[]) => {
		try {
			await deleteApiTransfer(ids);
			notify(t("Transfer deleted"), "success");
			transferAll.value = transferAll.value.filter((el) => el.id !== ids[0]);
			transferFailed.value = transferFailed.value.filter((el) => el.id !== ids[0]);
		} catch (error: any) {
			throw error;
		}
	};

	return {
		transferPrefetch,
		transferNew,
		transferAll,
		transferCompleted,
		transferFailed,
		transferAllPagination,
		transferFailedPagination,
		transferCompletedPagination,
		isLoadingPrefetch,
		isLoadingTransferNew,
		getTransferPrefetch,
		getTransferCompleted,
		getTransferFailed,
		getTransferNew,
		getTransferAll,
		deleteTransfer
	};
});
