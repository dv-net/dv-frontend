import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { getApiWebhookHistory } from "@dv-admin/services/api/history";
import type { IStoreHistoryWebhooks, IStoreHistoryWebhooksRequest } from "@dv-admin/utils/types/api/apiGo";
import { postApiTransactionSendWebhooks } from "@dv-admin/services/api/history";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import { useI18n } from "vue-i18n";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
import { useProjectsStore } from "@dv-admin/stores/projects";

export const useWebhooksStore = defineStore("webhooksHistory", () => {
	const { selectedProject } = storeToRefs(useProjectsStore());
	const currentPageWebhooksHistory = ref<number>(1);
	const webhooksHistory = ref<IStoreHistoryWebhooks[]>([]);
	const isLoadingSendWebhooksHistory = ref<Record<string, boolean>>({});
	const isLoadingWebhooksHistory = ref<boolean>(false);
	const webhooksPagination = ref<UItableMeta>({
		page: currentPageWebhooksHistory.value,
		perPage: 100,
		nextPageExists: true
	});
	const { notify } = useNotifications();
	const { t } = useI18n();

	const getWebhookHistory = async (typeRequest?: string) => {
		try {
			isLoadingWebhooksHistory.value = true;
			if (typeRequest !== "pagination") {
				webhooksPagination.value.page = 1;
			}
			const params: IStoreHistoryWebhooksRequest = {
				store_uuids: selectedProject.value ? [selectedProject.value] : [],
				page: webhooksPagination.value.page,
				page_size: webhooksPagination.value.perPage
			};
			const data = await getApiWebhookHistory(params);
			if (data) {
				webhooksHistory.value = data.items;
				webhooksPagination.value.nextPageExists = data.next_page_exists;
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingWebhooksHistory.value = false;
		}
	};

	const postTransactionSendWebhooks = async (id: string, transactionId: string | undefined) => {
		if (!transactionId) return;
		try {
			isLoadingSendWebhooksHistory.value[id] = true;
			await postApiTransactionSendWebhooks(transactionId);
			notify(t("Webhook resent"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingSendWebhooksHistory.value[id] = false;
		}
	};

	return {
		isLoadingSendWebhooksHistory,
		isLoadingWebhooksHistory,
		webhooksHistory,
		webhooksPagination,
		getWebhookHistory,
		postTransactionSendWebhooks
	};
});
