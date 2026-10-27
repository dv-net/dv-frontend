import type { RefundStatus } from "@dv-admin/utils/types/api/apiGo";

export const REFUND_REQUESTS_PAGE_SIZE = 20;

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
	pending_review: "Pending review",
	scheduled: "Scheduled request",
	processing: "Being sent",
	completed: "Completed request",
	failed: "With an error",
	rejected: "Rejected request",
	canceled: "Canceled request"
};

export const REFUND_STATUS_FILTER_LABELS: Record<RefundStatus, string> = {
	pending_review: "Pending review",
	scheduled: "Scheduled requests",
	processing: "Sending",
	completed: "Completed requests",
	failed: "With an error",
	rejected: "Rejected requests",
	canceled: "Canceled requests"
};

export const REFUND_STATUSES = Object.keys(REFUND_STATUS_LABELS) as RefundStatus[];
