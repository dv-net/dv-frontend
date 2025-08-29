import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@pay/router/routes.ts";

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

export default router;
