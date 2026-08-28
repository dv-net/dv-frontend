export interface ILatestTransaction {
	amount: string;
	amount_usd: string;
	fiat_currency?: string;
	created_at: string;
	currency_code: string;
	hash: string;
	is_less_than_1_hour?: boolean;
	currency_label: string;
	token_label: string | null;
	blocked_transaction_id?: string;
}
