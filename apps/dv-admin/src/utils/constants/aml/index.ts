/** Matches `internal/models/aml_check_statuses.go` in dv-merchant */
export const AML_CHECK_STATUS = {
	pending: "pending",
	success: "success",
	failed: "failed"
} as const;

export type TAmlCheckStatus = (typeof AML_CHECK_STATUS)[keyof typeof AML_CHECK_STATUS];

/** Matches `internal/models/aml_risk_levels.go` in dv-merchant */
export const AML_RISK_LEVEL = {
	none: "none",
	low: "low",
	medium: "medium",
	high: "high",
	critical: "critical",
	undefined: "undefined"
} as const;

export type TAmlRiskLevel = (typeof AML_RISK_LEVEL)[keyof typeof AML_RISK_LEVEL];

export const AML_RISK_LEVEL_LABELS: Record<TAmlRiskLevel, string> = {
	[AML_RISK_LEVEL.none]: "None",
	[AML_RISK_LEVEL.low]: "Low",
	[AML_RISK_LEVEL.medium]: "Medium",
	[AML_RISK_LEVEL.high]: "High",
	[AML_RISK_LEVEL.critical]: "Critical",
	[AML_RISK_LEVEL.undefined]: "Undefined"
};

/** Matches `internal/constants/aml.go` in dv-merchant */
export const AML_SETTING_LABELS: Record<string, string> = {
	access_key: "Access key",
	access_id: "Access id",
	secret_key: "Secret key",
	api_key: "API key",
	access_key_id: "Access id"
};

export const AML_RISK_TYPE_TOTAL_SCORE = "TOTAL_RISK_SCORE";
export const AML_RISK_TYPE_SUM_OF_SIGNALS = "SUM_OF_SIGNALS";
export const AML_RISK_ACTION_REJECT = "reject";
export const AML_RISK_ACTION_ACCEPT_AND_FLAG = "accept_and_flag";

export const AML_RISK_TYPE_LABELS: Record<string, string> = {
	[AML_RISK_TYPE_TOTAL_SCORE]: "Total Risk Score",
	[AML_RISK_TYPE_SUM_OF_SIGNALS]: "Sum of signals"
};
