<script setup lang="ts">
	import { useRoute } from "vue-router";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { computed, onMounted, onUnmounted } from "vue";
	import { storeToRefs } from "pinia";
	import { useMonitorsStore } from "@dv-admin/stores/monitors";
	import type { IMonitorsResponse } from "@dv-admin/utils/types/api/apiGo";
	import type { UiTagMode } from "@dv.net/ui-kit/dist/components/UiTag/types";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import LogsNotFound from "@dv-admin/views/settings/logs/show/components/logsNotFound/LogsNotFound.vue";
	import IconCalendar from "@dv-admin/components/icons/IconCalendar.vue";
	import ShowStatus from "@dv-admin/components/ui/showStatus/ShowStatus.vue";

	const route = useRoute();
	const { monitorsTypes, monitorsCurrentTypeList } = storeToRefs(useMonitorsStore());
	const { getMonitors, getMonitorsSlug, resetMonitorsSlug } = useMonitorsStore();

	const slug = route.params.slug as string;

	const currentTypeMonitor = computed<IMonitorsResponse | undefined>(() => {
		return monitorsTypes.value.find((item) => item.slug === slug);
	});

	const getCurrentStatus = (status: string): { mode: UiTagMode; message: string } => {
		switch (status) {
			case "completed":
				return { mode: "positive", message: "Completed" };
			case "in_progress":
				return { mode: "warning", message: "In progress" };
			case "failed":
				return { mode: "negative", message: "Error" };
			default:
				return { mode: "neutral", message: "Unknown" };
		}
	};

	onMounted(async () => {
		await Promise.all([!monitorsTypes.value.length ? getMonitors() : Promise.resolve(), getMonitorsSlug(slug)]);
	});
	onUnmounted(() => {
		resetMonitorsSlug();
	});
</script>

<template>
	<div v-if="currentTypeMonitor" class="page">
		<breadcrumbs :back-route-title="$t('Logs')" back-name-route="settings-logs" />
		<h1 class="global-title-h2 mt-24 mb-40">
			{{ currentTypeMonitor.slug }}
		</h1>

		<block-section v-if="monitorsCurrentTypeList.length" class="flex flex-column gap-16" mode="grey-border">
			<div class="row">
				<span class="row__label">{{ $t("Date") }}</span>
				<span class="row__label">{{ $t("Status") }}</span>
			</div>

			<div v-for="(item, index) in monitorsCurrentTypeList" :key="index" class="flex flex-column gap-12">
				<div class="row header">
					<div class="row__date">
						<icon-calendar />
						<span>{{ formatDate(item.created_at) }}</span>
					</div>

					<show-status
						:mode="item.failure ? 'negative' : 'positive'"
						:text="$t(item.failure ? 'Completed with error' : 'Completed')"
					/>
				</div>

				<div class="table">
					<div class="table__row row" v-for="(value, index) in item.messages" :key="index">
						<div class="pl-16">{{ formatDate(value.created_at) }}</div>
						<div>{{ value.message }}</div>
						<div class="flex flex-y-center flex-x-end pr-16">
							<show-status
								:mode="getCurrentStatus(value.status).mode"
								:text="$t(getCurrentStatus(value.status).message)"
							/>
						</div>
					</div>
				</div>
			</div>
		</block-section>
		<logs-not-found />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;

		.row {
			display: grid;
			grid-template-columns: 200px 1fr auto;

			&.header {
				border-radius: 8px;
				background-color: #ecf0f5;
				padding: 8px 0;
			}

			&__label {
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}

			&__date {
				display: flex;
				align-items: center;
				gap: 8px;
				color: $black;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
				padding-left: 16px;
			}
		}

		.table {
			display: flex;
			flex-direction: column;
			border: 1px solid $grey;
			background-color: $white;
			border-radius: 16px;
			overflow: hidden;

			&__row {
				color: $black;
				font-size: 14px;
				font-weight: 400;
				line-height: 20px;
				border-bottom: 1px solid $grey;
				padding: 12px 0;

				&:nth-child(even) {
					background-color: $blue-opacity;
				}

				&:last-child {
					border-bottom: unset;
				}
			}
		}
	}
</style>
