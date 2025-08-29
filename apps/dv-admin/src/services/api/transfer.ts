import api from "@dv-admin/utils/plugins/api";
import type { ITransferPrefetchResponse, ITransferRequest, ITransferResponse } from "@dv-admin/utils/types/api/apiGo";

export const getApiTransferPrefetch = async (): Promise<ITransferPrefetchResponse[]> => {
	const resp = await api.get(`/dv-admin/transfer/prefetch`);
	return resp.data.data;
};

export const getApiTransfer = async (params: ITransferRequest): Promise<ITransferResponse> => {
	const config = { params };
	const resp = await api.get(`/dv-admin/transfer`, config);
	return resp.data.data;
};

export const deleteApiTransfer = async (ids: string[]) => {
	const config = { data: { id: ids } };
	await api.delete(`/dv-admin/transfer`, config);
};
