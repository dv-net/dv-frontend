import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/dashboard",
		name: "dashboard",
		component: () => import("@dv-admin/views/dashboard/DashboardView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/dashboard-tron-settings",
		name: "dashboard-tron-settings",
		component: () => import("@dv-admin/views/dashboard/tronSettings/TronSettings.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	}
];
