import { APP_LAYOUT } from "@pay/layouts";
import PayerFormView from "@pay/views/payerForm/PayerFormView.vue";

export default [
	{
		path: "/wallet/:payerId",
		name: "payer-wallet",
		component: PayerFormView,
		meta: { layout: APP_LAYOUT.PAYMENT }
	}
];
