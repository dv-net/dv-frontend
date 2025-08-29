import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/projects",
		name: "projects",
		component: () => import("@dv-admin/views/projects/ProjectsView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/projects/create",
		name: "projects-create",
		component: () => import("@dv-admin/views/projects/create/CreateView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/projects/archive",
		name: "projects-archive",
		component: () => import("@dv-admin/views/projects/archive/ArchiveView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/projects/:id",
		name: "projects-edit",
		component: () => import("@dv-admin/views/projects/edit/EditView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth,
		redirect: () => ({ name: "projects-edit-main" }),
		children: [
			{
				path: "main",
				name: "projects-edit-main",
				component: () => import("@dv-admin/views/projects/edit/main/MainView.vue")
			},
			{
				path: "advanced-settings",
				name: "projects-edit-advanced-settings",
				component: () => import("@dv-admin/views/projects/edit/advancedSettings/AdvancedSettingsView.vue")
			}
		]
	}
];
