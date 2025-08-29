import type { IProfileRowAdvantagesCards, IProfileRowConnectTelegram } from "@dv-admin/utils/types/schemas";
import { markRaw } from "vue";
import IconTgLink from "@dv-admin/components/icons/profile/IconTgLink.vue";
import IconQrCode from "@dv-admin/components/icons/profile/IconQrCode.vue";
import IconSearch from "@dv-admin/components/icons/profile/IconSearch.vue";

export const topicsNotifications: string[] = ["System (cannot be disabled)", "Events", "Reports"];

export const titlesNotifications: Record<string, string> = {
	user_forgot_password: "Change password",
	system_error: "System errors",
	webhook_error: "Webhook errors",
	transfer: "Transfers",
	payment_received: "Receiving payment",
	webhook_sent: "Sending a webhook",
	invoice_created: "Create an account",
	exrate_gap: "Abrupt change in exchange rate",
	daily_report: "Daily report",
	weekly_report: "Weekly report",
	monthly_report: "Monthly report"
};

export const itemsTelegram: IProfileRowConnectTelegram[] = [
	{
		id: 1,
		icon: markRaw(IconTgLink),
		title: "Link to the Telegram bot",
		text: "Just click the link to subscribe immediately"
	},
	{
		id: 2,
		icon: markRaw(IconQrCode),
		title: "Scan the QR code",
		text: "Point your camera at the QR code to quickly open the bot and start using its features"
	},
	{
		id: 3,
		icon: markRaw(IconSearch),
		title: "Find by ID",
		text: "You can also find us through search and enter the code manually"
	}
];

export const advantagesCardsTelegram: IProfileRowAdvantagesCards[] = [
	{
		id: 1,
		iconName: "contract",
		title: "Reports ",
		text: "We send you regular reports on all movements of your funds"
	},
	{
		id: 2,
		iconName: "settings",
		title: "Settings ",
		text: "You can control what messages you want to receive"
	},
	{
		id: 3,
		iconName: "campaign",
		title: "Events",
		text: "We can notify you about every deposit and withdrawal"
	},
	{
		id: 4,
		iconName: "error",
		title: "Errors",
		text: "You will find out about a problem with a transfer, webhook or crypto exchange in a matter of seconds"
	}
];
