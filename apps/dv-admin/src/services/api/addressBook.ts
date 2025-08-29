import api from "@dv-admin/utils/plugins/api";
import type {
	IAddressBookRequest,
	IAddressBookResponse,
	IDeleteAddressBookRequest
} from "@dv-admin/utils/types/api/apiGo.ts";

export const getApiWithdrawalAddressBook = async (): Promise<IAddressBookResponse> => {
	const resp = await api.get(`/dv-admin/withdrawal/address-book`);
	return resp.data.data;
};

export const postApiWithdrawalAddressBook = async (body: IAddressBookRequest) => {
	await api.post(`/dv-admin/withdrawal/address-book`, body);
};

export const deleteApiWithdrawalAddressBook = async (data: IDeleteAddressBookRequest) => {
	const config = { data };
	await api.delete(`/dv-admin/withdrawal/address-book`, config);
};
