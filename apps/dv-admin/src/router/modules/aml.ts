import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/aml",
		name: "aml",
		component: () => import("@dv-admin/views/aml/AmlView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/aml/keys",
		name: "aml-keys",
		component: () => import("@dv-admin/views/aml/connect/ConnectView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/aml/settings/:aml",
		name: "aml-settings",
		component: () => import("@dv-admin/views/aml/settings/SettingsView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/aml/manual-check/:aml",
		name: "aml-manual-check",
		component: () => import("@dv-admin/views/aml/manualCheck/ManualCheckView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	}
];
