import { APP_LAYOUT } from "@dv-admin/layouts";

export default [
	{
		path: "/:pathMatch(.*)*",
		name: "page-not-found",
		component: () => import("@dv-admin/views/notFound/NotFoundView.vue"),
		meta: { layout: APP_LAYOUT.EMPTY }
	}
];
