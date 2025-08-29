import type { IStoreHistoryWebhooks } from "@dv-admin/utils/types/api/apiGo";

export interface IProps {
	type: "response" | "request";
	webhook: IStoreHistoryWebhooks;
}
