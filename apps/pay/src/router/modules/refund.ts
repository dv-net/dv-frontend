import { APP_LAYOUT } from "@pay-shared/layouts";
import { requireRefundToken } from "@pay/router/middlewares/requireRefundToken";

export default [
	{
		path: "/refund",
		name: "refund-entry",
		component: () => import("@pay/views/refund/RefundEntryView.vue"),
		meta: { layout: APP_LAYOUT.PAYMENT, whiteBackground: true }
	},
	{
		path: "/refund/cabinet",
		name: "refund-cabinet",
		component: () => import("@pay/views/refund/RefundCabinetView.vue"),
		meta: { layout: APP_LAYOUT.PAYMENT, whiteBackground: true },
		beforeEnter: requireRefundToken
	}
];
