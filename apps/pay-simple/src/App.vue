<script setup lang="ts">
	import { type Component, computed, defineAsyncComponent, onMounted, watch } from "vue";
	import { useRoute } from "vue-router";
	import { updateTranslationsUiKit } from "./utils/libs/i18n/helpers";
	import { useI18n } from "vue-i18n";
	import type { LayoutNames } from "@pay-shared/layouts";
	import LangSelect from "@pay-simple/components/ui/langSelect/LangSelect.vue";

	const { t, locale } = useI18n();
	const route = useRoute();

	const layouts: Record<LayoutNames, Component> = {
		"payment-layout": defineAsyncComponent(() => import("@pay-shared/layouts/PaymentLayout.vue")),
		"empty-layout": defineAsyncComponent(() => import("@pay-shared/layouts/EmptyLayout.vue"))
	};

	const resolveLayout = computed(() => {
		return layouts[route.meta.layout as keyof typeof layouts];
	});

	const outputFrontendVersion = () => {
		const frontendVersion = import.meta.env.VITE_APP_VERSION || "unknown";
		console.log(
			`%cFrontend: %c${frontendVersion}`,
			"color: #1f9649; font-size: 14px; font-weight: bold;",
			"color: #6b6d80; font-size: 12px; font-family: monospace; background: #f0f1f9; padding: 2px 8px; border-radius: 4px;"
		);
	};

	watch(locale, (value: string) => updateTranslationsUiKit(value, t), { immediate: true, deep: true });

	onMounted(() => {
		outputFrontendVersion();
	});
</script>

<template>
	<component :is="resolveLayout">
		<template #lang-select>
			<lang-select for-header />
		</template>
		<RouterView />
	</component>
</template>
