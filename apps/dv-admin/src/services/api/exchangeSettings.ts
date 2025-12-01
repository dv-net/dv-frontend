import api from "@dv-admin/utils/plugins/api";
import type {
	IBalancesCurrentExchange,
	IExchangeDepositAddressesResponse,
	IExchangeList,
	IExchangeListResponse,
	IExchangeTestRequest
} from "@dv-admin/utils/types/api/apiGo";

export const getApiExchangeList = async (): Promise<IExchangeListResponse> => {
	const resp = await api.get("/dv-admin/exchange/list");
	return resp.data.data;
};

export const getApiExchangeConnectionChecks = async (slug: string, suppressNotify: boolean = false) => {
	const config = { suppressNotify };
	await api.get(`/dv-admin/exchange/${slug}/test`, config);
};

export const getApiExchangeDepositUpdate = async (slug: string): Promise<IExchangeDepositAddressesResponse[]> => {
	const resp = await api.get(`/dv-admin/exchange/${slug}/deposit-update`);
	return resp.data.data;
};

export const postApiExchangeKeyUpdates = async (slug: string, body: Pick<IExchangeList, "keys">) => {
	await api.post(`/dv-admin/exchange/${slug}/keys`, body);
};

export const deleteApiExchangeKeys = async (slug: string) => {
	await api.delete(`/dv-admin/exchange/${slug}/keys`);
};

export const postApiExchangeToggleSwaps = async (slug: string, new_state: string) => {
	await api.post(`/dv-admin/exchange/${slug}/toggle-swaps`, { new_state });
};

export const postApiExchangeToggleWithdrawals = async (slug: string, new_state: string) => {
	await api.post(`/dv-admin/exchange/${slug}/toggle-withdrawals`, { new_state });
};

export const postApiExchangeTest = async (body: IExchangeTestRequest) => {
	await api.post(`/dv-admin/exchange/test`, body);
};

export const getApiBalanceCurrentExchange = async (slug: string): Promise<IBalancesCurrentExchange> => {
	const resp = await api.get(`/dv-admin/exchange/${slug}/balance`);
	return resp.data.data;
};