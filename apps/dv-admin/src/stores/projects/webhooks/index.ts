import { defineStore } from "pinia";
import { ref } from "vue";
import {
	getApiWebhooksProject,
	postApiWebhookSendTest,
	postApiWebhooksProject,
	putApiWebhooksProject
} from "@dv-admin/services/api/projects";
import { setResultTestWebhook, webhooksFormStartData } from "@dv-admin/stores/projects/utils";
import type { IStoreWebhooksResponse, IStoreWebhookTestRequest } from "@dv-admin/utils/types/api/apiGo";
import { useNotifications } from "@shared/utils/composables/useNotifications";

const { notify } = useNotifications();

export const useProjectsWebhooksStore = defineStore("projectsWebhooks", () => {
	const webhooksProject = ref<IStoreWebhooksResponse[]>(structuredClone(webhooksFormStartData));
	const loadingWebhookTestStates = ref<Record<string, boolean>>({});
	const loadingWebhookChangeStates = ref<Record<string, boolean>>({});

	// CRUD for Webhooks
	const getWebhooksProject = async (uuid: string) => {
		try {
			const data = await getApiWebhooksProject(uuid);
			if (data && data.length) {
				webhooksProject.value = structuredClone(webhooksFormStartData);
				webhooksProject.value = webhooksProject.value.map((item) => {
					const matchingWebhook = data.find((serverWebhook) => serverWebhook.events[0] === item.events[0]);
					if (matchingWebhook) {
						return { ...item, id: matchingWebhook.id, url: matchingWebhook.url, events: matchingWebhook.events };
					} else {
						return item;
					}
				});
			}
		} catch (error: any) {
			throw error;
		}
	};
	const postWebhookSendTest = async (id: string, message: string) => {
		try {
			loadingWebhookTestStates.value[id] = true;
			const findIndex: number = webhooksProject.value.findIndex((item) => item.id === id);
			const find: IStoreWebhooksResponse | undefined = webhooksProject.value.find((item) => item.id === id);
			if (!find || !find?.id) return;
			const body: IStoreWebhookTestRequest = { event_type: find.events[0], wh_id: find.id };
			const data = await postApiWebhookSendTest(body);
			if (data && findIndex !== -1) {
				// Transform response to the required format for the common BlockWebhookDemo component
				webhooksProject.value[findIndex].history = setResultTestWebhook(data, find);
			}
			notify(message, "success");
		} catch (error: any) {
			throw error;
		} finally {
			loadingWebhookTestStates.value[id] = false;
		}
	};
	const postWebhooksProject = async (uuid: string, index: number, message: string) => {
		try {
			loadingWebhookChangeStates.value[index] = true;
			const data = await postApiWebhooksProject(uuid, webhooksProject.value[index]);
			if (data) {
				webhooksProject.value[index] = {
					...webhooksProject.value[index],
					id: data.id,
					url: data.url,
					events: data.events
				};
			}
			notify(message, "success");
		} catch (error: any) {
			throw error;
		} finally {
			loadingWebhookChangeStates.value[index] = false;
		}
	};
	const putWebhooksProject = async (uuid: string, id: string, message: string) => {
		try {
			loadingWebhookChangeStates.value[id] = true;
			const findIndex: number = webhooksProject.value.findIndex((item) => item.id === id);
			if (findIndex === -1) return;
			await putApiWebhooksProject(uuid, webhooksProject.value[findIndex]);
			notify(message, "success");
		} catch (error: any) {
			throw error;
		} finally {
			loadingWebhookChangeStates.value[id] = false;
		}
	};

	return {
		webhooksProject,
		loadingWebhookTestStates,
		loadingWebhookChangeStates,
		getWebhooksProject,
		postWebhooksProject,
		putWebhooksProject,
		postWebhookSendTest
	};
});
