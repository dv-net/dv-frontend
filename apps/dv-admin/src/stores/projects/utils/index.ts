import type {
	IStoreHistoryWebhooks,
	IStoreWebhooksResponse,
	IStoreWebhookTestResponse
} from "@dv-admin/utils/types/api/apiGo";

export const webhooksFormStartData: IStoreWebhooksResponse[] = [
	{
		url: "",
		label: "WebHook on successful payment",
		enabled: true,
		events: ["PaymentReceived"],
		description: "The main URL where we will send notifications about confirmed payments to your store",
		tooltip: "The URL to which we will send notifications about successful payment."
	},
	{
		url: "",
		label: "WebHook payment in Mempool",
		enabled: true,
		events: ["PaymentNotConfirmed"],
		description:
			"The payment has been received by Mempool, but there is no confirmation yet - the credit will be available after confirmation on the network",
		tooltip:
			"The URL to which we will notify you that a payment has been received online but has not yet been confirmed sufficiently to complete."
	},
	{
		url: "",
		label: "Webhook for withdrawal from a processing wallet",
		enabled: true,
		events: ["WithdrawalFromProcessingReceived"],
		description:
			"You can send cryptocurrency to your clients through our service - we will notify you as soon as the funds are successfully credited to the recipient's wallet",
		tooltip: "The URL to which we will send a notification about the funds being credited to the recipient's wallet."
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
