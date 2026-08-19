import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getTimezones = () => {
	const timezones = (Intl as any).supportedValuesOf("timeZone") as string[];
	return timezones.map((zone) => {
		const offset = dayjs().tz(zone).format("Z");
		return {
			label: `${zone} (${offset})`,
			value: zone
		};
	});
};
