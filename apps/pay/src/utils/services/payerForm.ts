import api from "@pay/utils/libs/axios";
import type { IAmlCheckStatusResponse, IBlockedTransactionItem } from "@pay/utils/types/aml";
import type { IPayerResponse } from "@pay-shared/utils/types/payer";
import type { IWalletTxFindResponse } from "@pay-shared/utils/types/transaction";

export const getApiPayerInfo = async (payerId: string, locale: string): Promise<IPayerResponse> => {
	const config = { params: { locale } };
	const resp = await api.get(`/public/wallet/${payerId}`, config);
	return resp.data.data;
};

export const getApiWalletConfirm = async (payerId: string, currency_id: string) => {
	const config = { params: { currency_id } };
	await api.get(`/public/wallet/${payerId}/confirm`, config);
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

export const postApiWalletRefreshAddress = async (payerId: string, address: string): Promise<void> => {
	await api.post(`/public/wallet/${payerId}/refresh-address`, { Address: address });
};

export const getApiWalletAmlCheck = async (
	walletId: string,
	hash: string
): Promise<IAmlCheckStatusResponse | null> => {
	const resp = await api.get(`/public/wallet/${walletId}/aml-checks`, { params: { hash } });
	return resp.data.data ?? null;
};

export const getApiWalletBlockedTransactions = async (walletId: string): Promise<IBlockedTransactionItem[]> => {
	const resp = await api.get(`/public/wallet/${walletId}/blocked-transactions`);
	return resp.data.data ?? [];
};
