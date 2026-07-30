export const RISK_LEVEL_ENUM: Record<string, string> = {
	none: "None",
	low: "Low",
	medium: "Medium",
	high: "High",
	critical: "Critical",
	undefined: "Undefined"
};

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

export const AML_RISK_TYPE_LABELS: Record<string, string> = {
	[AML_RISK_TYPE_TOTAL_SCORE]: "Total Risk Score",
	[AML_RISK_TYPE_SUM_OF_SIGNALS]: "Sum of signals"
};
