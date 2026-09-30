export const STORE_SETTING_LABELS: Record<string, string> = {
	user_crypto_receipt_email_notification: "Sending a receipt",
	external_wallet_email_notification: "Sending an email with wallet addresses"
};

export const STORE_SETTING_TOOLTIPS: Record<string, string> = {
	user_crypto_receipt_email_notification: "After payment, the user will receive a receipt by email",
	external_wallet_email_notification:
		"After the user selects a currency and network on the payment form, they will receive an email with a list of wallet addresses"
};
