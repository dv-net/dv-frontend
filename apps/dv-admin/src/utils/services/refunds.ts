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

export const postApiRefundApprove = async (refundId: string, totp: string): Promise<IRefundRequest> => {
	const resp = await api.post(`/dv-admin/refund-requests/${refundId}/approve`, { totp });
	return resp.data.data;
};

export const postApiRefundCancel = async (refundId: string): Promise<IRefundRequest> => {
	const resp = await api.post(`/dv-admin/refund-requests/${refundId}/cancel`);
	return resp.data.data;
};

export const postApiRefundExecuteNow = async (refundId: string, totp: string): Promise<IRefundRequest> => {
	const resp = await api.post(`/dv-admin/refund-requests/${refundId}/execute-now`, { totp });
	return resp.data.data;
};
