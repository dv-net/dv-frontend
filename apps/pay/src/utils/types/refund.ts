import type { IAmlBlockReason } from "@pay/utils/types/aml";

export type RefundStatus = "pending_review" | "scheduled" | "rejected" | "processing" | "completed" | "failed";

export type RefundCabinetBucket = "available" | RefundStatus;

export interface IRefundEntryQuery {
	wallet_id: string;
	store_id: string;
	email: string;
}

export interface IRefundEntryPartialQuery {
	wallet_id: string;
	store_id: string;
}

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

export interface IRefundEstimate {
	blocked_transaction_id: string;
	amount: string | number;
	currency_id: string;
	estimated_fee: string | number | null;
	fee_currency_id: string;
	fee_from_amount: boolean;
	amount_to_receive: string | number | null;
	fee_covered: boolean;
	fee_balance: string | number | null;
	fee_shortage: string | number | null;
	activation_required: boolean;
	requires_review: boolean;
}

export interface IRefundCabinetItem {
	blocked_transaction_id: string;
	transaction_id: string;
	tx_hash: string;
	blockchain: string;
	currency_id: string;
	amount?: string | null;
	amount_usd?: string | null;
	risk_level: string;
	score: string;
	created_at: string | null;
	from_address?: string | null;
	to_address?: string | null;
	refund_status?: RefundStatus | null;
	destination_address?: string | null;
	refund_execute_after?: string | null;
	block_reasons?: IAmlBlockReason[] | null;
	refund_to_sender_without_auth?: boolean;
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
	email: string | null;
	reviewed_at?: string | null;
	execute_after?: string | null;
	created_at: string;
	updated_at: string | null;
}
