import { defineStore } from "pinia";
import { ref } from "vue";
import { getApiAdminUsers, patchApiAdminUserBan, patchApiAdminUserUnBan } from "@dv-admin/utils/services/users";
import { parsePagination } from "@dv-admin/utils/helpers/parsePagination";
import type { IAdminUsersItemResponse } from "@dv-admin/utils/types/api/apiGo";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";

export const useUsersStore = defineStore("users", () => {
	const isLoading = ref<boolean>(false);
	const isLoadingBanOrUnBanUser = ref<Record<string, boolean>>({});
	const adminUsers = ref<IAdminUsersItemResponse[]>([]);
	const adminUsersPagination = ref<UItableMeta | null>(null);
	const adminUsersPage = ref(1);

	const getAdminUsers = async () => {
		try {
			isLoading.value = true;
			const data = await getApiAdminUsers({ page: adminUsersPage.value, page_size: 20 });
			if (data) {
				adminUsers.value = data.items;
				adminUsersPagination.value = parsePagination(data.pagination);
				adminUsersPage.value = data.pagination.page;
			}
		} catch (error) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const patchAdminUserBan = async (user_id: string) => {
		try {
			isLoadingBanOrUnBanUser.value[user_id] = true;
			await patchApiAdminUserBan(user_id);
			const findIndex = adminUsers.value.findIndex((item) => item.user_id === user_id);
			if (findIndex !== -1) adminUsers.value[findIndex].banned = true;
		} catch (error) {
			console.error(error);
		} finally {
			isLoadingBanOrUnBanUser.value[user_id] = false;
		}
	};

	const patchAdminUserUnBan = async (user_id: string) => {
		try {
			isLoadingBanOrUnBanUser.value[user_id] = true;
			await patchApiAdminUserUnBan(user_id);
			const findIndex = adminUsers.value.findIndex((item) => item.user_id === user_id);
			if (findIndex !== -1) adminUsers.value[findIndex].banned = false;
		} catch (error) {
			console.error(error);
		} finally {
			isLoadingBanOrUnBanUser.value[user_id] = false;
		}
	};

	return {
		isLoading,
		isLoadingBanOrUnBanUser,
		adminUsers,
		adminUsersPagination,
		adminUsersPage,
		getAdminUsers,
		patchAdminUserBan,
		patchAdminUserUnBan
	};
});
