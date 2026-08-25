import { APP_LAYOUT } from "@pay-shared/layouts";

export default [
	{
		path: "/:pathMatch(.*)*",
		name: "page-not-found",
		component: () => import("@pay-shared/views/notFound/NotFoundView.vue"),
		meta: { layout: APP_LAYOUT.EMPTY }
	}
];
