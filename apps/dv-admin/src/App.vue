<script setup lang="ts">
	import { useRoute } from "vue-router";
	import type { LayoutNames } from "@dv-admin/layouts";
	import { type Component, computed, defineAsyncComponent, onMounted, watch } from "vue";
	import MainLogoLoader from "@dv-admin/components/ui/mainLogoLoader/MainLogoLoader.vue";
	import { useI18n } from "vue-i18n";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { storeToRefs } from "pinia";
	import { updateTranslationsUiKit } from "./utils/libs/i18n/helpers";

	const route = useRoute();
	const { isShowMainLoader } = storeToRefs(useAuthStore());
	const { t, locale } = useI18n();

	const layouts: Record<LayoutNames, Component> = {
		"auth-layout": defineAsyncComponent(() => import("@dv-admin/layouts/AuthLayout.vue")),
		"default-layout": defineAsyncComponent(() => import("@dv-admin/layouts/DefaultLayout.vue")),
		"installer-layout": defineAsyncComponent(() => import("@dv-admin/layouts/InstallerLayout.vue")),
		"empty-layout": defineAsyncComponent(() => import("@dv-admin/layouts/EmptyLayout.vue"))
	};

	const resolveLayout = computed(() => {
		return layouts[route.meta.layout as keyof typeof layouts];
	});

	watch(locale, (value: string) => updateTranslationsUiKit(value, t), { immediate: true, deep: true });

	onMounted(() => {
		const loaderContainer = document.getElementById("loader");
		const body = document.body;
		const app = document.getElementById("app");
		if (loaderContainer) loaderContainer.style.display = "none";
		if (body) body.style.removeProperty("overflow");
		if (app) app.style.removeProperty("overflow");
	});
</script>

<template>
	<main-logo-loader v-if="isShowMainLoader" />
	<component v-show="!isShowMainLoader" :is="resolveLayout">
		<RouterView />
	</component>
</template>
