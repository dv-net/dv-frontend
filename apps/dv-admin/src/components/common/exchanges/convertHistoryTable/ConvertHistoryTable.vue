<script setup lang="ts">
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { formatAmountBlockchain, formatDollars } from "@shared/utils/helpers/general";
	import { UiTable } from "@dv.net/ui-kit";
	import ShowStatusGeneral from "@dv-admin/components/ui/showStatusGeneral/ShowStatusGeneral.vue";
	import { computed, ref, watch } from "vue";
	import type { UiTableHeader, UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import type { IExchangeOrderItemResponse, IExchangeOrderRequest } from "@dv-admin/utils/types/api/apiGo";
	import { getApiExchangeOrder } from "@dv-admin/services/api/withdrawal";
	import { parsePagination } from "@dv-admin/utils/helpers/parsePagination";
	import { useI18n } from "vue-i18n";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import { useTransactionStore } from "@dv-admin/stores/history";
	import { storeToRefs } from "pinia";

	const { t } = useI18n();
	const { filterTransactions } = storeToRefs(useTransactionStore());

	const props = defineProps<{ slug: string | undefined }>();

	const withdrawalOrderList = ref<IExchangeOrderItemResponse[]>([]);
	const withdrawalOrderPagination = ref<UItableMeta | null>(null);
	const isLoadingWithdrawalOrder = ref<boolean>(false);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Date"), width: "180" },
		{ name: "amount", label: t("Total") },
		{ name: "amount_usd", label: t("Total") + " $" },
		{ name: "side", label: t("Buy / Sell") },
		{ name: "symbol", label: t("Symbol") },
		{ name: "status", label: t("Status"), width: "200" }
	]);

	const getExchangeOrder = async (slug: string | undefined, page?: number) => {
		try {
			isLoadingWithdrawalOrder.value = true;
			const params: IExchangeOrderRequest = {
				page: page || withdrawalOrderPagination.value?.page || 1,
				page_size: 100,
				slug,
				date_from: filterTransactions.value?.date_from || null,
				date_to: filterTransactions.value?.date_to || null
			};
			const data = await getApiExchangeOrder(params);
			if (data.items) withdrawalOrderList.value = data.items;
			if (data.pagination) withdrawalOrderPagination.value = parsePagination(data.pagination);
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingWithdrawalOrder.value = false;
		}
	};

	watch(
		() => props.slug,
		async (newValue: string | undefined) => {
			await getExchangeOrder(newValue);
		},
		{ immediate: true }
	);

	defineExpose({ getExchangeOrder });
</script>

<template>
	<ui-table
		:loading="isLoadingWithdrawalOrder"
		:headers="headers"
		:data="withdrawalOrderList"
		:meta="withdrawalOrderPagination"
		@change-pagination="(pagination: UiPaginationMeta) => getExchangeOrder(slug, pagination.page)"
		:isShowPerPageSelect="false"
		table-layout="fixed"
	>
		<template #body-cell-created_at="{ row }">
			{{ formatDate(row.created_at) }}
		</template>
		<template #body-cell-amount="{ row }">
			{{ formatAmountBlockchain(row.amount) }}
		</template>
		<template #body-cell-amount_usd="{ row }">
			{{ formatDollars(row.amount_usd) }}
		</template>
		<template #body-cell-status="{ row }">
			<div class="flex flex-y-center gap-4 w-full">
				<show-status-general :status="row.status" />
				<tooltip-helper
					v-if="row?.fail_reason"
					position="top-start"
					icon-color="#dd4c1e"
					:title="row.status"
					:text="row.fail_reason"
				/>
			</div>
		</template>
	</ui-table>
</template>
