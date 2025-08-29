import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/profile",
		name: "profile",
		component: () => import("@dv-admin/views/profile/ProfileView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth,
		redirect: () => ({ name: "profile-personal-data" }),
		children: [
			{
				path: "personal-data",
				name: "profile-personal-data",
				component: () => import("@dv-admin/views/profile/personalData/PersonalDataView.vue")
			},
			{
				path: "settings",
				name: "profile-settings",
				component: () => import("@dv-admin/views/profile/settings/SettingsView.vue")
			},
			{
				path: "notifications",
				name: "profile-notifications",
				component: () => import("@dv-admin/views/profile/notifications/NotificationsView.vue")
			}
		]
	},
	{
		path: "/profile/telegram",
		name: "profile-telegram",
		component: () => import("@dv-admin/views/profile/telegram/TelegramView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	}
];
