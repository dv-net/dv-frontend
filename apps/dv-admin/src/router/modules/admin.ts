import { APP_LAYOUT } from "@dv-admin/layouts";
import { admin } from "@dv-admin/router/middlewares/admin";

export default [
	{
		path: "/admin",
		name: "admin",
		component: () => import("@dv-admin/views/admin/AdminView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: admin
	},
	{
		path: "/admin/users",
		name: "admin-users",
		component: () => import("@dv-admin/views/admin/users/UsersView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: admin
	},
	{
		path: "/admin/projects",
		name: "admin-projects",
		component: () => import("@dv-admin/views/admin/projects/ProjectsView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: admin
	}
];
