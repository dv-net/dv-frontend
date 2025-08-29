import { createRouter, createWebHistory } from "vue-router";

import { routes } from "@dv-admin/router/routes";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
	scrollBehavior(to) {
		if (to.hash) {
			return {
				el: to.hash,
				behavior: "smooth"
			};
		}
	}
});

router.beforeEach((to, from, next) => {
	sessionStorage.setItem("fromRoute", from.fullPath);
	sessionStorage.setItem("toRoute", to.fullPath);
	next();
});
export default router;
