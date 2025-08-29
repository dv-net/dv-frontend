import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/search",
		name: "search",
		component: () => import("@dv-admin/views/search/SearchView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth,
		children: [
			{
				path: "wallets/:searchParams",
				name: "search-wallets",
				component: () => import("@dv-admin/views/search/wallets/WalletsView.vue")
			},
			{
				path: "address/:hash",
				name: "search-address",
				component: () => import("@dv-admin/views/search/address/AddressView.vue")
			},
			{
				path: "transaction/:hash",
				name: "search-transaction",
				component: () => import("@dv-admin/views/search/transaction/TransactionView.vue")
			}
		]
	}
];
