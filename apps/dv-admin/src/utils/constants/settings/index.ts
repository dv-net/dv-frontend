import type { IUiSelectOptions } from "@dv-admin/utils/types/general";

export enum DATE_FORMATS {
	RU_DATE = "DD.MM.YYYY",
	US_DATE = "MM-DD-YYYY",
	RU_DATETIME = "DD.MM.YYYY, HH:mm",
	US_DATETIME_AMPM = "MM-DD-YYYY, hh:mm A"
}

export const formatDateList: IUiSelectOptions[] = [
	{ value: DATE_FORMATS.RU_DATETIME, label: "European" },
	{ value: DATE_FORMATS.US_DATETIME_AMPM, label: "American" }
];

export const USER_SETTING_LABELS: Record<string, string> = {
	transfers_status: "Transfer status",
	transfer_type: "Transfer type"
};

export const ROOT_SETTING_LABELS: Record<string, string> = {
	dv_admin_secret_key: "Secret key",
	anonymous_telemetry: "Sending statistics",
	merchant_pay_form_domain: "Payment form domain",
	merchant_domain: "Application domain",
	registration_state: "Registration status",
	processing_client_id: "ID",
	processing_client_key: "Key",
	processing_url: "Address",
	withdraw_from_processing: "Allow sending funds from processing wallets via API",
	notification_sender: "Sender",
	mailer_encryption: "Encryption type",
	mailer_username: "User's login",
	mailer_address: "Address",
	mailer_sender: "Sender",
	mailer_protocol: "Protocol",
	mailer_state: "Status",
	mailer_password: "Password"
};

export const ROOT_SETTING_MAIL_DESCRIPTIONS: Record<string, string> = {
	mailer_address: "Your SMTP server address",
	mailer_username: "User login for SMTP authorization",
	mailer_password: "Password for SMTP server login",
	mailer_sender: "Specify on whose behalf the email will be sent",
	mailer_encryption: "The encryption type used to connect to the email server",
	mailer_state: "Disabling the module"
};

export const ROOT_SETTING_GENERAL_DESCRIPTIONS: Record<string, string> = {
	anonymous_telemetry: "You agree to send data about the project version and demand for tokens for our analytics",
	merchant_domain: "You can purchase a domain that will open the control panel and enter it in this field",
	merchant_pay_form_domain: "You can purchase a domain that will be displayed to your clients on the payment form",
	registration_state: "With this flag you can disable the ability for users to register in the seller control panel",
	callbackDomain: "Webhook for communication between processing and backends"
};

export const TRANSFER_TYPES = {
	BURNTRX: "burntrx",
	CLOUD_DELEGATE: "cloud_delegate",
	RESOURCES: "resources"
} as const;

export const LEVEL_LOGS: Record<string, string> = {
	debug: "neutral",
	info: "positive",
	warn: "warning",
	panic: "negative",
	fatal: "negative",
	error: "negative"
} as const;

export const OPTIONS_LEVEL_LOGS: IUiSelectOptions[] = [
	{ value: "debug", label: "debug" },
	{ value: "info", label: "info" },
	{ value: "warn", label: "warn" },
	{ value: "error", label: "error" },
	{ value: "fatal", label: "fatal" },
	{ value: "panic", label: "panic" }
];
