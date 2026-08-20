import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DATE_FORMATS } from "@dv-admin/utils/constants/settings";
import { useAuthStore } from "@dv-admin/stores/auth";
import { getTimeUnits, getTimeZoneUser } from "@shared/utils/helpers/locale";
import { USER } from "@dv-admin/utils/constants/user";

dayjs.extend(utc);
dayjs.extend(timezone);

import type { IFormatDateOptions } from "@dv-admin/utils/types/general";

export const formatDate = (date: unknown, options: IFormatDateOptions = {}): string => {
	const { dateOnly = false, format, timeZone, errorValue = "—" } = options;

	try {
		if (!date || typeof date !== "string") return errorValue;

		const storedFormat = format || getFormatDateFromStorage();
		const resultDateFormat = dateOnly ? storedFormat.split(",")[0].trim() : storedFormat;
		const resultTimeZone = timeZone ?? getTimeZoneUser() ?? "Europe/Moscow";

		return dayjs.utc(date).tz(resultTimeZone).format(resultDateFormat);
	} catch (error: any) {
		console.error(error);
		return errorValue;
	}
};

// Page transfers (5 min. 33 sec.)
export const timeDifference = (date1: any, date2: any, locale: string): string => {
	if (!date1 || !date2 || typeof date1 !== "string" || typeof date2 !== "string") return "—";

	const { h: hoursWord, min: minutesWord, s: secondsWord } = getTimeUnits(locale);
	const diffInMs = Math.abs(new Date(date1).getTime() - new Date(date2).getTime());
	const totalSeconds = Math.floor(diffInMs / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	if (hours > 0) {
		return minutes > 0 ? `${hours}${hoursWord} ${minutes}${minutesWord}` : `${hours}${hoursWord}`;
	} else if (minutes > 0) {
		return seconds > 0
			? `${minutes}${minutesWord} ${seconds < 10 ? "0" : ""}${seconds}${secondsWord}`
			: `${minutes}${minutesWord}`;
	} else {
		return `${seconds}${secondsWord}`;
	}
};

// Returns the beginning and end of the day in ISO format with timezone
export const getDayRangeIso = (date: any, timeZone?: string): { from: string; to: string } | null => {
	if (!date || typeof date !== "string") return null;
	try {
		const userTimeZone = useAuthStore().user?.location;
		const browserTimeZone = getTimeZoneUser();
		const zone = timeZone || userTimeZone || browserTimeZone || "Europe/Moscow";
		const from = dayjs.tz(`${date}T00:00:00`, zone).format();
		const to = dayjs.tz(`${date}T23:59:59`, zone).format();
		return { from, to };
	} catch (error) {
		console.error("getDayRangeIso error", error);
		return null;
	}
};

// Get the last month in UTC 0 by default or you can pass a specific number of days
export const getLastDaysRange = (
	days?: number
): {
	dateFrom: string;
	dateTo: string;
	dateFromWithTime: string;
	dateToWithTime: string;
} => {
	const formatDate = (date: Date) => date.toISOString().split("T")[0];
	const toDate = new Date();
	toDate.setUTCHours(0, 0, 0, 0);
	const fromDate = new Date(toDate);
	if (typeof days === "number") {
		fromDate.setUTCDate(fromDate.getUTCDate() - days + 1);
	} else {
		fromDate.setUTCMonth(fromDate.getUTCMonth() - 1);
		fromDate.setUTCDate(fromDate.getUTCDate() + 1);
	}

	return {
		dateFrom: formatDate(fromDate),
		dateTo: formatDate(toDate),
		dateFromWithTime: getDayRangeIso(formatDate(fromDate))?.from || formatDate(fromDate),
		dateToWithTime: getDayRangeIso(formatDate(toDate))?.to || formatDate(fromDate)
	};
};

// Get date format from LS and check if I have such format
export const getFormatDateFromStorage = (): string => {
	const formatFromStorage: string | null = localStorage.getItem(USER.DATE_FORMAT);
	return formatFromStorage && Object.values(DATE_FORMATS).includes(formatFromStorage as DATE_FORMATS)
		? formatFromStorage
		: DATE_FORMATS.RU_DATETIME;
};