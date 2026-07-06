import { checkSystemInfo } from "@dv-admin/router/middlewares/utils";

export const initialized = async () => {
	if (await checkSystemInfo()) {
		return { name: "sign-in" };
	}
	return true;
};
