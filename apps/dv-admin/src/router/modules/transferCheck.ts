import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/transfer-check",
		name: "transfer-check",
		component: () => import("@dv-admin/views/transferCheck/TransferCheckView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/transfer-check/connect/:aml",
		name: "transfer-check-connect-aml",
		component: () => import("@dv-admin/views/transferCheck/connect/ConnectView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	}
];
