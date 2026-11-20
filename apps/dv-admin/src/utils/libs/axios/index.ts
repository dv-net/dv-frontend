import axios, { type AxiosInstance, HttpStatusCode } from "axios";
import { useAuthStore } from "@dv-admin/stores/auth";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import i18n from "@dv-admin/utils/libs/i18n";

const { notify } = useNotifications();

const REQUEST_TIMEOUT_MS: number = 30_000;
let suppressedErrorNotifyCount = 0;

export const getApiErrorMessage = (error: any): string => {
	const responseMessage = error?.response?.data?.errors?.[0]?.message;
	if (responseMessage) return i18n.global.t(responseMessage);
	return error?.message || "Unknown error";
};

const readRequestBody = (source: unknown) => {
	if (typeof source !== "string") return source;
	try {
		return JSON.parse(source);
	} catch {
		return null;
	}
};

const requestCarriesOtp = (config: any): boolean => {
	return [config?.data, config?.params].some((source) => {
		const data = readRequestBody(source);
		return Boolean(data && typeof data === "object" && (data.otp || data.totp));
	});
};

export const runWithoutErrorNotify = async <T>(action: () => Promise<T>): Promise<T> => {
	suppressedErrorNotifyCount += 1;
	try {
		return await action();
	} finally {
		suppressedErrorNotifyCount -= 1;
	}
};

const api: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: REQUEST_TIMEOUT_MS,
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
		const otpErrorShownInline = suppressedErrorNotifyCount > 0 && requestCarriesOtp(error?.config);
		if (!error?.config?.suppressNotify && !otpErrorShownInline) {
			notify(getApiErrorMessage(error));
		}
		if (error.response?.status === HttpStatusCode.Unauthorized) {
			useAuthStore().removeToken();
		}
		return Promise.reject(error);
	}
);
export default api;
