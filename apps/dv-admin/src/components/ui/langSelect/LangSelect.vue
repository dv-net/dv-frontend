<script setup lang="ts">
	import { UiLanguages } from "@dv.net/ui-kit/dist";
	import { locales } from "@shared/utils/constants/locale";
	import { computed } from "vue";
	import { useI18n } from "vue-i18n";
	import { setLocaleLS } from "@shared/utils/helpers/locale";
	import { loadLocaleMessages, updateTranslationsUiKit } from "@dv-admin/utils/plugins/i18n/helpers";
	import type { Locale } from "@dv.net/ui-kit/dist/components/UiLanguages/types";
	import type { IProps } from "@dv-admin/components/ui/langSelect/types";
	import { storeToRefs } from "pinia";
	import { useLayoutStore } from "@dv-admin/stores/layout";
	import { useAuthStore } from "@dv-admin/stores/auth";

	const { t, locale } = useI18n();
	const { user } = storeToRefs(useAuthStore());
	const { putUser } = useAuthStore();
	const { isShowModalLanguage } = storeToRefs(useLayoutStore());

	const { forHeader = false, isHidden = false } = defineProps<IProps>();

	const currentLocale = computed<Locale>({
		get: () => locales.find((el) => el.isoCode === locale.value) ?? locales[0],
		set: (value: Locale) => {
			setLocaleLS(value.isoCode);
			locale.value = value.isoCode;
		}
	});

	const selectLocale = async (locale: Locale) => {
		try {
			currentLocale.value = locale;
			await loadLocaleMessages(locale.isoCode);
			updateTranslationsUiKit(locale.isoCode, t);
			if (user.value) {
				user.value.language = locale.isoCode;
				await putUser(t("The language of the website has been changed"));
			}
		} catch (error: any) {
			console.error(`Failed to load messages for ${locale.isoCode}`, error);
		}
	};
</script>

<template>
	<ui-languages
		:forHeader="forHeader"
		v-model="currentLocale"
		:locales="locales"
		@change="selectLocale"
		:is-hidden="isHidden"
		v-model:is-show="isShowModalLanguage"
		:minNumbersLocalesDisplayFavorites="10"
	/>
</template>
