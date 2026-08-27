export type RefundStatus = "pending_review" | "rejected" | "processing" | "completed" | "failed";

export type RefundCabinetBucket = "available" | RefundStatus;

export interface IRefundLookupRequest {
	wallet_id: string;
	store_id: string;
	email: string;
}

export interface IRefundVerifyRequest {
	wallet_id: string;
	store_id: string;
	email: string;
	code: string;
}

export interface IRefundVerifyResponse {
	token: string;
}

export interface IRefundClaimRequest {
	destination_address: string;
}

export interface IRefundCabinetItem {
	blocked_transaction_id: string;
	transaction_id: string;
	tx_hash: string;
	blockchain: string;
	currency_id: string;
	risk_level: string;
	score: string;
	created_at: string | null;
	refund_status?: RefundStatus | null;
	destination_address?: string | null;
}

export type IRefundCabinetResponse = Partial<Record<RefundCabinetBucket, IRefundCabinetItem[]>>;

export interface IRefundRequest {
	id: string;
	blocked_transaction_id: string;
	wallet_id: string;
	store_id: string;
	transfer_id?: string | null;
	destination_address: string;
	status: RefundStatus;
	email: string;
	reviewed_at?: string | null;
	created_at: string;
	updated_at: string | null;
}
