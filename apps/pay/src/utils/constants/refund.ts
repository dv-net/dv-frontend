import { getCurrentBlockchain } from "@shared/utils/helpers/general";
import type { RefundCabinetBucket, RefundStatus } from "@pay/utils/types/refund";

/** A BTC-like deposit can have several inputs, so the stored sender is not the only destination */
const BITCOIN_LIKE_CHAINS = new Set(["bitcoin", "litecoin", "bitcoincash", "dogecoin"]);

export const isBitcoinLikeDeposit = (currencyId?: string | null, blockchain?: string | null): boolean => {
	const chain = (currencyId ? getCurrentBlockchain(currencyId) : "") || blockchain || "";
	return BITCOIN_LIKE_CHAINS.has(chain.trim().toLowerCase());
};

export const REFUND_TOKEN_KEY = "p";
/** Matches the backend wallet session token lifetime (AuthByWallet) */
export const REFUND_TOKEN_COOKIE_TTL = "3h";

/** Refund session is scoped to a payer wallet within a store, so both ids are part of the key */
export const getRefundTokenCookieKey = (storeId: string, walletId: string): string =>
	`${REFUND_TOKEN_KEY}:${storeId.trim()}:${walletId.trim()}`;

export const REFUND_STATUS = {
	PENDING_REVIEW: "pending_review",
	SCHEDULED: "scheduled",
	REJECTED: "rejected",
	PROCESSING: "processing",
	COMPLETED: "completed",
	FAILED: "failed"
} as const satisfies Record<string, RefundStatus>;

export const REFUND_CABINET_BUCKET_ORDER: RefundCabinetBucket[] = [
	"available",
	REFUND_STATUS.PENDING_REVIEW,
	REFUND_STATUS.SCHEDULED,
	REFUND_STATUS.PROCESSING,
	REFUND_STATUS.COMPLETED,
	REFUND_STATUS.FAILED,
	REFUND_STATUS.REJECTED
];

export const REFUND_STATUS_LABELS: Record<RefundCabinetBucket, string> = {
	available: "Available for refund",
	pending_review: "Pending review",
	scheduled: "Scheduled",
	processing: "Processing",
	completed: "Completed",
	failed: "Failed",
	rejected: "Rejected"
};

export const REFUND_CODE_LENGTH = 6;
export const REFUND_RESEND_COOLDOWN_SEC = 60;
