import type { RouteLocationNormalized } from "vue-router";
import { getRefundTokenCookieKey } from "@pay/utils/constants/refund";
import { buildRefundEntryPartialRoute, parseRefundEntryPartialQuery } from "@pay/utils/helpers/refundEntry";
import { getCookie } from "@shared/utils/helpers/cookie";

export const requireRefundToken = (to: RouteLocationNormalized) => {
	const context = parseRefundEntryPartialQuery(to.query);
	const token = context ? getCookie(getRefundTokenCookieKey(context.store_id, context.wallet_id)) : null;

	if (!token) {
		return context ? buildRefundEntryPartialRoute(context) : { name: "refund-entry" };
	}
};
