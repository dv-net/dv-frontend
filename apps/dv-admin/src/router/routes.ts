import type { RouteRecordRaw } from "vue-router";
import auth from "@dv-admin/router/modules/auth";
import dashboard from "@dv-admin/router/modules/dashboard";
import hotWallets from "@dv-admin/router/modules/hotWallets";
import projects from "@dv-admin/router/modules/projects";
import support from "@dv-admin/router/modules/support";
import search from "@dv-admin/router/modules/search";
import transfers from "@dv-admin/router/modules/transfers";
import home from "@dv-admin/router/modules/home";
import profile from "@dv-admin/router/modules/profile";
import installer from "@dv-admin/router/modules/installer";
import withdrawal from "@dv-admin/router/modules/withdrawal";
import notFound from "@dv-admin/router/modules/notFound";
import userSettings from "@dv-admin/router/modules/userSettings";
import transactionHistory from "@dv-admin/router/modules/history";
import settings from "@dv-admin/router/modules/settings";
import exchanges from "@dv-admin/router/modules/exchanges";
import quickStart from "@dv-admin/router/modules/quickStart";
import confirmationMnemonics from "@dv-admin/router/modules/confirmationMnemonics.ts";
import transferCheck from "@dv-admin/router/modules/transferCheck.ts";
import notifications from "@dv-admin/router/modules/notifications.ts";
import addressBook from "@dv-admin/router/modules/addressBook.ts";

export const routes: Array<RouteRecordRaw> = [
	...home,
	...exchanges,
	...auth,
	...installer,
	...withdrawal,
	...dashboard,
	...profile,
	...settings,
	...transactionHistory,
	...hotWallets,
	...projects,
	...support,
	...search,
	...transfers,
	...notFound,
	...userSettings,
	...quickStart,
	...confirmationMnemonics,
	...transferCheck,
	...notifications,
	...addressBook
];
