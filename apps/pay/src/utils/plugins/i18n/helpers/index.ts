import { config } from "@dv.net/ui-kit";
import { nextTick } from "vue";
import i18n from "@pay/utils/plugins/i18n";

export async function loadLocaleMessages(locale: string) {
	try {
		const messages = await import(`@pay/utils/plugins/i18n/locales/${locale}.json`);
		i18n.global.setLocaleMessage(locale, messages.default);
		const elementHtml = document.querySelector("html");
		if (elementHtml) elementHtml.setAttribute("lang", locale);
		return nextTick();
	} catch (error: any) {
		console.error(`Failed to load messages for ${locale}`, error);
	}
}

export const updateTranslationsUiKit = (value: string, t: any) => {
	config.locale = value;
	config.uiSelect.translations.notFound = t("Not found");
	config.uiSelect.translations.searchInputPlaceholder = t("Search");
	config.uiSelect.translations.multipleSelectedText = t("Selected");
	config.uiLanguages.translations.modalSearchNotFound = t("Not found");
	config.uiLanguages.translations.searchInputPlaceholder = t("Search");
	config.uiTable.translations.noData = t("Not found");
	config.uiNotification.translations.error = t("Error");
	config.uiNotification.translations.success = t("Success");
	config.uiLanguages.translations.changeLanguage = t("Change language");
	config.uiPagination.translations.from = t("from");
};
