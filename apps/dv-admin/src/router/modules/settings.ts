import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";
import { admin } from "@dv-admin/router/middlewares/admin";

export default [
	{
		path: "/settings",
		name: "settings",
		component: () => import("@dv-admin/views/settings/SettingsView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	// {
	// 	path: "/settings/users",
	// 	name: "settings-users",
	// 	component: () => import("@dv-admin/views/settings/users/UsersView.vue"),
	// 	meta: { layout: APP_LAYOUT.DEFAULT },
	// 	beforeEnter: admin
	// },
	{
		path: "/settings/logs",
		name: "settings-logs",
		component: () => import("@dv-admin/views/settings/logs/LogsView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: admin
	},
	// {
	// 	path: "/settings/logs/:slug",
	// 	name: "settings-logs-show",
	// 	component: () => import("@dv-admin/views/settings/logs/show/ShowLogView.vue"),
	// 	meta: { layout: APP_LAYOUT.DEFAULT },
	// 	beforeEnter: auth
	// },
	{
		path: "/settings/system",
		name: "settings-system",
		component: () => import("@dv-admin/views/settings/system/SystemView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/settings/system/general",
		name: "settings-system-general",
		component: () => import("@dv-admin/views/settings/system/general/GeneralView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/settings/system/mail",
		name: "settings-system-mail",
		component: () => import("@dv-admin/views/settings/system/mail/MailView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: admin
	},
	{
		path: "/settings/system/update",
		name: "settings-system-update",
		component: () => import("@dv-admin/views/settings/system/updateVersion/UpdateVersionView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: admin
	},
	{
		path: "/settings/exchange-rates",
		name: "settings-exchange-rates",
		component: () => import("@dv-admin/views/settings/exchangeRates/ExchangeRatesView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	}
];
