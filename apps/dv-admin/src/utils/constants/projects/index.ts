export const DEPOSIT_AML_BLOCKED_EMAIL_SETTING = "deposit_aml_blocked_email_notification";

export const STORE_SETTING_LABELS: Record<string, string> = {
	user_crypto_receipt_email_notification: "Sending a receipt",
	external_wallet_email_notification: "Sending an email with wallet addresses",
	[DEPOSIT_AML_BLOCKED_EMAIL_SETTING]: "Sending an email when a deposit is blocked"
};

export const STORE_SETTING_TOOLTIPS: Record<string, string> = {
	user_crypto_receipt_email_notification: "After payment, the user will receive a receipt by email",
	external_wallet_email_notification:
		"After the user selects a currency and network on the payment form, they will receive an email with a list of wallet addresses",
	[DEPOSIT_AML_BLOCKED_EMAIL_SETTING]:
		"The payer receives this email instead of a payment receipt when AML blocks the deposit"
};
