<script setup lang="ts">
	import { storeToRefs } from "pinia";
	import { UiButton, UiSkeleton, UiTable, UiTooltip } from "@dv.net/ui-kit";
	import { computed, onMounted, ref } from "vue";
	import { useRouter } from "vue-router";
	import { useAmlStore } from "@dv-admin/stores/aml";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import { RISK_LEVEL_ENUM } from "@dv-admin/utils/constants/aml";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse.ts";
	import ShowStatusGeneral from "@dv-admin/components/ui/showStatusGeneral/ShowStatusGeneral.vue";
	import type { IAmlHistoryItemResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import { downloadAmlServiceResponsePdf } from "@dv-admin/utils/helpers/downloadAmlServiceResponsePdf.ts";
	import AmlHistoryStats from "@dv-admin/views/aml/components/amlHistoryStats/AmlHistoryStats.vue";

	const { t } = useI18n();
	const router = useRouter();

	const {
		isLoadingAmlHistory,
		amlHistoryPagination,
		amlHistory,
		amlHistoryFilter,
		amlSettings,
		formAmlScoreTransaction,
		connectedProviderSlugs
	} = storeToRefs(useAmlStore());
	const { getAmlHistory, getAmlSettings, getAllAmlKeys } = useAmlStore();
	const { dictionary } = storeToRefs(useGeneralStore());

	const isInitializing = ref(true);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Date and time") },
		{ name: "score", label: t("Fraud score") },
		{ name: "status", label: t("Status") },
		{ name: "service_slug", label: t("Provider") },
		{ name: "risk_level", label: t("Risk level") },
		{ name: "actions", label: t("Report") }
	]);

	const currentNameAmlProvider = (slug: string): string =>
		dictionary.value?.available_aml_providers.find((provider) => provider.slug === slug)?.label ?? slug;

	const getLatestRequestHistory = (row: IAmlHistoryItemResponse) =>
		row.request_history?.length ? row.request_history[row.request_history.length - 1] : null;

	const getErrorMsg = (row: IAmlHistoryItemResponse): string | null => {
		const latest = getLatestRequestHistory(row);
		if (latest?.error_msg) return latest.error_msg;
		const withError = [...(row.request_history || [])].reverse().find((item) => item.error_msg);
		return withError?.error_msg ?? null;
	};

	const getRiskLevelClass = (riskLevel: string): string => {
		if (riskLevel === "high" || riskLevel === "critical") return "risk-level--danger";
		if (riskLevel === "medium") return "risk-level--warning";
		return "";
	};

	const formatFraudScore = (score: string): string => {
		const value = Number(score);
		if (!Number.isFinite(value)) return "—";
		const percent = Math.ceil(value <= 1 ? value * 100 : value);
		return `${percent}%`;
	};

	const handleDownloadReport = (row: IAmlHistoryItemResponse) => {
		const serviceResponse = getLatestRequestHistory(row)?.service_response;
		if (!serviceResponse) return;
		downloadAmlServiceResponsePdf(serviceResponse, `aml-report-${row.id}.pdf`);
	};

	const changePageHandler = async (pagination: UiPaginationMeta) => {
		amlHistoryFilter.value.page = pagination.page;
		await getAmlHistory();
	};

	const goToProviders = () => {
		const slug =
			amlSettings.value?.provider_slug ||
			formAmlScoreTransaction.value.provider_slug ||
			connectedProviderSlugs.value[0] ||
			dictionary.value?.available_aml_providers[0]?.slug;
		if (!slug) return;
		router.push({ name: "aml-settings", params: { aml: slug } });
	};

	const goToManualCheck = () => {
		const aml =
			amlSettings.value?.provider_slug ||
			formAmlScoreTransaction.value.provider_slug ||
			connectedProviderSlugs.value[0] ||
			dictionary.value?.available_aml_providers[0]?.slug;
		if (!aml) return;
		router.push({ name: "aml-manual-check", params: { aml } });
	};

	const initAmlHistoryPage = async () => {
		await Promise.all([getAmlSettings(), getAllAmlKeys()]);

		if (!amlSettings.value?.provider_slug) {
			const firstSlug = dictionary.value?.available_aml_providers[0]?.slug;
			if (firstSlug) formAmlScoreTransaction.value.provider_slug = firstSlug;
			await router.replace({ name: "aml-keys" });
			return;
		}

		amlHistoryFilter.value = { page: 1 };
		await getAmlHistory();
		isInitializing.value = false;
	};

	onMounted(initAmlHistoryPage);
</script>

<template>
	<div v-if="isInitializing" class="page page--loading">
		<ui-skeleton :rows="1" :row-height="40" :item-border-radius="8" class="page__header-skeleton" />
		<ui-skeleton :rows="1" :row-height="88" :item-border-radius="16" />
		<ui-skeleton :rows="1" :row-height="28" :item-border-radius="8" class="page__title-skeleton" />
		<ui-skeleton :rows="8" :row-height="48" :rows-gap="8" :item-border-radius="8" />
	</div>

	<div v-else class="page">
		<div class="page__header">
			<h1 class="global-title-h1">{{ $t("AML check of transfer") }}</h1>
			<div class="page__actions">
				<ui-button
					type="secondary"
					size="xl"
					left-icon-name="check-circle"
					left-icon-size="md"
					@click="goToManualCheck"
				>
					{{ $t("Check transaction") }}
				</ui-button>
				<ui-button mode="neutral" size="xl" left-icon-name="settings" left-icon-size="md" @click="goToProviders">
					{{ $t("AML providers") }}
				</ui-button>
			</div>
		</div>

		<div class="flex flex-column gap-24">
			<aml-history-stats />
			<h2 class="global-title-h2">{{ $t("History of checks") }}</h2>
			<ui-table
				:loading="isLoadingAmlHistory"
				:headers="headers"
				:data="amlHistory"
				:meta="amlHistoryPagination"
				:isShowPerPageSelect="false"
				table-layout="fixed"
				@change-pagination="changePageHandler"
			>
				<template #body-cell-created_at="{ row }">
					{{ formatDate(row.created_at) }}
				</template>
				<template #body-cell-score="{ row }">
					{{ row.status === "failed" ? "—" : formatFraudScore(row.score) }}
				</template>
				<template #body-cell-status="{ row }">
					<ui-tooltip
						v-if="row.status === 'failed' && getErrorMsg(row)"
						:title="$t('Error')"
						:text="getErrorMsg(row) || ''"
					>
						<show-status-general :status="row.status" :w-full="false" />
					</ui-tooltip>
					<show-status-general v-else :status="row.status" :w-full="false" />
				</template>
				<template #body-cell-risk_level="{ row }">
					<template v-if="row.status === 'failed'">—</template>
					<span v-else class="risk-level" :class="getRiskLevelClass(row.risk_level)">
						{{ row.risk_level in RISK_LEVEL_ENUM ? $t(RISK_LEVEL_ENUM[row.risk_level]) : row.risk_level }}
					</span>
				</template>
				<template #body-cell-actions="{ row }">
					<ui-button
						type="secondary"
						size="sm"
						left-icon-name="download"
						left-icon-size="md"
						:disabled="!getLatestRequestHistory(row)?.service_response"
						@click="handleDownloadReport(row)"
					>
						{{ $t("Download") }}
					</ui-button>
				</template>
				<template #body-cell-service_slug="{ row }">
					{{ currentNameAmlProvider(row.service_slug) }}
				</template>
			</ui-table>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;

		&--loading {
			gap: 24px;
		}

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
		}

		&__actions {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-shrink: 0;
		}

		&__header-skeleton {
			max-width: 320px;
		}

		&__title-skeleton {
			max-width: 220px;
		}
	}

	.risk-level {
		&--danger {
			color: rgba(237, 10, 52, 1);
		}
		&--warning {
			color: #ff9e00;
		}
	}
</style>
