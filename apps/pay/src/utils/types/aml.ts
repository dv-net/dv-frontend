import type { TAmlCheckStatus } from "@pay/utils/constants/aml";

export interface IAmlBlockReason {
	risk_type: string;
	value: string;
}

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
	block_reasons?: IAmlBlockReason[] | null;
}
