import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/exchanges",
		name: "exchanges",
		component: () => import("@dv-admin/views/exchanges/ExchangesView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/exchanges/connect",
		name: "exchanges-connect",
		component: () => import("@dv-admin/views/exchanges/connect/ConnectView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/exchanges/connect/:slug",
		name: "exchanges-connect-one",
		component: () => import("@dv-admin/views/exchanges/connect/showOne/ShowOneView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/exchanges/convert/:slug",
		name: "exchanges-convert",
		component: () => import("@dv-admin/views/exchanges/convert/ConvertView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/exchanges/convert/:slug/history",
		name: "exchanges-convert-history",
		component: () => import("@dv-admin/views/exchanges/convert/history/HistoryView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/exchanges/withdrawal/:slug",
		name: "exchanges-withdrawal",
		component: () => import("@dv-admin/views/exchanges/withdrawal/WithdrawalView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/exchanges/withdrawal/:slug/history",
		name: "exchanges-withdrawal-history",
		component: () => import("@dv-admin/views/exchanges/withdrawal/history/HistoryView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	}
];
