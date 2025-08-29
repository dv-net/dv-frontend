import type {
	IProcessingDataClientRequest,
	IProcessingDataClientResponse,
	ISignUpRequest
} from "@dv-admin/utils/types/api/apiGo";
import api from "@dv-admin/utils/plugins/api";

export const postRegisterInstaller = async (
	body: Omit<ISignUpRequest, "terms" | "cf-turnstile-response">
): Promise<string> => {
	const resp = await api.post("/dv-admin/auth/register-root", body);
	return resp.data.data.token;
};

export const postApiProcessingInit = async (
	body: IProcessingDataClientRequest
): Promise<IProcessingDataClientResponse> => {
	const resp = await api.post("/dv-admin/processing/init", body);
	return resp.data.data;
};
