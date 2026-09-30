import type {
	IStoreHistoryWebhooks,
	IStoreWebhooksResponse,
	IStoreWebhookTestResponse
} from "@dv-admin/utils/types/api/apiGo";

export const webhooksFormStartData: IStoreWebhooksResponse[] = [
	{
		url: "",
		label: "Webhook on successful payment",
		enabled: true,
		events: ["PaymentReceived"],
		description: "The main URL where we will send notifications about confirmed payments to your store",
		tooltip: "The URL to which we will send notifications about successful payments"
	},
	{
		url: "",
		label: "Webhook on payment in mempool",
		enabled: true,
		events: ["PaymentNotConfirmed"],
		description:
			"The payment has entered the mempool but has not been confirmed yet — the funds will be credited after network confirmation",
		tooltip:
			"The URL to which we will send a notification that a payment has appeared on the network but does not yet have enough confirmations to be completed"
	},
	{
		url: "",
		label: "Webhook for withdrawal from a processing wallet",
		enabled: true,
		events: ["WithdrawalFromProcessingReceived"],
		description:
			"You can send cryptocurrency to your clients through our service — we will notify you as soon as the funds are credited to the recipient's wallet",
		tooltip: "The URL to which we will send a notification about the funds being credited to the recipient's wallet"
	}
];

export const setResultTestWebhook = (
	result: IStoreWebhookTestResponse,
	data: IStoreWebhooksResponse
): IStoreHistoryWebhooks => {
	return {
		id: data.id ?? "",
		created_at: new Date().toString(),
		url: data.url,
		request: result.request_body,
		response: result.response_body,
		is_success: result.response_status !== "failed",
		status_code: result.response_code
	};
};
