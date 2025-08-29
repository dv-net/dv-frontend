<script setup lang="ts">
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import BlockWebhookDemo from "@dv-admin/components/ui/blockWebhookDemo/BlockWebhookDemo.vue";
	import { ref, computed, onMounted } from "vue";
	import { UiButton } from "@dv.net/ui-kit/dist";
	import { useI18n } from "vue-i18n";
	import ShowStatus from "@dv-admin/components/ui/showStatus/ShowStatus.vue";
	import { storeToRefs } from "pinia";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { UiSelect, UiTable } from "@dv.net/ui-kit";
	import { useWebhooksStore } from "@dv-admin/stores/history/webhooks";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import type { IStoreHistoryWebhooks } from "@dv-admin/utils/types/api/apiGo";

	const { isLoadingSendWebhooksHistory, isLoadingWebhooksHistory, webhooksHistory, webhooksPagination } =
		storeToRefs(useWebhooksStore());
	const { getWebhookHistory, postTransactionSendWebhooks } = useWebhooksStore();
	const { projects, selectedProject } = storeToRefs(useProjectsStore());
	const { t } = useI18n();

	const expandListUuid = ref<string[]>([]);
	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Created") },
		{ name: "is_success", label: t("Result") },
		{ name: "request", label: t("Request"), width: "150" },
		{ name: "status_code", label: t("Response code") },
		{ name: "response", label: t("Response"), width: "200" },
		{ name: "actions", label: t("Actions") }
	]);

	const handleOpenRow = (row: IStoreHistoryWebhooks) => {
		if (expandListUuid.value.includes(row.id)) {
			expandListUuid.value = expandListUuid.value.filter((item) => item !== row.id);
		} else {
			expandListUuid.value.push(row.id);
		}
	};

	const handleRowClick = async (row: IStoreHistoryWebhooks) => {
		handleOpenRow(row);
	};

	const changePageHandler = async (pagination: UiPaginationMeta) => {
		webhooksPagination.value.page = pagination.page;
		await getWebhookHistory("pagination");
	};

	onMounted(async () => {
		await getWebhookHistory();
	});
</script>

<template>
	<div class="page">
		<ui-select
			class="page__webhooks-select"
			size="sm"
			:placeholder="$t('Select project')"
			v-model="selectedProject"
			:options="projects.map((item) => ({ label: item.name, value: item.id }))"
			clearable
			@change="getWebhookHistory"
			@clear="getWebhookHistory"
		/>

		<ui-table
			expande-key="id"
			:row-class="() => 'pointer'"
			v-model:expanded="expandListUuid"
			:loading="isLoadingWebhooksHistory"
			:headers="headers"
			:data="webhooksHistory"
			:meta="webhooksPagination"
			@row-click="handleRowClick"
			@change-pagination="changePageHandler"
		>
			<template #body-cell-created_at="{ row }">{{ formatDate(row.created_at) }}</template>

			<template #body-cell-is_success="{ row }">
				<show-status
					:text="row.is_success ? $t('Success') : $t('Error')"
					:mode="row.is_success ? 'positive' : 'negative'"
				/>
			</template>

			<template #body-cell-request="{ row }">
				<div class="global-text-ellipsis max-width-170">{{ row.request }}</div>
			</template>

			<template #body-cell-response="{ row }">
				<div class="global-text-ellipsis max-width-170">{{ row.response }}</div>
			</template>

			<template #body-cell-actions="{ row }">
				<div class="flex flex-y-center gap-8">
					<ui-button
						type="primary"
						size="sm"
						:loading="isLoadingSendWebhooksHistory[row.id]"
						@click.stop="postTransactionSendWebhooks(row.id, row.transaction_id)"
					>
						{{ $t("Resend") }}
					</ui-button>

					<ui-button type="secondary" size="sm" @click.stop="handleOpenRow(row)">
						{{ $t(expandListUuid.includes(row.id) ? "Hide details" : "Show details") }}
					</ui-button>
				</div>
			</template>

			<template #expande="{ row }">
				<div class="flex flex-column gap-8 py-4 px-16">
					<block-webhook-demo :webhook="row" type="request" />
					<block-webhook-demo :webhook="row" type="response" />
				</div>
			</template>
		</ui-table>
	</div>
</template>

<style scoped lang="scss">
	.page {
		&__webhooks-select {
			max-width: 250px;
			margin-bottom: 24px;
		}

		.max-width-170 {
			max-width: 170px;
		}
	}
</style>
