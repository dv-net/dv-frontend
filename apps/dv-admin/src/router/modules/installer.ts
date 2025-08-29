import { APP_LAYOUT } from "@dv-admin/layouts";
import { initialized } from "@dv-admin/router/middlewares/initialized";

export default [
	{
		path: "/installer",
		name: "installer",
		component: () => import("@dv-admin/views/installer/InstallerView.vue"),
		meta: { layout: APP_LAYOUT.INSTALLER },
		beforeEnter: initialized,
		redirect: () => ({ name: "installer-system-check" }),
		children: [
			{
				path: "system-check",
				name: "installer-system-check",
				component: () => import("@dv-admin/views/installer/InstallerSystemCheckView.vue")
			},
			{
				path: "sign-up",
				name: "installer-sign-up",
				component: () => import("@dv-admin/views/installer/InstallerSignUpView.vue")
			}
		]
	}
];
