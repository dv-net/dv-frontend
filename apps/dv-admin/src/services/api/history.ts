import api from "@dv-admin/utils/plugins/api";
import type {
	IOneTransactionResponse,
	IReceiptOneTransactionResponse,
	IStoreHistoryWebhooksRequest,
	IStoreHistoryWebhooksResponse,
	ITransactionDashboardResponse,
	ITransactionRequest,
	ITransactionStatsResponse,
	IWalletInfoResponse
} from "@dv-admin/utils/types/api/apiGo";

export const getApiTransaction = async (params = {} as ITransactionRequest): Promise<ITransactionDashboardResponse> => {
	const config = {
		params: { ...params, currencies: params?.currencies ? [params.currencies] : [] }
	};
	const resp = await api.get(`/dv-admin/transaction`, config);
	return resp.data.data;
};

export const getApiTransactionStats = async (
	params = {} as ITransactionRequest
): Promise<ITransactionStatsResponse[]> => {
	const config = {
		params: { ...params, currencies: params?.currencies ? [params.currencies] : [] }
	};
	const resp = await api.get(`/dv-admin/transaction/stats`, config);
	return resp.data.data;
};

export const getApiOneTransaction = async (hash: string): Promise<IOneTransactionResponse> => {
	const resp = await api.get(`/dv-admin/transaction/${hash}`);
	return resp.data.data;
};

export const getApiReceiptOneTransaction = async (hash: string): Promise<IReceiptOneTransactionResponse> => {
	const resp = await api.get(`/dv-admin/receipts/${hash}`);
	return resp.data.data;
};

export const postApiTransactionSendWebhooks = async (id: string) => {
	await api.post(`/dv-admin/transaction/${id}/send-webhooks`);
};

export const getApiOneAddress = async (hash: string) => {
	const resp = await api.get(`/dv-admin/wallet/${hash}`);
	return resp.data.data;
};

export const getApiWalletInfo = async (hash: string): Promise<IWalletInfoResponse> => {
	const resp = await api.get(`/dv-admin/wallet/info/${hash}`);
	return resp.data.data;
};

export const getApiWebhookHistory = async (
	params: IStoreHistoryWebhooksRequest
): Promise<IStoreHistoryWebhooksResponse> => {
	const config = { params };
	const resp = await api.get(`/dv-admin/webhook/history`, config);
	return resp.data.data;
};
