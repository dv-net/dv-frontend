import api from "@dv-admin/utils/plugins/api";
import type {
	IExternalWalletRequest,
	IHotWalletsRequest,
	IHotWalletsResponse,
	IWalletKeysHotRequest,
	IWalletKeysResponse,
	IWalletSeedsResponse,
	IWalletSummaryResponse,
	IWithdrawMultipleRequest
} from "@dv-admin/utils/types/api/apiGo";

export const getApiWalletKeys = async (totp: string): Promise<IWalletKeysResponse> => {
	const resp = await api.get(`/dv-admin/wallet/addresses/keys?totp=${totp}`);
	return resp.data.data;
};

export const getApiWalletSeeds = async (totp: string): Promise<IWalletSeedsResponse> => {
	const resp = await api.get(`/dv-admin/wallet/addresses/seeds?totp=${totp}`);
	return resp.data.data;
};

export const getApiWallets = async (body: IHotWalletsRequest): Promise<IHotWalletsResponse> => {
	const resp = await api.post("/dv-admin/wallet", body);
	return resp.data.data;
};

export const getApiWalletSummary = async (min_balance?: number): Promise<IWalletSummaryResponse[]> => {
	const params = { params: min_balance ? { min_balance } : {} };
	const resp = await api.get("/dv-admin/wallet/summary", params);
	return resp.data.data;
};

export const postApiWithdrawManual = async (currency_id: string, wallet_address_id: string) => {
	await api.post("/dv-admin/withdrawal/withdraw-manual", { currency_id, wallet_address_id });
};

export const postApiWithdrawProcessing = async (currency_id: string, wallet_address_id: string) => {
	await api.post("/dv-admin/withdrawal/withdraw-to-processing", { currency_id, wallet_address_id });
};

export const postApiWalletKeysHot = async (params: IWalletKeysHotRequest) => {
	const resp = await api.post("/dv-admin/wallet/keys/hot", params);
	return resp.data;
};

export const postApiWithdrawMultipleProcessing = async (params: IWithdrawMultipleRequest) => {
	await api.post("/dv-admin/withdrawal/withdraw-multiple-to-processing", params);
};

export const postApiWithdrawMultipleManual = async (params: IWithdrawMultipleRequest) => {
	await api.post("/dv-admin/withdrawal/withdraw-multiple-manual", params);
};

export const postApiWalletAddresses = async (body: IExternalWalletRequest): Promise<string> => {
	const resp = await api.post(`/dv-admin/wallet/addresses`, body);
	return resp.data.data.pay_url;
};
