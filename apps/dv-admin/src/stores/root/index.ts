import { defineStore } from "pinia";
import { ref } from "vue";
import { parsePagination } from "@dv-admin/utils/helpers/parsePagination";
import { getStores, rejectStore, verifyStore } from "@dv-admin/utils/services/root";
import { STORE_VERIFICATION_STATUS } from "@dv-admin/utils/constants/root";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
import type { IGetStoresRequest, IStoreValidationItemResponse } from "@dv-admin/utils/types/api/apiGo";

export const useRootStore = defineStore("root", () => {
	const isLoadingPending = ref<boolean>(false);
	const isLoadingRejected = ref<boolean>(false);
	const pendingStoresList = ref<IStoreValidationItemResponse[]>([]);
	const pendingPagination = ref<UItableMeta | null>(null);
	const rejectedStoresList = ref<IStoreValidationItemResponse[]>([]);
	const rejectedPagination = ref<UItableMeta | null>(null);
	const isLoadingVerify = ref<Record<string, boolean>>({});
	const isLoadingReject = ref<Record<string, boolean>>({});
	const pendingFilter = ref<IGetStoresRequest>({
		page: 1,
		page_size: 6,
		status: STORE_VERIFICATION_STATUS.PENDING
	});
	const rejectedFilter = ref<IGetStoresRequest>({
		page: 1,
		page_size: 20
	});

	const getPendingStoresList = async () => {
		try {
			isLoadingPending.value = true;
			const data = await getStores(pendingFilter.value);
			if (data) {
				pendingStoresList.value = data.items;
				pendingPagination.value = parsePagination(data.pagination);
				pendingFilter.value.page = data.pagination.page || pendingFilter.value.page;
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingPending.value = false;
		}
	};

	const getRejectedStoresList = async () => {
		try {
			isLoadingRejected.value = true;
			const data = await getStores({
				page: rejectedFilter.value.page,
				page_size: rejectedFilter.value.page_size
			});
			if (data) {
				rejectedStoresList.value = data.items;
				rejectedPagination.value = parsePagination(data.pagination);
				rejectedFilter.value.page = data.pagination.page || rejectedFilter.value.page;
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingRejected.value = false;
		}
	};

	const getStoresLists = async () => {
		await Promise.all([getPendingStoresList(), getRejectedStoresList()]);
	};

	const verifyStoreById = async (id: string) => {
		try {
			isLoadingVerify.value[id] = true;
			await verifyStore(id);
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingVerify.value[id] = false;
		}
	};

	const rejectStoreById = async (id: string, reason: string) => {
		try {
			isLoadingReject.value[id] = true;
			await rejectStore(id, { reason });
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingReject.value[id] = false;
		}
	};

	return {
		isLoadingPending,
		isLoadingRejected,
		pendingStoresList,
		pendingPagination,
		pendingFilter,
		rejectedStoresList,
		rejectedPagination,
		rejectedFilter,
		isLoadingVerify,
		isLoadingReject,
		getPendingStoresList,
		getRejectedStoresList,
		getStoresLists,
		verifyStoreById,
		rejectStoreById
	};
});
