import api from "@pay-simple/utils/libs/axios";
import type {
	IPaySimpleInvoiceResponse,
	IPaySimpleInvoiceStatusResponse
} from "@pay-simple/utils/types/paySimple";

export const getApiInvoice = async (uuid: string): Promise<IPaySimpleInvoiceResponse> => {
	const resp = await api.get(`/public/invoices/${uuid}`, { suppressNotify: true } as any);
	return resp.data.data;
};

export const getApiInvoiceStatus = async (uuid: string): Promise<IPaySimpleInvoiceStatusResponse> => {
	const resp = await api.get(`/public/invoices/${uuid}/status`, { suppressNotify: true } as any);
	return resp.data.data;
};
