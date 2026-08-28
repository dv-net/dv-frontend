export const AML_CHECK_STATUS = {
	pending: "pending",
	success: "success",
	failed: "failed"
} as const;

export type TAmlCheckStatus = (typeof AML_CHECK_STATUS)[keyof typeof AML_CHECK_STATUS];

export const AML_PAYMENT_PHASE = {
	checking: "checking",
	passed: "passed",
	blocked: "blocked",
	failed: "failed"
} as const;

export type TAmlPaymentPhase = (typeof AML_PAYMENT_PHASE)[keyof typeof AML_PAYMENT_PHASE];

export const AML_NULL_POLLS_BEFORE_SKIP = 3;
export const AML_POLL_INTERVAL_MS = 3000;
