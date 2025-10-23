export const getLocaleUser = (): string | null => {
	const language: string = navigator.language;
	if (language) {
		const parseStr = language.split("-");
		return parseStr[0] || null;
	} else {
		return null;
	}
};

export const getTimeZoneUser = (): string | null => {
	return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
};

export const getLocaleLS = (isPaymentForm?: boolean): string | null => {
	return localStorage.getItem(isPaymentForm ? "locale_pf" : "locale");
};

export const setLocaleLS = (locale: string, isPaymentForm?: boolean) => {
	if (!locale) return;
	localStorage.setItem(isPaymentForm ? "locale_pf" : "locale", locale);
};
