export interface IWalletTransactionResponse {
	amount: string;
	amount_usd: string;
	fiat_currency?: string;
	created_at: string;
	currency_code: string;
	hash: string;
	type: string;
	is_less_than_1_hour?: boolean;
	currency_name: string;
	currency_label: string;
	blockchain: string;
	contract_address: string;
	is_native: boolean;
	token_label: string | null;
}

export interface IWalletTxFindResponse {
	confirmed: IWalletTransactionResponse[];
	unconfirmed: IWalletTransactionResponse[];
}
