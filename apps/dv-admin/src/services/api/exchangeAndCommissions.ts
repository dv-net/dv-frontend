import api from "@dv-admin/utils/plugins/api";
import type { ICurrenciesRateResponse } from "@dv-admin/utils/types/api/apiGo";

export const getApiCurrenciesRate = async (source: string): Promise<ICurrenciesRateResponse[]> => {
	const resp = await api.get(`/dv-admin/currencies/rate/${source}`);
	return resp.data.data;
};

export const putApiCurrenciesRate = async (rate_scale: string, rate_source: string) => {
	await api.put(`/dv-admin/currencies/rate`, { rate_scale, rate_source });
};
