import api from "@dv-admin/utils/libs/axios";
import type {
	IAmlCurrenciesResponse,
	IAmlHistoryFilterRequest,
	IAmlHistoryResponse,
	IAmlKeysResponse,
	IAmlRiskRuleRequest,
	IAmlRiskRuleResponse,
	IAmlScoreTransactionRequest,
	IAmlSettingsRequest,
	IAmlSettingsResponse,
	IAmlSignalCategoryResponse
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

export const getApiAmlSettings = async (): Promise<IAmlSettingsResponse | Record<string, never>> => {
	const resp = await api.get(`/dv-admin/aml/settings`);
	return resp.data.data;
};

export const postApiAmlSettings = async (body: IAmlSettingsRequest): Promise<IAmlSettingsResponse> => {
	const resp = await api.post(`/dv-admin/aml/settings`, body);
	return resp.data.data;
};

export const getApiAmlRiskRules = async (slug: string): Promise<IAmlRiskRuleResponse[]> => {
	const resp = await api.get(`/dv-admin/aml/${slug}/rules`);
	return resp.data.data;
};

export const postApiAmlRiskRules = async (
	slug: string,
	rules: IAmlRiskRuleRequest[]
): Promise<IAmlRiskRuleResponse[]> => {
	const resp = await api.post(`/dv-admin/aml/${slug}/rules`, { rules });
	return resp.data.data;
};

export const getApiAmlSignals = async (slug: string): Promise<IAmlSignalCategoryResponse[]> => {
	const resp = await api.get(`/dv-admin/aml/${slug}/signals`);
	return resp.data.data;
};
