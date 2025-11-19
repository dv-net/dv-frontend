// Check if less than 1 hour passed between two dates (both dates should be in UTC 0)
// Returns true if less than 1 hour, false if 1 hour or more
export const isLessThan1Hour = (date1: string | Date, date2: string | Date): boolean => {
	if (!date1 || !date2) return false;
	const date1Obj = typeof date1 === "string" ? new Date(date1) : date1;
	const date2Obj = typeof date2 === "string" ? new Date(date2) : date2;
	if (isNaN(date1Obj.getTime()) || isNaN(date2Obj.getTime())) return false;
	const diffInMs = Math.abs(date2Obj.getTime() - date1Obj.getTime());
	const diffInHours = diffInMs / 3600000;
	return diffInHours < 1;
};

// Format time ago from UTC date
// Returns empty string if more than 1 hour
export const formatTimeAgo = (
	dateUtc: string,
	t: (key: string) => string
): string => {
	if (!dateUtc || typeof dateUtc !== "string") return "";
	const now = new Date();
	const date = new Date(dateUtc);
	if (isNaN(date.getTime())) return "";
	if (!isLessThan1Hour(dateUtc, now)) return "";
	const diffInMs = now.getTime() - date.getTime();
	const diffInMinutes = Math.floor(diffInMs / 60000);
	if (diffInMinutes < 1) return t("just now");
	return `${diffInMinutes} ${t("staticStrings.min")} ${t('ago')}`;
};