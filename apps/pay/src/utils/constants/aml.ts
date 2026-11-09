export const AML_CHECK_STATUS = {
	pending: "pending",
	success: "success",
	failed: "failed"
} as const;

export type TAmlCheckStatus = (typeof AML_CHECK_STATUS)[keyof typeof AML_CHECK_STATUS];

export const AML_PAYMENT_PHASE = {
	checking: "checking",
	passed: "passed",
	blocked: "blocked"
} as const;

export type TAmlPaymentPhase = (typeof AML_PAYMENT_PHASE)[keyof typeof AML_PAYMENT_PHASE];

/** Rule types that are not provider signal categories */
export const AML_RISK_TYPE = {
	totalScore: "TOTAL_RISK_SCORE",
	sumOfSignals: "SUM_OF_SIGNALS",
	riskLevel: "RISK_LEVEL"
} as const;

/** RISK_LEVEL reason value is the level rank, not a percent */
export const AML_RISK_LEVEL_BY_RANK: Record<number, string> = {
	0: "None",
	1: "Low",
	2: "Medium",
	3: "High",
	4: "Critical"
};

export const AML_NULL_POLLS_BEFORE_SKIP = 3;
export const AML_POLL_INTERVAL_MS = 3000;
