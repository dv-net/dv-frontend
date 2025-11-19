import type { BlockchainType } from "@shared/utils/types/blockchain";

export interface IInfoBlockchains {
	blockchain: string
	isActive: false
}

export interface IInfoCurrency {
	id: BlockchainType;
	code: string;
	name: string;
	blockchain: string;
	precision: number;
	is_bitcoin_like: boolean;
	is_evm_like: boolean;
	currency_label: string | null;
	token_label: string | null;
	blockchains?: IInfoBlockchains[];
	contract_address: string;
	is_native: boolean;
}

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

export interface IWalletTransactionResponse {
	amount: string;
	amount_usd: string;
	created_at: string;
	currency_code: string;
	hash: string;
	type: string;
	is_less_than_1_hour?: boolean;
}

export interface IWalletTxFindResponse {
	confirmed: IWalletTransactionResponse[];
	unconfirmed: IWalletTransactionResponse[];
}
