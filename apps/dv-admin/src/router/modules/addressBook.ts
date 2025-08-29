import { APP_LAYOUT } from "@dv-admin/layouts";
import { auth } from "@dv-admin/router/middlewares/auth";

export default [
	{
		path: "/address-book",
		name: "address-book",
		component: () => import("@dv-admin/views/addressBook/AddressBookView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	},
	{
		path: "/address-book/create",
		name: "address-book-create",
		component: () => import("@dv-admin/views/addressBook/create/CreateView.vue"),
		meta: { layout: APP_LAYOUT.DEFAULT },
		beforeEnter: auth
	}
];
