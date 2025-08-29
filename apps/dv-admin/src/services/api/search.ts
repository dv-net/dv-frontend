import api from "@dv-admin/utils/plugins/api";
import type { ISearchDataResponse } from "@dv-admin/utils/types/api/apiGo";

export const getApiSearchData = async (searchParam: string): Promise<ISearchDataResponse> => {
	const resp = await api.get(`/dv-admin/search/${searchParam}`);
	return resp.data.data;
};
