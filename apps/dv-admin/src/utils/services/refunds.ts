import type { IRefundRequest } from "@dv-admin/utils/types/api/apiGo";
import api from "@dv-admin/utils/libs/axios";

export const getApiRefundRequests = async (): Promise<IRefundRequest[]> => {
	const resp = await api.get("/dv-admin/refund-requests");
	return resp.data.data;
};

export const postApiRefundReject = async (refundId: string): Promise<IRefundRequest> => {
	const resp = await api.post(`/dv-admin/refund-requests/${refundId}/reject`);
	return resp.data.data;
};
