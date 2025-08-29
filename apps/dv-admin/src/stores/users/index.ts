import { defineStore } from "pinia";
import { ref } from "vue";
import { getApiAdminUsers, patchApiAdminUserBan, patchApiAdminUserUnBan } from "@dv-admin/services/api/users";
import type { IAdminUsersItemResponse } from "@dv-admin/utils/types/api/apiGo";

export const useUsersStore = defineStore("users", () => {
	const isLoading = ref<boolean>(false);
	const isLoadingBanOrUnBanUser = ref<Record<string, boolean>>({});
	const adminUsers = ref<IAdminUsersItemResponse[]>([]);

	// Root user settings
	const getAdminUsers = async () => {
		isLoading.value = true;
		try {
			const data = await getApiAdminUsers();
			if (data.items) adminUsers.value = data.items;
		} catch (error: any) {
			throw error;
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
		} catch (error: any) {
			throw error;
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
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingBanOrUnBanUser.value[user_id] = false;
		}
	};

	return {
		isLoading,
		isLoadingBanOrUnBanUser,
		adminUsers,
		getAdminUsers,
		patchAdminUserBan,
		patchAdminUserUnBan
	};
});
