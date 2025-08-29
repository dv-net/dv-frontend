import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/hot-wallets",
		name: "hotWallets",
		component: () => import("@dv-admin/views/hotWallets/HotWalletsView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	}
];
