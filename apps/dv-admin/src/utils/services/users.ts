import api from "@dv-admin/utils/libs/axios";
import type { IAdminUsersResponse } from "@dv-admin/utils/types/api/apiGo";

export const getApiAdminUsers = async (params?: {
	page?: number;
	page_size?: number;
}): Promise<IAdminUsersResponse> => {
	const resp = await api.get("/dv-admin/root/users", { params });
	return resp.data.data;
};

export const patchApiAdminUserBan = async (user_id: string) => {
	await api.patch("/dv-admin/root/ban", null, { params: { user_id } });
};

export const patchApiAdminUserUnBan = async (user_id: string) => {
	await api.patch("/dv-admin/root/unban", null, { params: { user_id } });
};
