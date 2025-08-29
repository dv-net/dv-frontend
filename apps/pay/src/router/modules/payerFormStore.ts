import { APP_LAYOUT } from "@pay/layouts";
import PayerFormView from "@pay/views/payerForm/PayerFormView.vue";

export default [
	{
		path: "/store/:slug/:externalId",
		name: "payer-store",
		component: PayerFormView,
		meta: { layout: APP_LAYOUT.PAYMENT }
	}
];
