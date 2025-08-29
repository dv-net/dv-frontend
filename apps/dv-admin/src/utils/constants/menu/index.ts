import type { RouteItem } from "@dv.net/ui-kit/dist/components/UiLayoutMenu/types";
import IconCorner from "@dv-admin/components/icons/dashboard/IconCorner.vue";
import {
	dashboardAnimation,
	dashboardBetweenButtonAnimation,
	gridAnimation,
	notificationsAnimation,
	searchAnimation,
	settings2Animation,
	support2Animation
} from "@dv.net/ui-kit/dist/helpers/animations-list";

export const mainMenuList: RouteItem[] = [
	{
		path: "/dashboard",
		meta: {
			title: "Dashboard",
			animationIcon: dashboardAnimation
		}
	},
	{
		path: "/projects",
		meta: {
			title: "Projects",
			animationIcon: gridAnimation,
			alwaysOpen: true
		},
		children: [
			{
				path: "/withdrawal",
				meta: {
					title: "Withdrawal rules",
					iconComponent: IconCorner,
					iconComponentActive: IconCorner,
					isChildren: true
				}
			},
			{
				path: "/address-book",
				meta: {
					title: "Address book",
					iconComponent: IconCorner,
					iconComponentActive: IconCorner,
					isChildren: true
				}
			}
		]
	},
	{
		path: "/transfers",
		meta: {
			title: "Transfers",
			animationIcon: dashboardBetweenButtonAnimation,
			alwaysOpen: true
		},
		children: [
			{
				path: "/hot-wallets",
				meta: {
					title: "Hot wallets",
					iconComponent: IconCorner,
					iconComponentActive: IconCorner,
					isChildren: true
				}
			}
		]
	},
	{
		path: "/exchanges",
		meta: {
			title: "Crypto exchanges",
			icon: "timeline",
			iconActive: "timeline"
		}
	},
	{
		path: "/search",
		meta: {
			title: "Search",
			animationIcon: searchAnimation,
			alwaysOpen: true
		},
		children: [
			{
				path: "/history/transactions",
				meta: {
					title: "History",
					iconComponent: IconCorner,
					iconComponentActive: IconCorner,
					isChildren: true
				}
			}
		]
	},
	{
		path: "/settings",
		meta: {
			title: "Settings",
			animationIcon: settings2Animation,
			alwaysOpen: true
		},
		children: [
			// {
			// 	path: "/settings/users",
			// 	meta: {
			// 		title: "Users",
			// 		iconComponent: IconCorner,
			// 		iconComponentActive: IconCorner,
			// 		isChildren: true
			// 	}
			// },
			{
				path: "/settings/logs",
				meta: {
					title: "Logs",
					iconComponent: IconCorner,
					iconComponentActive: IconCorner,
					isChildren: true
				}
			},
			{
				path: "/settings/system",
				meta: {
					title: "System",
					iconComponent: IconCorner,
					iconComponentActive: IconCorner,
					isChildren: true
				}
			},
			{
				path: "/settings/exchange-rates",
				meta: {
					title: "Exchange rates",
					iconComponent: IconCorner,
					iconComponentActive: IconCorner,
					isChildren: true
				}
			}
		]
	},
	{
		path: "/notifications",
		meta: {
			title: "Notifications",
			animationIcon: notificationsAnimation
		}
	},
	{
		path: "/transfer-check",
		meta: {
			title: "AML check",
			animationIcon: searchAnimation
		}
	},
	{
		path: "/support",
		meta: {
			title: "Support",
			animationIcon: support2Animation
		}
	}
];
