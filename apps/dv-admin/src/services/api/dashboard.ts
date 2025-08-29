import api from "@dv-admin/utils/plugins/api";
import type {
	IBalancesCurrentExchange,
	IDepositSummaryRequest,
	IDepositSummaryResponse,
	IProcessingWalletsResponse,
	ITronResourceExpensesRequest,
	ITronResourceExpensesResponse,
	IWithdrawalFromProcessingRequest
} from "@dv-admin/utils/types/api/apiGo";

export const getApiProcessingWallets = async (): Promise<IProcessingWalletsResponse[]> => {
	const resp = await api.get(`/dv-admin/processing/wallets`);
	return resp.data.data;
};

export const getApiDepositSummary = async (
	params = {} as IDepositSummaryRequest
): Promise<IDepositSummaryResponse[]> => {
	const config = { params };
	const resp = await api.get(`/dv-admin/deposit/summary`, config);
	return resp.data.data;
};

export const getApiWalletBalancesHot = async (): Promise<string> => {
	const resp = await api.get(`/dv-admin/wallet/balances/hot`);
	return resp.data.data.total_usd;
};

export const getApiBalanceCurrentExchange = async (slug: string): Promise<IBalancesCurrentExchange> => {
	const resp = await api.get(`/dv-admin/exchange/${slug}/balance`);
	return resp.data.data;
};

export const getApiBalancesCold = async (): Promise<string> => {
	const resp = await api.get(`/dv-admin/wallet/balances/exchange-settings`);
	return resp.data.data.total_usd;
};

export const getApiTronResourceExpenses = async (
	params = {} as ITronResourceExpensesRequest
): Promise<ITronResourceExpensesResponse> => {
	const config = { params };
	const resp = await api.get(`/dv-admin/tron/resource-expenses`, config);
	return resp.data.data;
};

export const postApiWithdrawalFromProcessing = async (params: IWithdrawalFromProcessingRequest): Promise<any> => {
	const resp = await api.post(`/dv-admin/withdrawal/withdrawal-from-processing`, params);
	return resp.data.data;
};
