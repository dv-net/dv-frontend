// Check if less than 24 hours passed between two dates (both dates should be in UTC 0)
// Returns true if less than 24 hours, false if 24 hours or more
export const isLessThan24Hours = (date1: string | Date, date2: string | Date): boolean => {
	if (!date1 || !date2) return false;
	const date1Obj = typeof date1 === "string" ? new Date(date1) : date1;
	const date2Obj = typeof date2 === "string" ? new Date(date2) : date2;
	if (isNaN(date1Obj.getTime()) || isNaN(date2Obj.getTime())) return false;
	const diffInMs = Math.abs(date2Obj.getTime() - date1Obj.getTime());
	const diffInHours = diffInMs / 3600000; // milliseconds to hours
	return diffInHours < 24;
};

// Format time ago from UTC date
// Returns empty string if more than 24 hours
// Returns "только что" if less than 1 minute
// Returns "43 мин. назад" if 1-59 minutes
// Returns "1ч35мин" if 60+ minutes (without zeros)
export const formatTimeAgo = (
	dateUtc: string,
	t: (key: string) => string
): string => {
	if (!dateUtc || typeof dateUtc !== "string") return "";

	const now = new Date();
	const date = new Date(dateUtc);

	if (isNaN(date.getTime())) return "";

	// If more than 24 hours, return empty string
	if (!isLessThan24Hours(dateUtc, now)) return "";

	const diffInMs = now.getTime() - date.getTime();
	const diffInMinutes = Math.floor(diffInMs / 60000);

	// If less than 1 minute, return "только что"
	if (diffInMinutes < 1) return t("just now");

	// If 1-59 minutes, return "43 мин. назад"
	if (diffInMinutes < 60) {
		return `${diffInMinutes} ${t("min. ago")}`;
	}

	// If 60+ minutes, return "1ч35мин" (without zeros)
	const hours = Math.floor(diffInMinutes / 60);
	const minutes = diffInMinutes % 60;

	if (minutes === 0) {
		return `${hours}${t("h")}`;
	}
	return `${hours}${t("h")}${minutes}${t("staticStrings.min")}`;
};