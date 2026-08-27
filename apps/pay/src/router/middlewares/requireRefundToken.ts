import { REFUND_TOKEN_KEY } from "@pay/utils/constants/refund";
import { getCookie } from "@shared/utils/helpers/cookie";

export const requireRefundToken = () => {
	if (!getCookie(REFUND_TOKEN_KEY)) {
		return { name: "refund-entry" };
	}
};
