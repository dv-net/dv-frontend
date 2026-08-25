import type { IInfoCurrency } from "./currency";

export interface IPayerAddressResponse {
	address: string;
	currency: IInfoCurrency;
}

export interface IPayerStoreResponse {
	id: string;
	name: string;
	currency_id: string;
	status: boolean;
	minimal_payment: string;
	site_url?: string;
	return_url?: string;
	success_url?: string;
}

export interface IPayerResponse {
	addresses: IPayerAddressResponse[];
	rates: Record<string, string>;
	store: IPayerStoreResponse;
	wallet_id?: string;
}
