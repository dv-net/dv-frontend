export type InvoiceType = "static" | "dynamic";

export type InvoiceStatus =
	| "created"
	| "pending"
	| "unconfirmed-payment"
	| "paid"
	| "partially-paid"
	| "overpaid"
	| "cancelled"
	| "expired";

export interface IPaySimpleShop {
	name: string;
	url: string | null;
}

export interface IPaySimpleInvoice {
	type: InvoiceType;
	status: InvoiceStatus;
	amount: number | null;
	currency: string;
	description: string;
	success_redirect_url: string | null;
	failure_redirect_url: string | null;
	user_contact: string | null;
	external_id: string;
	created_at: string;
}

export interface IPaySimpleWallet {
	currency: string;
	address: string;
	rate: string;
	currency_label?: string | null;
	token_label?: string | null;
	is_native?: boolean;
	contract_address?: string | null;
}

export interface IPaySimpleInvoiceResponse {
	shop: IPaySimpleShop;
	invoice: IPaySimpleInvoice;
	wallets: IPaySimpleWallet[];
}

/** Lightweight status payload — analogue of pay's tx-find. */
export interface IPaySimpleInvoiceStatusInvoice {
	status: InvoiceStatus;
	type: InvoiceType;
	amount: number | null;
	currency: string;
	payment_amount: number;
}

export interface IPaySimplePaymentDetails {
	currency_code: string;
	currency_name: string;
	blockchain: string;
	hash: string;
	amount: string;
	fiat_amount: string;
	fiat_currency: string;
	currency_label: string | null;
	token_label: string | null;
	is_native: boolean;
	contract_address: string | null;
}

export interface IPaySimpleInvoiceStatusResponse {
	invoice: IPaySimpleInvoiceStatusInvoice;
	confirmed: IPaySimplePaymentDetails[];
	unconfirmed: IPaySimplePaymentDetails[];
}

export const INVOICE_FINAL_STATUSES: InvoiceStatus[] = ["paid", "cancelled", "overpaid", "expired"];
export const INVOICE_SUCCESS_STATUSES: InvoiceStatus[] = ["paid", "overpaid"];
/** Waiting for first payment (wallets ready, nothing received yet). */
export const INVOICE_WAITING_STATUSES: InvoiceStatus[] = ["created", "pending"];
/** Payment seen on-chain but not fully settled yet. */
export const INVOICE_PAYMENT_FOUND_STATUSES: InvoiceStatus[] = ["unconfirmed-payment", "partially-paid"];

export const isInvoiceFinalStatus = (status: InvoiceStatus): boolean => INVOICE_FINAL_STATUSES.includes(status);
export const isInvoiceSuccessStatus = (status: InvoiceStatus): boolean => INVOICE_SUCCESS_STATUSES.includes(status);
export const isInvoiceWaitingStatus = (status: InvoiceStatus): boolean => INVOICE_WAITING_STATUSES.includes(status);
export const isInvoicePaymentFoundStatus = (status: InvoiceStatus): boolean =>
	INVOICE_PAYMENT_FOUND_STATUSES.includes(status);
