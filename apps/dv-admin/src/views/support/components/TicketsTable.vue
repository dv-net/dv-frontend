<script setup lang="ts">
	import { UiTable, UiButton } from "@dv.net/ui-kit";
	import { computed } from "vue";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";

	const { t } = useI18n();

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created", label: t("Created") },
		{ name: "theme", label: t("Ticket theme") },
		{ name: "status", label: t("Status") }
	]);
</script>

<template>
	<div>
		<div class="w-full flex flex-x-between center mb-20">
			<h2 class="global-title-h2">{{ $t("Tickets") }}</h2>
			<ui-button type="tertiary" disabled>{{ $t("List of all tickets") }}</ui-button>
		</div>

		<ui-table :headers="headers" :data="[]"></ui-table>
	</div>
</template>

<style scoped lang="scss"></style>
