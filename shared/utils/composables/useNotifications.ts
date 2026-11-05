import { UiNotification } from "@dv.net/ui-kit";

type NotificationsType = "success" | "error" | "info";
type Notifications = (message?: string, type?: NotificationsType, title?: string) => void;
export const useNotifications = () => {
	const notify: Notifications = (message = "Internal server error", type, title) => {
		UiNotification(message, type, title);
	};

	return {
		notify
	};
};
