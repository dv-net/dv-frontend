import { APP_LAYOUT } from "@pay-simple/layouts";

export default [
	{
		path: "/:pathMatch(.*)*",
		name: "page-not-found",
		component: () => import("@pay-simple/views/notFound/NotFoundView.vue"),
		meta: { layout: APP_LAYOUT.EMPTY }
	}
];
