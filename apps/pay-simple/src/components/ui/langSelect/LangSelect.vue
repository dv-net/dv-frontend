<script setup lang="ts">
	import { UiLanguages } from "@dv.net/ui-kit/dist";
	import { locales } from "@shared/utils/constants/locale";
	import { computed, ref } from "vue";
	import { useI18n } from "vue-i18n";
	import { setLocaleLS } from "@shared/utils/helpers/locale";
	import { loadLocaleMessages, updateTranslationsUiKit } from "../../../utils/libs/i18n/helpers";
	import type { Locale } from "@dv.net/ui-kit/dist/components/UiLanguages/types";
	import type { IProps } from "@pay-simple/components/ui/langSelect/types";
	import { usePayerFormStore } from "@pay-simple/stores/payerForm";
	import { useRoute } from "vue-router";

	const { locale } = useI18n();
	const { t } = useI18n();
	const { getStartInfo } = usePayerFormStore();
	const route = useRoute();

	const { forHeader = false, isHidden = false } = defineProps<IProps>();

	const isShowModalLanguage = ref<boolean>(false);
	const invoiceUuid = route.params.uuid as string | undefined;

	const currentLocale = computed<Locale>({
		get: () => {
			const findIndex = locales.findIndex((el) => el.isoCode === locale.value);
			if (findIndex !== -1) return locales[findIndex];
			return locales[0];
		},
		set: (value: Locale) => {
			setLocaleLS(value.isoCode, true);
			locale.value = value.isoCode;
		}
	});

	const selectLocale = async (nextLocale: Locale) => {
		try {
			currentLocale.value = nextLocale;
			await loadLocaleMessages(nextLocale.isoCode);
			updateTranslationsUiKit(nextLocale.isoCode, t);
			await getStartInfo(invoiceUuid);
		} catch (error: any) {
			console.error(`Failed to load messages for ${nextLocale.isoCode}`, error);
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
