import axios, { type AxiosInstance } from "axios";
import { useNotifications } from "@shared/utils/composables/useNotifications";

const { notify } = useNotifications();

const api: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json"
	}
});

api.interceptors.request.use((config) => {
	const token: string = "";
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
				notify(error.response.data.errors[0].message);
			} else {
				notify(error.message || "Unknown error");
			}
		}
		return Promise.reject(error);
	}
);
export default api;
