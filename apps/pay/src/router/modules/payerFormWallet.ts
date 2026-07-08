import { APP_LAYOUT } from "@pay/layouts";

export default [
	{
		path: "/wallet/:payerId",
		name: "payer-wallet",
		component: () => import("@pay/views/payerForm/PayerFormView.vue"),
		meta: { layout: APP_LAYOUT.PAYMENT }
	}
];
