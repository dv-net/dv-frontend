import type { RouteLocationRaw, LocationQuery } from "vue-router";
import type { IRefundEntryPartialQuery, IRefundEntryQuery } from "@pay/utils/types/refund";

const readQueryValue = (value: LocationQuery[string]): string => {
	if (typeof value === "string") return value.trim();
	if (Array.isArray(value) && typeof value[0] === "string") return value[0].trim();
	return "";
};

export const buildRefundEntryRoute = ({ wallet_id, store_id, email }: IRefundEntryQuery): RouteLocationRaw => ({
	name: "refund-entry",
	query: { wallet_id, store_id, email }
});

export const buildRefundEntryPartialRoute = ({ wallet_id, store_id }: IRefundEntryPartialQuery): RouteLocationRaw => ({
	name: "refund-entry",
	query: { wallet_id, store_id }
});

export const buildRefundCabinetRoute = ({ wallet_id, store_id }: IRefundEntryPartialQuery): RouteLocationRaw => ({
	name: "refund-cabinet",
	query: { wallet_id, store_id }
});

export const parseRefundEntryQuery = (query: LocationQuery): IRefundEntryQuery | null => {
	const wallet_id = readQueryValue(query.wallet_id);
	const store_id = readQueryValue(query.store_id);
	const email = readQueryValue(query.email);
	if (!wallet_id || !store_id || !email) return null;
	return { wallet_id, store_id, email };
};

export const parseRefundEntryPartialQuery = (query: LocationQuery): IRefundEntryPartialQuery | null => {
	const wallet_id = readQueryValue(query.wallet_id);
	const store_id = readQueryValue(query.store_id);
	if (!wallet_id || !store_id) return null;
	return { wallet_id, store_id };
};
