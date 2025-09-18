<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { UiInput, UiSelect, UiSkeleton, UiTabs, UiTabsItem } from "@dv.net/ui-kit";
	import { getApiLogsLast, getApiLogsLastProcessing } from "@dv-admin/services/api/monitors.ts";
	import type { ILogsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import ShowStatus from "@dv-admin/components/ui/showStatus/ShowStatus.vue";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import NotFoundMessage from "@dv-admin/components/ui/notFoundMessage/NotFoundMessage.vue";
	import { LEVEL_LOGS, OPTIONS_LEVEL_LOGS } from "@dv-admin/utils/constants/settings";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";

	const isLoading = ref<boolean>(false);
	const currentTab = ref<'backend' | 'processing'>("backend");
	const logsLast = ref<ILogsResponse[]>([]);
	const logsLastProcessing = ref<ILogsResponse[]>([]);
	const selectedLevels = ref<string | null>(null);
	const searchQuery = ref<string | null>(null);
	const optionsTab = ref<{ value: 'backend' | 'processing'; label: string }[]>([
		{ value: "backend", label: "Backend" },
		{ value: "processing", label: "Processing" }
	]);

	const isBackend = computed<boolean>(() => currentTab.value === 'backend')
	const filteredLogs = computed<ILogsResponse[]>(() => {
		const source = isBackend.value ? logsLast.value : logsLastProcessing.value
		if (!selectedLevels.value && !searchQuery.value) return source;
		return source.filter((log) => {
			const matchLevel = !selectedLevels.value || log.level === selectedLevels.value;
			const matchSearch = !searchQuery.value || log.message.toLowerCase().includes(searchQuery.value.toLowerCase());
			return matchLevel && matchSearch;
		})
	})

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
			isLoading.value = true;
			await Promise.all([getLogsLast(), getLogsLastProcessing()]);
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
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
		await getAllLogs();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Settings')" back-name-route="settings" />
		<div class="page__top">
			<h1 class="global-title-h2">{{ $t("Logs") }}</h1>
			<ui-tabs mode="light" v-model="currentTab">
				<ui-tabs-item v-for="item in optionsTab" :value="item.value" :key="item.value">
					{{ $t(item.label) }}
				</ui-tabs-item>
			</ui-tabs>
		</div>
		<div class="filters">
			<ui-input
				v-model="searchQuery"
				is-empty-value-null
				clearable
				size="md"
				:placeholder="$t('Search by logs')"
				@clear="searchQuery = null"
			/>
			<ui-select
				v-model="selectedLevels"
				:options="OPTIONS_LEVEL_LOGS"
				clearable
				:placeholder="$t('Logging levels')"
				size="md"
				@clear="selectedLevels = null"
			/>
		</div>
		<block-section mode="grey-border" padding="lg">
			<div class="header">
				<span class="header__item">{{ $t('Date') }}</span>
				<span class="header__item">{{ $t('Message') }}</span>
				<span class="header__item">{{ $t('Level') }}</span>
			</div>
			<div v-if="isLoading" class="logs">
				<ui-skeleton
					:rows="12"
					:row-height="48"
					first-color="var(--color-background-tertiary)"
					second-color="var(--color-background-secondary)"
				/>
			</div>
			<div v-else>
				<div v-if="filteredLogs.length" class="logs">
					<div class="logs__row" v-for="(item, index) in filteredLogs" :key="index">
						<div class="logs__time">{{ formatDate(item.time) }}</div>
						<div class="logs__message">{{ item.message }}</div>
						<show-status
							:mode="item.level in LEVEL_LOGS ? LEVEL_LOGS[item.level] : 'neutral'"
							:text="item.level"
							w-full
						/>
					</div>
				</div>
				<not-found-message v-else />
			</div>
		</block-section>
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
			margin-top: 24px;
			&:deep(.ui-tabs) {
				min-width: 500px;
			}
		}
		.filters {
			margin: 24px 0;
			border-radius: 16px;
			border: 1px solid $grey;
			padding: 20px 16px;
			display: grid;
			grid-template-columns: 1fr 300px;
			gap: 24px;
		}
		.header {
			display: grid;
			gap: 20px;
			padding: 0 16px 12px;
			grid-template-columns: 140px 1fr 100px;
			&__item {
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
			}
		}
		.logs {
			height: 50vh;
			@supports (height: 50dvh) {
				height: 50dvh;
			}
			min-height: 500px;
			overflow: hidden;
			overflow-y: auto;
			display: flex;
			flex-direction: column;
			border: 1px solid $grey;
			border-radius: 16px;
			background: $white;
			-ms-overflow-style: none;
			scrollbar-width: none;
			&::-webkit-scrollbar {
				display: none;
			}
			&__row {
				display: grid;
				grid-template-columns: 140px 1fr 100px;
				align-items: center;
				gap: 20px;
				padding: 12px 16px;
				background: $white;
				&:nth-child(even) {
					background-color: rgb(247, 249, 251);
				}
			}
			&__time {
				color: $black;
				font-size: 14px;
				font-weight: 300;
			}
			&__message {
				max-height: 128px;
				font-weight: 400;
				overflow-y: auto;
				font-size: 14px;
				word-break: break-word;
			}
		}
	}
</style>
