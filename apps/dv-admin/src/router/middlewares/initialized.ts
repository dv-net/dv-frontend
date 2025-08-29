import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { checkSystemInfo } from "@dv-admin/router/middlewares/utils";

export const initialized = async (
	to: RouteLocationNormalized,
	_: RouteLocationNormalized,
	next: NavigationGuardNext
) => {
	if (await checkSystemInfo()) {
		return next({ name: "sign-in" });
	}
	return next();
};
