// Get the correct declension of the word "task"
export const getReplenishmentDeclension = (number: number): string => {
	const lastDigit = number % 10;
	const lastTwoDigits = number % 100;

	if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
		return "replenishment.genitive";
	} else if (lastDigit === 1) {
		return "replenishment.single";
	} else if (lastDigit >= 2 && lastDigit <= 4) {
		return "replenishment.plural";
	} else {
		return "replenishment.genitive";
	}
};

export const getDate = (dateStr: string, type: string, locale: string): { text: string; isTranslate: boolean } => {
	const inputDate = new Date(dateStr);
	const currentDate = new Date();
	inputDate.setUTCHours(12, 0, 0, 0);
	currentDate.setHours(12, 0, 0, 0);

	if (type === "month") {
		return { text: "Income for 30 days", isTranslate: true };
	}
	if (type === "week") {
		return { text: "Income for the current week", isTranslate: true };
	}
	const oneDay = 24 * 60 * 60 * 1000;
	const diffDays = Math.round((currentDate.getTime() - inputDate.getTime()) / oneDay);
	if (diffDays === 0) {
		return { text: "Today", isTranslate: true };
	} else if (diffDays === 1) {
		return { text: "Yesterday", isTranslate: true };
	} else {
		const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
		return { text: inputDate.toLocaleDateString(locale, options), isTranslate: false };
	}
};

export const getColorBorderRow = (count: string): "orange" | "red" | "green" => {
	const countValue: number = parseFloat(count);
	if (isNaN(countValue) || !isFinite(countValue)) return "orange";
	if (countValue < 5) return "red";
	if (countValue < 50) return "orange";
	return "green";
};

export const getDepositPercentages = (
	details: { currency: string; tx_count: number; sum_usd: string }[],
	total: number
) => {
	if (!total) return details.map((item) => ({ ...item, percentage: 0 }));
	const raw = details.map((item) => ({ ...item, raw: (item.tx_count / total) * 100 }));
	const initial = raw.map((item) => {
		const floored = Math.floor(item.raw);
		const guaranteed = item.tx_count > 0 && floored === 0 ? 1 : floored;
		return { ...item, percentage: guaranteed, remainder: item.raw - floored };
	});
	const sum = initial.reduce((acc, item) => acc + item.percentage, 0);
	let difference = 100 - sum;
	if (difference < 0) {
		const sorted = [...initial].filter((item) => item.percentage > 1).sort((a, b) => a.remainder - b.remainder);
		for (let i = 0; i < sorted.length && difference < 0; i++) {
			sorted[i].percentage -= 1;
			difference++;
		}
	} else if (difference > 0) {
		const sorted = [...initial].sort((a, b) => b.remainder - a.remainder);
		for (let i = 0; i < sorted.length && difference > 0; i++) {
			sorted[i].percentage += 1;
			difference--;
		}
	}
	// Create a dictionary for quick access
	const percentageByCurrency = new Map(initial.map((i) => [i.currency, i.percentage]));
	// Return array with percentages, sorted by decreasing percentage
	return details
		.map((item) => ({ ...item, percentage: percentageByCurrency.get(item.currency) ?? 0 }))
		.sort((a, b) => b.percentage - a.percentage);
};
