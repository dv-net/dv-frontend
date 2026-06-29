import { defineStore } from "pinia";
import { ref } from "vue";
import { getApiAmlSettingsProject, putApiAmlSettingsProject } from "@dv-admin/utils/services/projects";
import { getApiAmlKeys } from "@dv-admin/utils/services/transferCheck";
import type { IAmlKeysResponse, IAmlSettingsRequest, IAmlSettingsResponse } from "@dv-admin/utils/types/api/apiGo";
import { useNotifications } from "@shared/utils/composables/useNotifications";

const { notify } = useNotifications();

export const useAmlSettingsProjectStore = defineStore("amlSettingsProject", () => {
	const amlSettingsProject = ref<IAmlSettingsResponse | null>(null);
	const connectedAmlProviders = ref<string[]>([]);
	const isLoadingConnectedProviders = ref<boolean>(false);
	const isLoadingPutAmlSettings = ref<boolean>(false);
	const defaultFormAmlSettings = (): IAmlSettingsRequest => ({
		enabled: false,
		provider_slug: "",
		risk_threshold: 75
	});
	const formAmlSettings = ref<IAmlSettingsRequest>(defaultFormAmlSettings());

	const hasAmlKeys = (keys: IAmlKeysResponse[]) => keys.every((item) => Boolean(item.value));

	const getInitialProviderSlug = (
		availableProviders: string[],
		storeSettings: IAmlSettingsResponse | null,
		connectedProviders: string[]
	): string => {
		if (storeSettings?.provider_slug && availableProviders.includes(storeSettings.provider_slug)) {
			return storeSettings.provider_slug;
		}

		const globalConnected = connectedProviders.find((provider) => availableProviders.includes(provider));
		if (globalConnected) return globalConnected;

		return availableProviders[0] ?? "";
	};

	const isProviderGloballyConnected = (slug: string) => connectedAmlProviders.value.includes(slug);

	const getAmlSettingsProject = async (uuid: string) => {
		try {
			const data = await getApiAmlSettingsProject(uuid);
			if (data) amlSettingsProject.value = data;
		} catch (error: any) {
			throw error;
		}
	};

	const getConnectedAmlProviders = async (providers: string[]) => {
		try {
			isLoadingConnectedProviders.value = true;
			const results = await Promise.all(
				providers.map(async (slug) => {
					const data = await getApiAmlKeys(slug);
					return hasAmlKeys(data ?? []) ? slug : null;
				})
			);
			connectedAmlProviders.value = results.filter((slug): slug is string => Boolean(slug));
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingConnectedProviders.value = false;
		}
	};

	const initFormAmlSettings = (availableProviders: string[]) => {
		if (amlSettingsProject.value) {
			formAmlSettings.value = {
				enabled: amlSettingsProject.value.enabled,
				provider_slug: amlSettingsProject.value.provider_slug,
				risk_threshold: amlSettingsProject.value.risk_threshold
			};
			return;
		}

		formAmlSettings.value = {
			enabled: false,
			provider_slug: getInitialProviderSlug(availableProviders, null, connectedAmlProviders.value),
			risk_threshold: 75
		};
	};

	const changeFormAmlProvider = (slug: string) => {
		if (amlSettingsProject.value?.provider_slug === slug) {
			formAmlSettings.value.risk_threshold = amlSettingsProject.value.risk_threshold;
		}
	};

	const setFormAmlProviderEnabled = (slug: string, enabled: boolean) => {
		if (enabled) {
			formAmlSettings.value.provider_slug = slug;
			formAmlSettings.value.enabled = true;
			return;
		}

		if (formAmlSettings.value.provider_slug === slug) {
			formAmlSettings.value.enabled = false;
		}
	};

	const isFormAmlProviderEnabled = (slug: string) =>
		formAmlSettings.value.enabled && formAmlSettings.value.provider_slug === slug;

	const isRiskThresholdValid = (value: number | string | null | undefined): boolean => {
		if (value === null || value === undefined || value === "") return false;

		const normalized = Number(value);
		return Number.isInteger(normalized) && normalized >= 0 && normalized <= 100;
	};

	const getInitialActiveTabSlug = (availableProviders: string[]) => {
		if (formAmlSettings.value.enabled && availableProviders.includes(formAmlSettings.value.provider_slug)) {
			return formAmlSettings.value.provider_slug;
		}

		return getInitialProviderSlug(availableProviders, amlSettingsProject.value, connectedAmlProviders.value);
	};

	const putAmlSettingsProject = async (uuid: string, body: IAmlSettingsRequest, message?: string) => {
		try {
			isLoadingPutAmlSettings.value = true;
			const data = await putApiAmlSettingsProject(uuid, body);
			if (data) amlSettingsProject.value = data;
			if (message) notify(message, "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingPutAmlSettings.value = false;
		}
	};

	const resetAmlSettings = () => {
		amlSettingsProject.value = null;
		connectedAmlProviders.value = [];
		formAmlSettings.value = defaultFormAmlSettings();
	};

	return {
		amlSettingsProject,
		connectedAmlProviders,
		isLoadingConnectedProviders,
		isLoadingPutAmlSettings,
		formAmlSettings,
		isProviderGloballyConnected,
		getAmlSettingsProject,
		getConnectedAmlProviders,
		initFormAmlSettings,
		changeFormAmlProvider,
		setFormAmlProviderEnabled,
		isFormAmlProviderEnabled,
		isRiskThresholdValid,
		getInitialActiveTabSlug,
		putAmlSettingsProject,
		resetAmlSettings
	};
});
