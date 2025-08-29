import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/withdrawal",
		name: "withdrawal",
		component: () => import("@dv-admin/views/withdrawal/WithdrawalView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/withdrawal/addresses/:currencyId",
		name: "withdrawal-addresses",
		component: () => import("@dv-admin/views/withdrawal/addresses/AddressesView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	}
];
