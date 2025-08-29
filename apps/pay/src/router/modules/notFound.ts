import { APP_LAYOUT } from "@pay/layouts";

export default [
	{
		path: "/:pathMatch(.*)*",
		name: "page-not-found",
		component: () => import("@pay/views/notFound/NotFoundView.vue"),
		meta: { layout: APP_LAYOUT.EMPTY }
	}
];
