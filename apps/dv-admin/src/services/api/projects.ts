import type {
	ICurrencyRequest,
	IStoreApiKeyResponse,
	IStoreRequest,
	IStoreResponse,
	IStoreSettingsResponse,
	IStoreWebhooksResponse,
	IStoreWebhookTestRequest,
	IStoreWebhookTestResponse,
} from "@dv-admin/utils/types/api/apiGo";
import api from "@dv-admin/utils/plugins/api";
import type { BlockchainType } from "@shared/utils/types/blockchain";

export const postApiCreateStore = async (body = {} as IStoreRequest): Promise<IStoreResponse> => {
	const resp = await api.post("/dv-admin/store", body);
	return resp.data.data;
};

export const postApiStoreArchive = async (uuid: string, otp: string) => {
	await api.post(`/dv-admin/store/${uuid}/archive`, { otp });
};

export const postApiStoreUnarchive = async (uuid: string, otp: string) => {
	await api.post(`/dv-admin/store/${uuid}/unarchive`, { otp });
};

export const getApiStoreArchivedList = async (): Promise<IStoreResponse[]> => {
	const resp = await api.get(`/dv-admin/store/archived`);
	return resp.data.data;
};

export const getApiProjects = async (): Promise<IStoreResponse[]> => {
	const resp = await api.get("/dv-admin/store");
	return resp.data.data;
};

export const getApiOneProject = async (uuid: string): Promise<IStoreResponse> => {
	const resp = await api.get(`/dv-admin/store/${uuid}`);
	return resp.data.data;
};

export const getApiStoreSecret = async (uuid: string): Promise<string> => {
	const resp = await api.get(`/dv-admin/store/${uuid}/secret`);
	return resp.data.data.secret;
};

export const postApiStoreSecret = async (uuid: string): Promise<string> => {
	const resp = await api.post(`/dv-admin/store/${uuid}/secret`);
	return resp.data.data.secret;
};

export const putApiOneProject = async (body: IStoreResponse) => {
	await api.put(`/dv-admin/store/${body.id}`, body);
};

export const getApiKeyProject = async (uuid: string): Promise<IStoreApiKeyResponse[]> => {
	const resp = await api.get(`/dv-admin/store/${uuid}/apikey`);
	return resp.data.data;
};

export const postApiKeyProject = async (uuid: string): Promise<IStoreApiKeyResponse> => {
	const resp = await api.post(`/dv-admin/store/${uuid}/apikey`);
	return resp.data.data;
};

export const getApiWebhooksProject = async (uuid: string): Promise<IStoreWebhooksResponse[]> => {
	const resp = await api.get(`/dv-admin/store/${uuid}/webhooks`);
	return resp.data.data;
};

export const postApiWebhookSendTest = async (
	body = {} as IStoreWebhookTestRequest
): Promise<IStoreWebhookTestResponse> => {
	const resp = await api.post(`/dv-admin/webhook/send-test`, body);
	return resp.data.data;
};

export const postApiWebhooksProject = async (
	uuid: string,
	body = {} as IStoreWebhooksResponse
): Promise<IStoreWebhooksResponse> => {
	const resp = await api.post(`/dv-admin/store/${uuid}/webhooks`, body);
	return resp.data.data;
};

export const putApiWebhooksProject = async (uuid: string, body = {} as IStoreWebhooksResponse): Promise<void> => {
	await api.put(`/dv-admin/store/${uuid}/webhooks/${body.id}`, body);
};

export const getApiCurrenciesProject = async (uuid: string): Promise<BlockchainType[]> => {
	const resp = await api.get(`/dv-admin/store/${uuid}/currencies`);
	return resp.data.data;
};

export const putApiCurrenciesProject = async (uuid: string, body: ICurrencyRequest) => {
	await api.put(`/dv-admin/store/${uuid}/currencies`, body);
};

export const getApiStoreSettingList = async (uuid: string): Promise<IStoreSettingsResponse[]> => {
	const resp = await api.get(`/dv-admin/store-setting/list/${uuid}`);
	return resp.data.data;
};

export const postApiStoreSetting = async (uuid: string, body: { name: string, value: string }) => {
	await api.post(`/dv-admin/store-setting/${uuid}`, body);
};


export const deleteApiWhitelistsProject = async (uuid: string, ip: string): Promise<void> => {
	await api.delete(`/dv-admin/store/${uuid}/whitelists/${ip}`);
};

export const getApiWhitelistsProject = async (uuid: string): Promise<string[]> => {
	const resp = await api.get(`/dv-admin/store/${uuid}/whitelists`);
	return resp.data.data;
};

export const patchApiWhitelistsProject = async (uuid: string, ip: string) => {
	await api.patch(`/dv-admin/store/${uuid}/whitelists`, { ip });
};
