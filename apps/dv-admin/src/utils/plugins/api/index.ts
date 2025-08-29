import axios, { type AxiosInstance, HttpStatusCode } from "axios";
import { useAuthStore } from "@dv-admin/stores/auth";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import i18n from "@dv-admin/utils/plugins/i18n";

const { notify } = useNotifications();

const api: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json"
	}
});

api.interceptors.request.use((config) => {
	const token = useAuthStore().getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	} else {
		config.headers.Authorization = null;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Pass { suppressNotify: true } in request config if you don't want to show the error
		if (!error?.config?.suppressNotify) {
			if (error?.response?.data?.errors?.[0]?.message) {
				notify(i18n.global.t(error.response.data.errors[0].message));
			} else {
				notify(error.message || "Unknown error");
			}
		}
		if (error.response.status === HttpStatusCode.Unauthorized) {
			useAuthStore().removeToken();
		}
		return Promise.reject(error);
	}
);
export default api;
