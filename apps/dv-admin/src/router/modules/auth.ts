import { APP_LAYOUT } from "@dv-admin/layouts";
import { guest } from "@dv-admin/router/middlewares/guest";

export default [
	{
		path: "/auth",
		name: "auth",
		component: () => import("@dv-admin/views/auth/AuthView.vue"),
		meta: { layout: APP_LAYOUT.AUTH },
		beforeEnter: guest,
		redirect: () => ({ name: "sign-in" }),
		children: [
			{
				path: "sign-in",
				name: "sign-in",
				component: () => import("@dv-admin/views/auth/signIn/SignInView.vue")
			},
			{
				path: "sign-up",
				name: "sign-up",
				component: () => import("@dv-admin/views/auth/signUp/SignUpView.vue")
			},
			{
				path: "reset-password",
				name: "reset-password",
				component: () => import("@dv-admin/views/auth/resetPassword/ResetPasswordView.vue")
			},
			{
				path: "set-new-password",
				name: "set-new-password",
				component: () => import("@dv-admin/views/auth/setNewPassword/SetNewPasswordView.vue")
			}
		]
	}
];
