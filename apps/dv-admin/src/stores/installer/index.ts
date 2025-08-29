import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import type { IProcessingDataClientRequest, ISignInRequest, ISignUpRequest } from "@dv-admin/utils/types/api/apiGo";
import { postAuthUser } from "@dv-admin/services/api/auth";
import { postApiProcessingInit, postRegisterInstaller } from "@dv-admin/services/api/installer";
import { getLocaleUser, getTimeZoneUser } from "@shared/utils/helpers/locale";
import { useAuthStore } from "@dv-admin/stores/auth";
import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";
import { useRouter } from "vue-router";

export const useInstallerStore = defineStore("installer", () => {
	const router = useRouter();
	const { setToken, getUser } = useAuthStore();
	const { isShowMainLoader } = storeToRefs(useAuthStore());

	const isLoading = ref<boolean>(false);
	const processingData = ref<IProcessingDataClientRequest>({
		host: "http://127.0.0.1:9000",
		callback_domain: "http://localhost",
		merchant_domain: window.location.origin ?? "",
		merchant_pay_form_domain: window.location.origin ?? ""
	});

	const initInstaller = async () => {
		try {
			await postProcessingInit();
			await Promise.all([useSystemSettingsStore().getSystemInfo(), getUser()]);
			await router.push({ name: "confirmation-mnemonics" });
		} catch (error: any) {
			throw error;
		}
	};
	const registrationInstaller = async (form: Omit<ISignUpRequest, "terms" | "cf-turnstile-response">) => {
		try {
			isLoading.value = true;
			isShowMainLoader.value = true;
			form.location = getTimeZoneUser() ?? "";
			form.language = getLocaleUser() ?? "";
			const token = await postRegisterInstaller(form);
			setToken(token);
			await initInstaller();
		} catch (error: any) {
			isShowMainLoader.value = false;
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const loginInstaller = async (body: ISignInRequest) => {
		try {
			isLoading.value = true;
			isShowMainLoader.value = true;
			const token = await postAuthUser(body);
			setToken(token);
			await initInstaller();
		} catch (error: any) {
			isShowMainLoader.value = false;
			throw error;
		} finally {
			isLoading.value = false;
		}
	};
	const postProcessingInit = async () => {
		try {
			await postApiProcessingInit(processingData.value);
		} catch (error: any) {
			throw error;
		}
	};

	return {
		isLoading,
		processingData,
		registrationInstaller,
		loginInstaller,
		postProcessingInit
	};
});
