import { UiNotification } from "@dv.net/ui-kit";

type NotificationsType = "success" | "error";
type Notifications = (message?: string, type?: NotificationsType) => void;
export const useNotifications = () => {
	const notify: Notifications = (message = "Internal server error", type) => {
		UiNotification(message, type, false);
	};

	return {
		notify
	};
};
