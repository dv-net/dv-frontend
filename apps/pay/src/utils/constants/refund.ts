import type { RefundCabinetBucket, RefundStatus } from "@pay/utils/types/refund";

export const REFUND_TOKEN_KEY = "p";
export const REFUND_TOKEN_COOKIE_TTL = "3d";

export const getRefundTokenCookieKey = (storeId: string): string => `${REFUND_TOKEN_KEY}:${storeId.trim()}`;

export const REFUND_STATUS = {
	PENDING_REVIEW: "pending_review",
	REJECTED: "rejected",
	PROCESSING: "processing",
	COMPLETED: "completed",
	FAILED: "failed"
} as const satisfies Record<string, RefundStatus>;

export const REFUND_CABINET_BUCKET_ORDER: RefundCabinetBucket[] = [
	"available",
	REFUND_STATUS.PENDING_REVIEW,
	REFUND_STATUS.PROCESSING,
	REFUND_STATUS.COMPLETED,
	REFUND_STATUS.FAILED,
	REFUND_STATUS.REJECTED
];

export const REFUND_STATUS_LABELS: Record<RefundCabinetBucket, string> = {
	available: "Available for refund",
	pending_review: "Pending review",
	processing: "Processing",
	completed: "Completed",
	failed: "Failed",
	rejected: "Rejected"
};

export const REFUND_CODE_LENGTH = 6;
export const REFUND_RESEND_COOLDOWN_SEC = 60;
