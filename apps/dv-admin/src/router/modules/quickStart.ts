import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/quick-start",
		name: "quick-start",
		component: () => import("@dv-admin/views/quickStart/QuickStartView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	}
];
