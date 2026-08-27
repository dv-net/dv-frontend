import api from "@pay/utils/libs/axios";
import type {
	IRefundCabinetResponse,
	IRefundClaimRequest,
	IRefundLookupRequest,
	IRefundRequest,
	IRefundVerifyRequest,
	IRefundVerifyResponse
} from "@pay/utils/types/refund";

const refundAuthHeaders = (token: string) => ({
	"X-Refund-Token": token
});

export const postApiRefundLookup = async (body: IRefundLookupRequest): Promise<string> => {
	const resp = await api.post("/public/refund/lookup", body);
	return resp.data.data;
};

export const postApiRefundVerify = async (body: IRefundVerifyRequest): Promise<IRefundVerifyResponse> => {
	const resp = await api.post("/public/refund/verify", body);
	return resp.data.data;
};

export const getApiRefundCabinet = async (token: string): Promise<IRefundCabinetResponse> => {
	const resp = await api.get("/public/refund/cabinet", {
		headers: refundAuthHeaders(token)
	});
	return resp.data.data;
};

export const postApiRefundClaim = async (
	blockedTransactionId: string,
	body: IRefundClaimRequest,
	token: string
): Promise<IRefundRequest> => {
	const resp = await api.post(`/public/refund/blocked-transactions/${blockedTransactionId}/claim`, body, {
		headers: refundAuthHeaders(token)
	});
	return resp.data.data;
};
