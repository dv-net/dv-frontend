import { APP_LAYOUT } from "@dv-admin/layouts";
import { guest } from "@dv-admin/router/middlewares/guest";

export default [
	{
		path: "/",
		name: "home",
		component: () => import("@dv-admin/views/home/HomeView.vue"),
		meta: { layout: APP_LAYOUT.AUTH },
		redirect: () => ({ name: "sign-in" }),
		beforeEnter: guest
	}
];
