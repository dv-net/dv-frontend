import api from "@dv-admin/utils/plugins/api";
import type { IAdminUsersResponse } from "@dv-admin/utils/types/api/apiGo";

export const getApiAdminUsers = async (): Promise<IAdminUsersResponse> => {
	const resp = await api.get("/dv-admin/admin/users");
	return resp.data.data;
};

export const patchApiAdminUserBan = async (user_id: string) => {
	await api.patch(`/dv-admin/admin/ban?user_id=${user_id}`);
};

export const patchApiAdminUserUnBan = async (user_id: string) => {
	await api.patch(`/dv-admin/admin/unban?user_id=${user_id}`);
};
