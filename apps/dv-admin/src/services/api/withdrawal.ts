import api from "@dv-admin/utils/plugins/api";
import type {
	IAddressesConverterResponse,
	ICurrenciesRateSource,
	IDepositAddressesResponse,
	IExchangeChainsResponse,
	IExchangeOrderRequest,
	IExchangeOrderResponse,
	IExchangePairsResponse,
	IExchangeReportRequest,
	IExchangeWithdrawalRequest,
	IExchangeWithdrawalResponse,
	IExchangeWithdrawalRulesResponse,
	IWithdrawalAddressRequest,
	IWithdrawalRulesRequest,
	IWithdrawalRulesResponse,
	IWithdrawalSettingRequest,
	IWithdrawalSettingResponse
} from "@dv-admin/utils/types/api/apiGo";

export const getApiWithdrawalRules = async (): Promise<IWithdrawalRulesResponse[]> => {
	const resp = await api.get("/dv-admin/withdrawal/rules");
	return resp.data.data;
};

export const getApiWithdrawalCurrencyRules = async (currencyId: string): Promise<IWithdrawalRulesResponse> => {
	const resp = await api.get(`/dv-admin/withdrawal/${currencyId}/rules`);
	return resp.data.data;
};

export const patchApiWithdrawalCurrencyRules = async (currencyId: string, body: IWithdrawalRulesRequest) => {
	await api.patch(`/dv-admin/withdrawal/${currencyId}/rules`, body);
};

export const patchApiWithdrawalWalletAddresses = async (walletId: string, body: IWithdrawalAddressRequest) => {
	await api.patch(`/dv-admin/withdrawal-wallet/${walletId}/addresses`, body);
};

export const getApiExchangeDepositAddresses = async (): Promise<IDepositAddressesResponse[]> => {
	const config = { suppressNotify: true };
	const resp = await api.get(`/dv-admin/exchange/deposit-addresses`, config);
	return resp.data.data;
};

export const postApiSetExchange = async (slug: string) => {
	await api.post(`/dv-admin/exchange/${slug}/set`);
};

export const getApiCurrenciesRateSource = async (source: string): Promise<ICurrenciesRateSource[]> => {
	const resp = await api.get(`/dv-admin/currencies/rate/${source}`);
	return resp.data.data;
};

export const getApiExchangePairs = async (slug: string): Promise<IExchangePairsResponse[]> => {
	const resp = await api.get(`/dv-admin/exchange/${slug}/pairs`);
	return resp.data.data;
};

export const getApiExchangeUserPairs = async (slug: string): Promise<{ display_name: string }[]> => {
	const resp = await api.get(`/dv-admin/exchange/${slug}/user-pairs`);
	return resp.data.data;
};

export const putApiExchangePairs = async (slug: string, body: IExchangePairsResponse[]) => {
	await api.put(`/dv-admin/exchange/${slug}/user-pairs`, { pairs: body });
};

export const getApiExchangeChains = async (slug: string): Promise<IExchangeChainsResponse[]> => {
	const resp = await api.get(`/dv-admin/exchange/${slug}/chains`);
	return resp.data.data;
};

export const getApiExchangeWithdrawalSetting = async (slug: string): Promise<IWithdrawalSettingResponse[]> => {
	const resp = await api.get(`/dv-admin/exchange/${slug}/withdrawal-setting`);
	return resp.data.data;
};

export const postApiExchangeWithdrawalSetting = async (
	slug: string,
	body: IWithdrawalSettingRequest
): Promise<IWithdrawalSettingResponse> => {
	const resp = await api.post(`/dv-admin/exchange/${slug}/withdrawal-setting`, body);
	return resp.data.data;
};

export const patchApiExchangeWithdrawalSetting = async (
	slug: string,
	settingId: string,
	enabled: boolean
): Promise<IWithdrawalSettingResponse> => {
	const resp = await api.patch(`/dv-admin/exchange/${slug}/withdrawal-setting/${settingId}`, { enabled });
	return resp.data.data;
};

export const getApiExchangeWithdrawal = async (
	params: IExchangeWithdrawalRequest
): Promise<IExchangeWithdrawalResponse> => {
	const config = { params };
	const resp = await api.get(`/dv-admin/exchange/withdrawal`, config);
	return resp.data.data;
};

export const getApiExchangeWithdrawalReport = async (params: IExchangeReportRequest): Promise<Blob> => {
	const { data } = await api.get(`/dv-admin/exchange/withdrawal/export`, { params });
	return data;
};

export const deleteApiExchangeWithdrawalSetting = async (slug: string, id: string) => {
	await api.delete(`/dv-admin/exchange/${slug}/withdrawal-setting/${id}`);
};

export const getApiExchangeOrder = async (params: IExchangeOrderRequest): Promise<IExchangeOrderResponse> => {
	const config = { params };
	const resp = await api.get(`/dv-admin/exchange/exchange-history`, config);
	return resp.data.data;
};

export const getApiExchangeOrderReport = async (params: IExchangeReportRequest): Promise<Blob> => {
	const { data } = await api.get(`/dv-admin/exchange/exchange-history/export`, { params });
	return data;
};

export const getApiExchangeWithdrawalRules = async (slug: string): Promise<IExchangeWithdrawalRulesResponse[]> => {
	const resp = await api.get(`/dv-admin/exchange/${slug}/withdrawal-rules`);
	return resp.data.data;
};

export const postApiAddressesConverter = async (
	address: string,
	blockchain: string
): Promise<IAddressesConverterResponse> => {
	const resp = await api.post(`/dv-admin/wallet/addresses/converter`, { address, blockchain });
	return resp.data.data;
};
