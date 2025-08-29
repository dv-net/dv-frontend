import api from "@dv-admin/utils/plugins/api";
import type {
	INotificationsRequest,
	INotificationsResponse,
	INotificationsTypesResponse
} from "@dv-admin/utils/types/api/apiGo.ts";

export const getApiNotifications = async (params: INotificationsRequest): Promise<INotificationsResponse> => {
	const config = { params };
	const resp = await api.get(`/dv-admin/notifications/history`, config);
	return resp.data.data;
};

export const getApiNotificationsTypes = async (): Promise<INotificationsTypesResponse[]> => {
	const resp = await api.get(`/dv-admin/notifications/types`);
	return resp.data.data.types;
};
