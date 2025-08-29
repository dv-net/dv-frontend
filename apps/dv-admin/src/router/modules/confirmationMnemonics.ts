import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth.ts";

export default [
	{
		path: "/confirmation-mnemonics",
		name: "confirmation-mnemonics",
		component: () => import("@dv-admin/views/confirmationMnemonics/ConfirmationMnemonicsView.vue"),
		meta: { layout: APP_LAYOUT.INSTALLER },
		beforeEnter: auth
	}
];
