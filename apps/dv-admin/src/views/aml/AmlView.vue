<script setup lang="ts">
	import { storeToRefs } from "pinia";
	import { UiButton, UiDatepickerRange, UiIcon, UiIconButton, UiSelect, UiSkeleton, UiTable } from "@dv.net/ui-kit";
	import { computed, onMounted, ref } from "vue";
	import { useRouter } from "vue-router";
	import { useAmlStore } from "@dv-admin/stores/aml";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import {
		AML_CHECK_STATUS,
		AML_RISK_LEVEL,
		AML_RISK_LEVEL_LABELS,
		type TAmlCheckStatus,
		type TAmlRiskLevel
	} from "@dv-admin/utils/constants/aml";
	import { ALL_STATUSES } from "@dv-admin/utils/constants/general";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse.ts";
	import type { IAmlHistoryItemResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general";
	import { downloadAmlServiceResponsePdf } from "@dv-admin/utils/helpers/downloadAmlServiceResponsePdf.ts";
	import AmlHistoryStats from "@dv-admin/views/aml/components/amlHistoryStats/AmlHistoryStats.vue";
	import { formatDollars, truncateHash } from "@shared/utils/helpers/general";
	import { getLinkExplorer, getLinkSearch } from "@shared/utils/helpers/linkExplorer";

	const { t } = useI18n();
	const router = useRouter();

	const {
		isLoadingAmlHistory,
		amlHistoryPagination,
		amlHistory,
		amlHistoryFilter,
		amlSettings,
		amlStatistics,
		formAmlScoreTransaction,
		connectedProviderSlugs
	} = storeToRefs(useAmlStore());
	const { getAmlHistory, getAmlSettings, getAllAmlKeys, getAmlStatistics } = useAmlStore();
	const { dictionary } = storeToRefs(useGeneralStore());

	const isInitializing = ref(true);
	const historyDate = ref<string[]>([]);
	const historyStatus = ref<TAmlCheckStatus | null>(null);
	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Date and time"), width: "168" },
		{ name: "amount_usd", label: t("Amount"), width: "123" },
		{ name: "tx_hash", label: t("Payment"), width: "167" },
		{ name: "email", label: t("Email"), width: "180" },
		{ name: "score", label: "Fraud score", width: "176" },
		{ name: "status", label: t("Result"), width: "126" },
		{ name: "actions", label: t("Report"), width: "126", align: "center" }
	]);
	const statusOptions = computed<IUiSelectOptions[]>(() => [
		{ value: AML_CHECK_STATUS.pending, label: t(ALL_STATUSES.pending) },
		{ value: AML_CHECK_STATUS.success, label: t(ALL_STATUSES.success) },
		{ value: AML_CHECK_STATUS.failed, label: t(ALL_STATUSES.failed) }
	]);
	const selectedStatusLabel = computed(
		() => statusOptions.value.find((option) => option.value === historyStatus.value)?.label ?? t("Select status")
	);
	const getLatestRequestHistory = (row: IAmlHistoryItemResponse) =>
		row.request_history?.length ? row.request_history[row.request_history.length - 1] : null;

	const getScoreTone = (riskLevel: TAmlRiskLevel | null): string => {
		if (riskLevel === AML_RISK_LEVEL.low || riskLevel === AML_RISK_LEVEL.none) return "low";
		if (riskLevel === AML_RISK_LEVEL.medium) return "medium";
		if (riskLevel === AML_RISK_LEVEL.high || riskLevel === AML_RISK_LEVEL.critical) return "high";
		return "unknown";
	};

	const formatFraudScore = (score: string | number): string => {
		const value = Number(score);
		if (!Number.isFinite(value)) return "";
		const percent = Math.ceil(value <= 1 ? value * 100 : value);
		return `${percent}%`;
	};

	const resultLabel = (status: TAmlCheckStatus): string => t(status in ALL_STATUSES ? ALL_STATUSES[status] : status);

	const getPaymentHref = (row: IAmlHistoryItemResponse): string => {
		if (!row.tx_hash || !row.currency_id) return "";
		return getLinkExplorer(row.currency_id, "transaction", row.tx_hash);
	};

	const isAmlCheckResultUnavailable = (status: TAmlCheckStatus): boolean =>
		status === AML_CHECK_STATUS.failed || status === AML_CHECK_STATUS.pending;

	const canDownloadAmlReport = (row: IAmlHistoryItemResponse): boolean =>
		row.status !== AML_CHECK_STATUS.pending && Boolean(getLatestRequestHistory(row)?.service_response);

	const handleDownloadReport = (row: IAmlHistoryItemResponse) => {
		if (!canDownloadAmlReport(row)) return;
		const latest = getLatestRequestHistory(row);
		if (!latest?.service_response) return;
		downloadAmlServiceResponsePdf(latest.service_response, `aml-report-${row.id}.pdf`, {
			id: row.id,
			status: row.status,
			score: row.score,
			riskLevel: row.risk_level,
			txHash: row.tx_hash,
			amountUsd: row.amount_usd,
			currencyId: row.currency_id,
			email: row.email,
			createdAt: row.created_at,
			requestPayload: latest.request_payload
		});
	};

	const reloadHistory = async () => {
		amlHistoryFilter.value.page = 1;
		await getAmlHistory();
	};

	const changeHistoryDate = async (value: string[]) => {
		const from = value[0]?.slice(0, 10);
		const to = value[1]?.slice(0, 10);
		amlHistoryFilter.value.date_from = from && to ? from : undefined;
		amlHistoryFilter.value.date_to = from && to ? to : undefined;
		await reloadHistory();
	};

	const changeHistoryStatus = async (status: TAmlCheckStatus | null) => {
		const next = status ?? null;
		if (historyStatus.value === next && amlHistoryFilter.value.status === (next ?? undefined)) return;
		historyStatus.value = next;
		amlHistoryFilter.value.status = next ?? undefined;
		await reloadHistory();
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
		await Promise.all([getAmlHistory(), getAmlStatistics()]);
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
			<h1 class="global-title-h1">{{ $t("Transfer AML check") }}</h1>
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
			<aml-history-stats
				:checked-today="amlStatistics?.checked_today"
				:successful="amlStatistics?.successful_today"
				:failed="amlStatistics?.failed_today"
			/>
			<div class="history">
				<div class="history__head">
					<h2 class="global-title-h2">{{ $t("Check history") }}</h2>
					<div class="history__filters">
						<ui-datepicker-range v-model="historyDate" size="sm" clearable @update:model-value="changeHistoryDate" />
						<ui-select
							v-model="historyStatus"
							class="history__status"
							type="default"
							size="sm"
							clearable
							:options="statusOptions"
							@update:model-value="changeHistoryStatus"
							@clear="changeHistoryStatus(null)"
						>
							<template #selected>
								<span class="history__status-value">
									<ui-icon type="400" name="done" size="sm" />
									<span>{{ selectedStatusLabel }}</span>
								</span>
							</template>
						</ui-select>
					</div>
				</div>
				<ui-table
					class="history__table"
					:loading="isLoadingAmlHistory"
					:headers="headers"
					:data="amlHistory"
					:meta="amlHistoryPagination"
					:isShowPerPageSelect="false"
					table-layout="fixed"
					@change-pagination="changePageHandler"
				>
					<template #body-cell-created_at="{ row }">
						{{ formatDate(row.created_at, { errorValue: "" }) }}
					</template>
					<template #body-cell-amount_usd="{ row }">
						{{ row.amount_usd == null ? "" : formatDollars(row.amount_usd) }}
					</template>
					<template #body-cell-tx_hash="{ row }">
						<a
							v-if="row.tx_hash && getPaymentHref(row)"
							class="history__link"
							:href="getPaymentHref(row)"
							target="_blank"
							rel="noopener noreferrer"
						>
							{{ truncateHash(row.tx_hash, 4, 8) }}
							<ui-icon type="400" name="new-windows" size="md" />
						</a>
						<router-link v-else-if="row.tx_hash" class="history__link" :to="getLinkSearch('transaction', row.tx_hash)">
							{{ truncateHash(row.tx_hash, 4, 8) }}
							<ui-icon type="400" name="new-windows" size="md" />
						</router-link>
					</template>
					<template #body-cell-email="{ row }">
						<a v-if="row.email" class="history__link history__email" :href="`mailto:${row.email}`">
							{{ row.email }}
						</a>
					</template>
					<template #body-cell-score="{ row }">
						<span
							v-if="!isAmlCheckResultUnavailable(row.status) && row.risk_level"
							class="score"
							:class="`score--${getScoreTone(row.risk_level)}`"
						>
							<span>{{
								row.risk_level in AML_RISK_LEVEL_LABELS ? AML_RISK_LEVEL_LABELS[row.risk_level] : row.risk_level
							}}</span>
							<strong>{{ formatFraudScore(row.score) }}</strong>
						</span>
					</template>
					<template #body-cell-status="{ row }">
						<span class="result" :class="`result--${row.status}`">{{ resultLabel(row.status) }}</span>
					</template>
					<template #body-cell-actions="{ row }">
						<ui-icon-button
							class="history__download"
							type="clear"
							mode="square"
							size="md"
							icon-name="download"
							icon-type="400"
							:disabled="!canDownloadAmlReport(row)"
							:aria-label="$t('Download')"
							@click="handleDownloadReport(row)"
						/>
					</template>
				</ui-table>
			</div>
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

	.history {
		display: flex;
		flex-direction: column;
		gap: 24px;

		&__head {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			flex-wrap: wrap;
		}

		&__filters {
			display: flex;
			align-items: center;
			gap: 16px;
			flex-wrap: wrap;
		}

		&__status {
			width: 210px;
			flex-shrink: 0;
		}

		&__status-value {
			display: inline-flex;
			align-items: center;
			gap: 12px;
			min-width: 0;
			max-width: 100%;

			:deep(.ui-icon) {
				flex-shrink: 0;
			}
		}

		&__link {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			max-width: 100%;
			color: $blue;
			font-size: 14px;
			line-height: 20px;
			text-decoration: none;
			transition: color 0.15s ease;

			&:hover {
				color: #1456c4;
			}
		}

		&__email {
			display: block;
			min-width: 0;
			white-space: normal;
			overflow-wrap: anywhere;
		}

		&__download {
			border: 1px solid $grey;
			background: $white;
			transition:
				border-color 0.15s ease,
				background-color 0.15s ease;

			&:hover:not(:disabled) {
				border-color: $grey-light;
				background: $blue-opacity;
			}
		}

		&__table {
			:deep(.ui-table__wrapper) {
				padding: 4px;
				border: none;
				border-radius: 16px;
				background: $blue-opacity;
				overflow: visible;
			}

			:deep(.ui-table) {
				border-collapse: separate;
				border-spacing: 0;
			}

			:deep(.ui-table__header) {
				background: transparent;
				box-shadow: none;
			}

			:deep(.ui-table__header-cell) {
				height: 44px;
				padding: 0 16px;
				color: $secondary;
				font-weight: 400;
			}

			:deep(.ui-table__header-cell-inner) {
				font-weight: 400;
			}

			:deep(.ui-table__body-row) {
				background: $white;
				box-shadow: none;
			}

			:deep(.ui-table__body-row:hover) {
				background: $white;
			}

			:deep(.ui-table__body-cell) {
				height: auto;
				min-height: 56px;
				padding: 16px;
				overflow: visible;
			}

			:deep(.ui-table__body-cell-inner) {
				min-width: 0;
				white-space: normal;
			}

			:deep(.ui-table__body-cell:not(:first-child)) {
				box-shadow: inset 1px 0 0 #ecf0f5;
			}

			:deep(.ui-table__body-row:first-child .ui-table__body-cell:first-child) {
				border-top-left-radius: 12px;
			}

			:deep(.ui-table__body-row:first-child .ui-table__body-cell:last-child) {
				border-top-right-radius: 12px;
			}

			:deep(.ui-table__body-row:last-child .ui-table__body-cell:first-child) {
				border-bottom-left-radius: 12px;
			}

			:deep(.ui-table__body-row:last-child .ui-table__body-cell:last-child) {
				border-bottom-right-radius: 12px;
			}

			:deep(tbody) {
				filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.05));
			}
		}
	}

	.score {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		height: 28px;
		padding: 0 12px;
		border-radius: 100px;
		font-size: 14px;
		line-height: 17px;
		white-space: nowrap;

		strong {
			font-weight: 700;
		}

		&--low {
			color: #5bb65b;
			background: rgba(91, 182, 91, 0.05);
		}

		&--medium {
			color: #ff6c2d;
			background: rgba(255, 108, 45, 0.05);
		}

		&--high {
			color: #ed0a34;
			background: rgba(237, 10, 52, 0.05);
		}

		&--unknown {
			color: $secondary;
			background: rgba(107, 109, 128, 0.08);
		}
	}

	.result {
		display: inline-block;
		padding-bottom: 2px;
		border-bottom: 1px solid currentColor;
		color: $black;
		font-size: 14px;
		line-height: 17px;

		&--success {
			color: #1f9649;
		}

		&--failed {
			color: #ed0a34;
		}

		&--pending {
			color: #ff9e00;
		}
	}
</style>
