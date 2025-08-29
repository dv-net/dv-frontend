import { createI18n } from "vue-i18n";
import { getLocaleLS, getLocaleUser } from "@shared/utils/helpers/locale";
import { localesI18nArray } from "@shared/utils/constants/locale";

const getLocale = (): string => {
	const locale: string | null = getLocaleLS();
	const localeBrowser: string | null = getLocaleUser();
	if (locale && localesI18nArray.includes(locale)) {
		return locale;
	} else if (localeBrowser && localesI18nArray.includes(localeBrowser)) {
		return localeBrowser;
	} else {
		return "en";
	}
};

const i18n = createI18n({
	locale: getLocale(),
	fallbackLocale: "en",
	globalInjection: true,
	legacy: false,
	messages: {}
});

export default i18n;
