import api from "@dv-admin/utils/plugins/api";
import type {
	ILogsResponse,
	IMonitorsCurrentTypeListResponse,
	IMonitorsResponse
} from "@dv-admin/utils/types/api/apiGo";

export const getApiMonitors = async (): Promise<IMonitorsResponse[]> => {
	const resp = await api.get("/dv-admin/logs");
	return resp.data.data.items;
};

export const getApiMonitorsSlug = async (slug: string): Promise<IMonitorsCurrentTypeListResponse[]> => {
	const resp = await api.get(`/dv-admin/logs/${slug}`);
	return resp.data.data.items;
};

export const getApiLogsLast = async (): Promise<ILogsResponse[]> => {
	const resp = await api.get("/dv-admin/logs/last");
	return resp.data.data.items;
};

export const getApiLogsLastProcessing = async (): Promise<ILogsResponse[]> => {
	const resp = await api.get("/dv-admin/logs/last-processing");
	return resp.data.data.items;
};
