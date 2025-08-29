import api from "@dv-admin/utils/plugins/api";
import type {
	IAmlCurrenciesResponse,
	IAmlHistoryFilterRequest,
	IAmlHistoryResponse,
	IAmlKeysResponse,
	IAmlScoreTransactionRequest
} from "@dv-admin/utils/types/api/apiGo.ts";

export const getApiAmlKeys = async (slug: string): Promise<IAmlKeysResponse[]> => {
	const resp = await api.get(`/dv-admin/aml/${slug}/keys`);
	return resp.data.data;
};

export const getApiAmlCurrencies = async (slug: string): Promise<IAmlCurrenciesResponse[]> => {
	const resp = await api.get(`/dv-admin/aml/${slug}/currencies`);
	return resp.data.data;
};

export const getApiAmlHistory = async (params: IAmlHistoryFilterRequest): Promise<IAmlHistoryResponse> => {
	const config = { params };
	const resp = await api.get(`/dv-admin/aml/history`, config);
	return resp.data.data;
};

export const postApiAmlScoreTransaction = async (body: IAmlScoreTransactionRequest) => {
	await api.post(`/dv-admin/aml/score-transaction`, body);
};

export const postApiAmlKeys = async (slug: string, keys: IAmlKeysResponse[]) => {
	await api.post(`/dv-admin/aml/${slug}/keys`, { keys });
};

export const deleteApiAmlKeys = async (slug: string) => {
	await api.delete(`/dv-admin/aml/${slug}/keys`);
};
