export const STORE_SETTING_LABELS: Record<string, string> = {
	user_crypto_receipt_email_notification: "Sending a check",
	external_wallet_email_notification: "Sending a letter with wallets"
};

export const STORE_SETTING_TOOLTIPS: Record<string, string> = {
	user_crypto_receipt_email_notification: "After payment, the user will be sent a receipt by email",
	external_wallet_email_notification:
		"After the user has selected the currency and chain on the payment form, an email with a list of wallets will be sent to them"
};
