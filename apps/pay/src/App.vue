<script setup lang="ts">
	import { type Component, computed, onMounted, watch } from "vue";
	import PaymentLayout from "@pay/layouts/PaymentLayout.vue";
	import EmptyLayout from "@pay/layouts/EmptyLayout.vue";
	import { useRoute } from "vue-router";
	import { loadLocaleMessages, updateTranslationsUiKit } from "@pay/utils/plugins/i18n/helpers";
	import { useI18n } from "vue-i18n";
	import type { LayoutNames } from "@pay/layouts";

	const { t, locale } = useI18n();
	const route = useRoute();

	const layouts: Record<LayoutNames, Component> = {
		"payment-layout": PaymentLayout,
		"empty-layout": EmptyLayout
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

	onMounted(async () => {
		outputFrontendVersion();
		await loadLocaleMessages(locale.value);
	});
</script>

<template>
	<component :is="resolveLayout">
		<RouterView />
	</component>
</template>
