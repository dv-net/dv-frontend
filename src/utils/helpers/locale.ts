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

export const getLocaleLS = (): string | null => {
	return localStorage.getItem("locale");
};

export const setLocaleLS = (locale: string) => {
	if (!locale) return;
	localStorage.setItem("locale", locale);
};
