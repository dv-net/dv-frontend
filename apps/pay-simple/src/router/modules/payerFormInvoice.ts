import { APP_LAYOUT } from "@pay-simple/layouts";

export default [
	{
		path: "/invoice/:uuid",
		name: "payer-invoice",
		component: () => import("@pay-simple/views/payerForm/PayerFormView.vue"),
		meta: { layout: APP_LAYOUT.PAYMENT }
	}
];
