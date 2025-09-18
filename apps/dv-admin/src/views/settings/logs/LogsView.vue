<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { UiTabs, UiTabsItem } from "@dv.net/ui-kit";
	import { getApiLogsLast, getApiLogsLastProcessing } from "@dv-admin/services/api/monitors.ts";
	import type { ILogsResponse } from "@dv-admin/utils/types/api/apiGo.ts";

	const isLoading = ref<boolean>(false);
	const currentTab = ref<string>("1");
	const logsLast = ref<ILogsResponse[]>([]);
	const logsLastProcessing = ref<ILogsResponse[]>([]);
	const optionsTab = ref<{ value: string; label: string }[]>([
		{ value: "1", label: "Backend" },
		{ value: "2", label: "Processing" }
	]);

	const getLogsLast = async () => {
		try {
			const data = await getApiLogsLast();
			if (data) logsLast.value = data;
		} catch (error: any) {
			throw error;
		}
	};

	const getLogsLastProcessing = async () => {
		try {
			const data = await getApiLogsLastProcessing();
			if (data) logsLastProcessing.value = data;
		} catch (error: any) {
			throw error;
		}
	};

	const getAllLogs = async () => {
		try {
			isLoading.value = true
			await Promise.all([getLogsLast(), getLogsLastProcessing()])
		} catch (error: any) {
			console.error(error)
		} finally {
			isLoading.value = false
		}
	};

	// TODO: Do not delete
	// const headers = computed<UiTableHeader[]>(() => [
	// 	{ name: "slug", label: t("Script name") },
	// 	{ name: "title", label: t("Status") },
	// 	{ name: "created_at", label: t("Date of creation"), date: true },
	// 	{ name: "direct_icon", width: "44" }
	// ]);
	// TODO: Do not delete
	// const handleGoToMonitor = async (row: IMonitorsResponse) => {
	// 	await router.push({ name: "settings-logs-show", params: { slug: row.slug } });
	// };

	onMounted(async () => {
		// TODO: Do not delete
		// await getMonitors();
		await getAllLogs()
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Settings')" back-name-route="settings" />
		<div class="page__top">
			<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Logs") }}</h1>
			<ui-tabs mode="light" v-model="currentTab">
				<ui-tabs-item v-for="item in optionsTab" :value="item.value" :key="item.value">
					{{ $t(item.label) }}
				</ui-tabs-item>
			</ui-tabs>
		</div>


		<div v-if="currentTab === '1'">

		</div>
		<div v-else>

		</div>





		<!--  TODO: Do not delete 	-->
		<!--		<ui-table-->
		<!--			:headers="headers"-->
		<!--			:loading="isLoading"-->
		<!--			:data="monitorsTypes"-->
		<!--			@cell-click="handleGoToMonitor"-->
		<!--			@rowClick="handleGoToMonitor"-->
		<!--			:row-class="() => 'pointer'"-->
		<!--			table-layout="fixed"-->
		<!--		>-->
		<!--			<template #body-cell-created_at="{ row }">-->
		<!--				{{ formatDate(row.created_at) }}-->
		<!--			</template>-->
		<!--			<template #body-cell-direct_icon>-->
		<!--				<ui-icon name="chevron-right" type="filled" />-->
		<!--			</template>-->
		<!--		</ui-table>-->
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		&__top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			&:deep(.ui-tabs) {
				min-width: 500px;
			}
		}
	}
</style>
