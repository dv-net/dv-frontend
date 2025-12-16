import { config } from "@dv.net/ui-kit";
import { nextTick } from "vue";
import i18n from "@dv-admin/utils/plugins/i18n";

export async function loadLocaleMessages(locale: string) {
	try {
		const messages = await import(`@dv-admin/utils/plugins/i18n/locales/${locale}.json`);
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
	config.uiLanguages.translations.changeLanguage = t("Change language");
	config.uiTable.translations.noData = t("Not found");
	config.uiDatePicker.translations.emptyPlaceholder = t("Select date");
	config.uiDatePicker.translations.applyButton = t("Apply", { context: "apply to" });
	config.uiDatePicker.translations.inputLabelEnd = t("End");
	config.uiDatePicker.translations.inputLabelStart = t("Start");
	config.uiDatePicker.translations.invalidDate = t("Invalid date");
	config.uiDatePicker.translations.presetAllTime = t("All time");
	config.uiDatePicker.translations.presetMonth = t("Month");
	config.uiDatePicker.translations.presetQuarter = t("Quarter", { context: "calendar quarter" });
	config.uiDatePicker.translations.presetToday = t("Today");
	config.uiDatePicker.translations.presetWeek = t("Week");
	config.uiDatePicker.translations.presetYear = t("Year");
	config.uiDatePicker.translations.clearButton = t("Clear");
	config.uiDatePicker.translations.yesterdayPlaceholder = t("Yesterday");
	config.uiNotification.translations.error = t("Error");
	config.uiNotification.translations.success = t("Success");
	config.uiConfirm.translations.confirmBtn = t("Confirm");
	config.uiConfirm.translations.cancelBtn = t("Cancel.verb");
	config.uiPagination.translations.from = t("from");
	config.uiPagination.translations.show = t("show");
};
