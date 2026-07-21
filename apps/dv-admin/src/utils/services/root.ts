import api from "@dv-admin/utils/libs/axios";
import type {
	IGetStoresRequest,
	IRejectStoreRequest,
	IStoreValidationItemResponse,
	IStoreValidationResponse
} from "@dv-admin/utils/types/api/apiGo";

export const getStores = async (params?: IGetStoresRequest): Promise<IStoreValidationResponse> => {
	const resp = await api.get("/dv-admin/root/stores", { params });
	return resp.data.data;
};

export const verifyStore = async (id: string): Promise<IStoreValidationItemResponse> => {
	const resp = await api.patch(`/dv-admin/root/stores/${id}/verify`);
	return resp.data.data;
};

export const rejectStore = async (id: string, body: IRejectStoreRequest): Promise<IStoreValidationItemResponse> => {
	const resp = await api.patch(`/dv-admin/root/stores/${id}/reject`, body);
	return resp.data.data;
};
