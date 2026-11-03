import dayjs from "dayjs";
import { getTimeUnits } from "@shared/utils/helpers/locale";

const HOUR_MS = 60 * 60 * 1000;

// Check if less than 1 hour passed between two dates (both dates should be in UTC 0)
// Returns true if less than 1 hour, false if 1 hour or more
export const isLessThan1Hour = (date1: string | Date, date2: string | Date): boolean => {
	if (!date1 || !date2) return false;
	const first = dayjs(date1);
	const second = dayjs(date2);
	if (!first.isValid() || !second.isValid()) return false;
	return Math.abs(second.diff(first)) < HOUR_MS;
};

// Check that a UTC date is not older than `periodMs` relative to now; invalid dates return false
export const isWithinPeriod = (date: string | Date, periodMs: number): boolean => {
	if (!date) return false;
	const parsed = dayjs(date);
	return parsed.isValid() && dayjs().diff(parsed) <= periodMs;
};

// Format time ago from UTC date
// Returns empty string if more than 1 hour
export const formatTimeAgo = (dateUtc: string, t: (key: string) => string, locale: string): string => {
	if (!dateUtc || typeof dateUtc !== "string") return "";
	const now = dayjs();
	const date = dayjs(dateUtc);
	if (!date.isValid()) return "";
	if (!isLessThan1Hour(dateUtc, now.toDate())) return "";
	const diffInMinutes = now.diff(date, "minute");
	if (diffInMinutes < 1) return t("just now");
	const { min } = getTimeUnits(locale);
	return `${diffInMinutes} ${min} ${t("ago")}`;
};
