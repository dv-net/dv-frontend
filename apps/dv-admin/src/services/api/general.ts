import api from "@dv-admin/utils/plugins/api";
import type { IDictionary, ISystemVersions } from "@dv-admin/utils/types/api/apiGo";

export const getApiDictionary = async (suppressNotify: boolean): Promise<IDictionary> => {
	const resp = await api.get("/dv-admin/dictionaries", { suppressNotify });
	return resp.data.data;
};

export const getApiSystemVersions = async (suppressNotify: boolean): Promise<ISystemVersions> => {
	const resp = await api.get("/dv-admin/system/versions", { suppressNotify });
	return resp.data.data;
};

export const postApiNotificationsTest = async (recipient: string) => {
	await api.post("/dv-admin/notifications/test", { recipient });
};

export const getApiMnemonicGenerate = async (length: string): Promise<string> => {
	const config = { params: { length } };
	const resp = await api.get("/public/mnemonic/generate", config);
	return resp.data.data.mnemonic;
};
