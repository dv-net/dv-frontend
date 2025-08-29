import type { ISettingsRequest, ISettingsResponse, ISystemInfoResponse } from "@dv-admin/utils/types/api/apiGo";
import api from "@dv-admin/utils/plugins/api";

export const getApiSystemInfo = async (): Promise<ISystemInfoResponse> => {
	const resp = await api.get(`/dv-admin/system/info`);
	return resp.data.data;
};

export const getApiRootSettings = async (): Promise<ISettingsResponse[]> => {
	const resp = await api.get(`/dv-admin/root-setting/list`);
	return resp.data.data;
};

export const postApiRootSetting = async (body: ISettingsRequest, otp: string | null) => {
	await api.post(`/dv-admin/root-setting`, { name: body.name, value: body.value, ...(otp ? { otp } : {}) });
};

export const deleteApiRootSetting = async (name: string, otp: string | null) => {
	await api.post(`/dv-admin/root-setting`, { name, otp });
};

export const getApiProcessingCallbackUrl = async (): Promise<string> => {
	const resp = await api.get(`/dv-admin/processing/callback-url`);
	return resp.data.data.callback_url;
};

export const postApiProcessingCallbackUrl = async (domain: string | null) => {
	await api.post(`/dv-admin/processing/callback-url`, { domain });
};

export const getApiUserSettings = async (): Promise<ISettingsResponse[]> => {
	const resp = await api.get(`/dv-admin/user-setting/list`);
	return resp.data.data;
};

export const postApiUserSettings = async (body: ISettingsRequest, otp: string | null) => {
	await api.post(`/dv-admin/user-setting`, { name: body.name, value: body.value, ...(otp ? { otp } : {}) });
};

export const postApiSystemUpdateBackend = async () => {
	await api.post(`/dv-admin/system/update/backend`);
};

export const postApiSystemUpdateProcessing = async () => {
	await api.post(`/dv-admin/system/update/processing`);
};
