<script setup lang="ts">
	import { useRouter } from "vue-router";
	import { computed, onMounted } from "vue";
	import { useMonitorsStore } from "@dv-admin/stores/monitors";
	import { storeToRefs } from "pinia";
	import type { IMonitorsResponse } from "@dv-admin/utils/types/api/apiGo";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { UiIcon, UiTable } from "@dv.net/ui-kit";
	import { useI18n } from "vue-i18n";

	const { t } = useI18n();
	const router = useRouter();
	const { monitorsTypes, isLoading } = storeToRefs(useMonitorsStore());
	const { getMonitors } = useMonitorsStore();

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "slug", label: t("Script name") },
		{ name: "title", label: t("Status") },
		{ name: "created_at", label: t("Date of creation"), date: true },
		{ name: "direct_icon", width: "44" }
	]);

	const handleGoToMonitor = async (row: IMonitorsResponse) => {
		await router.push({ name: "settings-logs-show", params: { slug: row.slug } });
	};

	onMounted(async () => {
		await getMonitors();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Settings')" back-name-route="settings" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Logs") }}</h1>

		<ui-table
			:headers="headers"
			:loading="isLoading"
			:data="monitorsTypes"
			@cell-click="handleGoToMonitor"
			@rowClick="handleGoToMonitor"
			:row-class="() => 'pointer'"
			table-layout="fixed"
		>
			<template #body-cell-created_at="{ row }">
				{{ formatDate(row.created_at) }}
			</template>
			<template #body-cell-direct_icon>
				<ui-icon name="chevron-right" type="filled" />
			</template>
		</ui-table>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
	}
</style>
