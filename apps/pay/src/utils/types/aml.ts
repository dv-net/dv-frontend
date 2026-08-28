import type { TAmlCheckStatus } from "@pay/utils/constants/aml";

export interface IAmlCheckStatusResponse {
	transaction_id: string;
	tx_hash: string;
	blockchain: string;
	status: TAmlCheckStatus;
	in_progress: boolean;
	score: string;
	risk_level: string | null;
	created_at: string | null;
	updated_at: string | null;
}

export interface IBlockedTransactionItem {
	blocked_transaction_id: string;
	transaction_id: string;
	tx_hash: string;
	blockchain: string;
	currency_id: string;
	risk_level: string;
	score: string;
	created_at: string | null;
	refund_status?: string | null;
	destination_address?: string | null;
}
