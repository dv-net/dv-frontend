import api from "@pay/utils/plugins/api";
import type { IPayerResponse, IWalletTxFindResponse } from "@pay/utils/types/api/apiGo";

export const getApiPayerInfo = async (payerId: string, locale: string): Promise<IPayerResponse> => {
	const config = { params: { locale } };
	const resp = await api.get(`/public/wallet/${payerId}`, config);
	return resp.data.data;
};

export const getApiStoreTopup = async (
	slug: string,
	external_id: string,
	locale: string,
	email?: string
): Promise<IPayerResponse> => {
	const config = { params: { locale, ...(email ? { email } : {}) } };
	const resp = await api.get(`/public/store/topup/${slug}/${external_id}`, config);
	return resp.data.data;
};

export const getApiWalletTxFind = async (payerId: string): Promise<IWalletTxFindResponse> => {
	const resp = await api.get(`/public/wallet/${payerId}/tx-find`);
	return resp.data.data;
};
