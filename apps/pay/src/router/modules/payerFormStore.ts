import { APP_LAYOUT } from "@pay/layouts";

export default [
	{
		path: "/store/:slug/:externalId",
		name: "payer-store",
		component: () => import("@pay/views/payerForm/PayerFormView.vue"),
		meta: { layout: APP_LAYOUT.PAYMENT }
	}
];
