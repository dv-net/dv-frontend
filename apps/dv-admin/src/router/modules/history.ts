import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/history",
		name: "history",
		component: () => import("@dv-admin/views/history/HistoryView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		redirect: () => ({ name: "history-transactions" }),
		beforeEnter: auth,
		children: [
			{
				path: "/history/transactions",
				name: "history-transactions",
				component: () => import("@dv-admin/views/history/transactionHistory/TransactionHistoryView.vue")
			},
			{
				path: "/history/webhooks",
				name: "history-webhooks",
				component: () => import("@dv-admin/views/history/webhooksHistory/HistoryWebhooksView.vue")
			}
		]
	}
];
