<script setup lang="ts">
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general";
	import { UiIcon, UiTable, UiTooltip } from "@dv.net/ui-kit";
	import ShowStatusGeneral from "@dv-admin/components/ui/showStatusGeneral/ShowStatusGeneral.vue";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import { computed, ref, watch } from "vue";
	import type { IExchangeWithdrawalItemResponse, IExchangeWithdrawalRequest } from "@dv-admin/utils/types/api/apiGo";
	import type { UiTableHeader, UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { getApiExchangeWithdrawal } from "@dv-admin/services/api/withdrawal";
	import { parsePagination } from "@dv-admin/utils/helpers/parsePagination";
	import { useI18n } from "vue-i18n";
	import { storeToRefs } from "pinia";
	import { useTransactionStore } from "@dv-admin/stores/history";

	const { t } = useI18n();
	const { filterTransactions } = storeToRefs(useTransactionStore());

	const props = defineProps<{ slug: string | undefined }>();

	const exchangeWithdrawalList = ref<IExchangeWithdrawalItemResponse[]>([]);
	const exchangeWithdrawalPagination = ref<UItableMeta | null>(null);
	const isLoadingWithdrawalHistory = ref<boolean>(false);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Date"), width: "160" },
		{ name: "address", label: t("Address") },
		{ name: "tx_id", label: t("Transaction hash") },
		{ name: "amount_native", label: t("Total"), width: "160" },
		{ name: "amount_usd", label: t("Sum in") + " $", width: "120" },
		{ name: "status", label: t("Status"), width: "150" }
	]);

	const getExchangeWithdrawal = async (slug: string | undefined, page?: number) => {
		try {
			isLoadingWithdrawalHistory.value = true;
			const params: IExchangeWithdrawalRequest = {
				page: page || exchangeWithdrawalPagination.value?.page || 1,
				page_size: 100,
				slug,
				date_to: filterTransactions.value?.date_to || null,
				date_from: filterTransactions.value?.date_from || null
			};
			const data = await getApiExchangeWithdrawal(params);
			if (data.items) exchangeWithdrawalList.value = data.items;
			if (data.pagination) exchangeWithdrawalPagination.value = parsePagination(data.pagination);
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingWithdrawalHistory.value = false;
		}
	};

	watch(
		() => props.slug,
		async (newValue: string | undefined) => {
			await getExchangeWithdrawal(newValue);
		},
		{ immediate: true }
	);

	defineExpose({ getExchangeWithdrawal });
</script>

<template>
	<ui-table
		:loading="isLoadingWithdrawalHistory"
		:headers="headers"
		:data="exchangeWithdrawalList"
		:meta="exchangeWithdrawalPagination"
		@change-pagination="(pagination: UiPaginationMeta) => getExchangeWithdrawal(slug, pagination.page)"
		:isShowPerPageSelect="false"
		table-layout="fixed"
	>
		<template #body-cell-created_at="{ row }">
			{{ formatDate(row.created_at) }}
		</template>
		<template #body-cell-address="{ row }">
			<display-hash
				v-if="row.address"
				type="address"
				:hash="row.address"
				size-icon="sm"
				:currency-id="row.currency_id"
				:is-link="false"
			/>
			<div v-else>—</div>
		</template>
		<template #body-cell-tx_id="{ row }">
			<display-hash
				v-if="row.tx_id"
				type="transaction"
				:hash="row.tx_id"
				size-icon="sm"
				:currency-id="row.currency_id"
				:is-link="false"
			/>
			<div v-else>—</div>
		</template>
		<template #body-cell-amount_native="{ row }">
			{{
				row.amount_native
					? `${formatAmountBlockchain(row.amount_native, row.currency_id)} ${getCurrentCoin(row.currency_id)}`
					: "—"
			}}
		</template>
		<template #body-cell-amount_usd="{ row }">
			{{ formatDollars(row.amount_usd) }}
		</template>
		<template #body-cell-status="{ row }">
			<div class="flex flex-y-center gap-4 w-full">
				<show-status-general :status="row.status" />
				<ui-tooltip
					v-if="row?.fail_reason"
					mode="dark"
					position="top-start"
					is-gold-title
					:title="row.status === 'failed' ? $t('Error') : $t('Information')"
					:text="
						row.fail_reason === 'withdrawal balance locked'
							? $t(
									'At the time of withdrawal, some funds were still awaiting confirmation - we will send them with the next transfer'
								)
							: row.fail_reason
					"
				>
					<ui-icon class="pointer" name="help" type="400" :color="row.status === 'failed' ? '#dd4c1e' : '#FF9E00'" />
				</ui-tooltip>
			</div>
		</template>
	</ui-table>
</template>
