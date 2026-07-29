<script setup lang="ts">
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { storeToRefs } from "pinia";
	import { UiTabs, UiTabsItem, UiButton, UiTable, UiSkeleton, UiCopyText } from "@dv.net/ui-kit";
	import { computed, ref, watch } from "vue";
	import { useRouter } from "vue-router";
	import { useTransferCheckStore } from "@dv-admin/stores/transferCheck";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import { RISK_LEVEL_ENUM } from "@dv-admin/utils/constants/transferCheck";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse.ts";
	import ShowStatusGeneral from "@dv-admin/components/ui/showStatusGeneral/ShowStatusGeneral.vue";
	import type { IAmlHistoryItemResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import AmlStatusBar from "@dv-admin/views/transferCheck/components/amlStatusBar/AmlStatusBar.vue";
	import AmlRiskRules from "@dv-admin/views/transferCheck/components/amlRiskRules/AmlRiskRules.vue";

	const { t } = useI18n();
	const router = useRouter();

	const {
		formAmlScoreTransaction,
		isLoadingAmlHistory,
		amlHistoryPagination,
		amlHistory,
		amlHistoryFilter,
		amlSettings
	} = storeToRefs(useTransferCheckStore());
	const { getAmlKeys, getAmlHistory, getAmlSettings } = useTransferCheckStore();
	const { dictionary, isLoadingDictionary } = storeToRefs(useGeneralStore());

	const expandListUuid = ref<string[]>([]);
	const isLoadingAmlProvider = ref(false);

	const isLoadingAmlPage = computed(() => isLoadingDictionary.value || isLoadingAmlProvider.value);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Date") },
		{ name: "status", label: t("Status") },
		{ name: "score", label: t("Score") },
		{ name: "risk_level", label: t("Risk level") },
		{ name: "service_slug", label: t("Provider") },
		{ name: "actions" }
	]);

	const currentNameAmlProvider = (slug: string): string =>
		dictionary.value?.available_aml_providers.find((provider) => provider.slug === slug)?.label ?? slug;

	const loadAmlProvider = async (slug: string) => {
		isLoadingAmlProvider.value = true;
		try {
			formAmlScoreTransaction.value.provider_slug = slug;
			amlHistoryFilter.value.provider_slug = slug;
			amlHistoryFilter.value.page = 1;
			expandListUuid.value = [];
			await Promise.all([getAmlKeys(slug), getAmlHistory()]);
		} finally {
			isLoadingAmlProvider.value = false;
		}
	};

	const initAmlPage = async () => {
		if (!dictionary.value) return;
		isLoadingAmlProvider.value = true;
		try {
			await getAmlSettings();
			const currentAmlProvider = amlSettings.value?.provider_slug || dictionary.value.available_aml_providers[0]?.slug;
			if (!currentAmlProvider) return;
			formAmlScoreTransaction.value.provider_slug = currentAmlProvider;
			amlHistoryFilter.value.provider_slug = currentAmlProvider;
			amlHistoryFilter.value.page = 1;
			await Promise.all([getAmlKeys(currentAmlProvider), getAmlHistory()]);
		} finally {
			isLoadingAmlProvider.value = false;
		}
	};

	const handleOpenRow = (row: IAmlHistoryItemResponse) => {
		if (expandListUuid.value.includes(row.id)) {
			expandListUuid.value = expandListUuid.value.filter((item) => item !== row.id);
		} else {
			expandListUuid.value.push(row.id);
		}
	};

	const changePageHandler = async (pagination: UiPaginationMeta) => {
		amlHistoryFilter.value.page = pagination.page;
		await getAmlHistory();
	};

	const goToManualCheck = () => {
		const aml = formAmlScoreTransaction.value.provider_slug;
		if (!aml) return;
		router.push({ name: "transfer-check-manual-check", params: { aml } });
	};

	watch(
		dictionary,
		async (newValue) => {
			if (newValue) await initAmlPage();
		},
		{ immediate: true }
	);
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("AML check of transfer") }}</h1>

		<div class="page__providers">
			<ui-skeleton v-if="isLoadingDictionary" :rowHeight="40" :rows="1" :item-border-radius="8" />
			<template v-else-if="dictionary?.available_aml_providers?.length">
				<div class="page__tabs">
					<ui-tabs
						v-model="formAmlScoreTransaction.provider_slug"
						mode="light"
						widthMode="equal"
						@change="loadAmlProvider"
					>
						<ui-tabs-item v-for="item in dictionary.available_aml_providers" :key="item.slug" :value="item.slug">
							{{ item.label }}
						</ui-tabs-item>
					</ui-tabs>
				</div>
				<ui-button
					type="secondary"
					size="lg"
					left-icon-name="check-circle"
					left-icon-size="md"
					@click="goToManualCheck"
				>
					{{ $t("Check transaction") }}
				</ui-button>
			</template>
		</div>

		<aml-status-bar :is-loading="isLoadingAmlPage" />

		<aml-risk-rules :is-loading="isLoadingAmlPage" />

		<div class="flex flex-column gap-24">
			<h2 class="global-title-h2">{{ $t("History of checks") }}</h2>
			<ui-table
				:loading="isLoadingAmlHistory"
				:headers="headers"
				:data="amlHistory"
				:meta="amlHistoryPagination"
				v-model:expanded="expandListUuid"
				:isShowPerPageSelect="false"
				table-layout="fixed"
				expande-key="id"
				@change-pagination="changePageHandler"
				@row-click="handleOpenRow"
				:row-class="() => 'pointer'"
			>
				<template #body-cell-created_at="{ row }">
					{{ formatDate(row.created_at) }}
				</template>
				<template #body-cell-status="{ row }">
					<show-status-general :status="row.status" :w-full="false" />
				</template>
				<template #body-cell-risk_level="{ row }">
					{{ row.risk_level in RISK_LEVEL_ENUM ? $t(RISK_LEVEL_ENUM[row.risk_level]) : row.risk_level }}
				</template>
				<template #body-cell-actions="{ row }">
					<ui-button type="secondary" size="sm" @click.stop="handleOpenRow(row)">
						{{ $t(expandListUuid.includes(row.id) ? "Hide details" : "Show details") }}
					</ui-button>
				</template>
				<template #body-cell-service_slug="{ row }">
					{{ currentNameAmlProvider(row.service_slug) }}
				</template>
				<template #expande="{ row }">
					<div class="json">
						<block-section mode="grey-border">
							<ui-copy-text
								:copied-text="JSON.stringify(row.request_history)"
								class="json__copy"
								color-icon="rgb(164, 165, 177)"
							/>
							<pre class="json__pre">{{ row.request_history }}</pre>
						</block-section>
					</div>
				</template>
			</ui-table>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;

		&__providers {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			margin: 32px 0 20px;
		}

		&__tabs {
			flex: 1;
			min-width: 0;
		}

		.json {
			padding: 24px;

			:deep(.block-section) {
				position: relative;
			}

			&__copy {
				position: absolute;
				top: 5px;
				right: 5px;
			}
			&__pre {
				max-height: 300px;
				overflow: auto;
			}
		}
	}
</style>
