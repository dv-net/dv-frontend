<script setup lang="ts">
	import { type ENUM_TRANSACTIONS_TYPES, TRANSACTIONS_TYPES } from "@dv-admin/utils/constants/history";
	import { UiButton, UiDatepickerRange, UiSelect, UiTabs, UiTabsItem } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { getApiExchangeOrderReport, getApiExchangeWithdrawalReport } from "@dv-admin/services/api/withdrawal.ts";
	import { downloadBlobFile } from "@dv-admin/utils/helpers/downloadBlobFile.ts";
	import { getDayRangeIso, getLastDaysRange } from "@dv-admin/utils/helpers/dateParse.ts";
	import { computed, ref } from "vue";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general.ts";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import { storeToRefs } from "pinia";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import { useTransactionStore } from "@dv-admin/stores/history";
	import { useI18n } from "vue-i18n";
	import type { IProps } from "@dv-admin/views/history/transactionHistory/components/blockFilterTransactions/types";

	const { notify } = useNotifications();
	const { t } = useI18n();
	const { activeExchange } = storeToRefs(useExchangeSettingsStore());
	const { connectedExchanges } = storeToRefs(useWithdrawalStore());
	const { filterTransactions } = storeToRefs(useTransactionStore());

	const { showedTable, changeFilter, changeTabs } = defineProps<IProps>();
	const selectedExchange = defineModel<string>("selectedExchange");
	const tab = defineModel<ENUM_TRANSACTIONS_TYPES>("tab", {
		required: true,
		default: TRANSACTIONS_TYPES.USER_REPLENISHMENTS
	});

	const date = ref<string[]>([getLastDaysRange().dateFromWithTime, getLastDaysRange().dateToWithTime]);
	const isLoadingReport = ref<boolean>(false);
	const reportFormat = ref<"csv" | "xlsx">();

	const exchanges = computed<IUiSelectOptions[]>(() =>
		connectedExchanges.value.map(({ slug }) => ({
			value: slug as string,
			label: slug as string
		}))
	);

	const changeDate = async (date: string[]) => {
		filterTransactions.value.date_from = date.length === 2 ? getDayRangeIso(date[0])?.from || null : null;
		filterTransactions.value.date_to = date.length === 2 ? getDayRangeIso(date[1])?.to || null : null;
		filterTransactions.value.resolution = date[0] === date[1] ? "hour" : "day";
		filterTransactions.value.page = 1;
		await changeFilter();
	};

	const getReport = async () => {
		try {
			if (!reportFormat.value) return;
			isLoadingReport.value = true;
			const params = { format: reportFormat.value, slug: selectedExchange.value };
			const file =
				showedTable === "exchange"
					? await getApiExchangeOrderReport(params)
					: await getApiExchangeWithdrawalReport(params);

			downloadBlobFile(file, `report.${reportFormat.value}`);
			notify(t("Report downloaded"), "success");
		} catch (error) {
			console.error(error);
		} finally {
			isLoadingReport.value = false;
		}
	};
</script>

<template>
	<block-section mode="grey-border" class="mb-24">
		<div class="filters">
			<ui-datepicker-range v-model="date" @update:model-value="changeDate" />
			<div class="vertical-border" />
			<ui-tabs mode="outline" v-model="tab" @change="changeTabs">
				<ui-tabs-item :value="TRANSACTIONS_TYPES.USER_REPLENISHMENTS">{{ $t("Clients top ups") }}</ui-tabs-item>
				<ui-tabs-item :value="TRANSACTIONS_TYPES.WITHDRAWALS_FROM_HOT">{{ $t("Withdrawals from hot") }}</ui-tabs-item>
				<ui-tabs-item v-if="connectedExchanges" :value="TRANSACTIONS_TYPES.EXCHANGES_ON_THE_EXCHANGE">
					{{ $t("Exchanges on the crypto exchange") }}
				</ui-tabs-item>
				<ui-tabs-item v-if="connectedExchanges" :value="TRANSACTIONS_TYPES.WITHDRAWALS_FROM_THE_EXCHANGE">
					{{ $t("Withdrawals from the crypto exchange") }}
				</ui-tabs-item>
			</ui-tabs>
		</div>

		<div class="flex gap-8 mt-12" v-if="showedTable !== 'transactions'">
			<ui-select
				class="filters__select"
				size="sm"
				v-model="selectedExchange"
				type="default"
				:placeholder="$t('Select crypto exchange')"
				:options="exchanges"
				clearable
			>
				<template #default="{ option }">
					<span>{{ option.label }}</span>
					<span>{{ activeExchange === option.label ? ` (${$t("active")})` : "" }}</span>
				</template>
			</ui-select>

			<ui-select
				class="filters__select"
				size="sm"
				v-model="reportFormat"
				type="default"
				:placeholder="$t('Report format')"
				:options="[
					{ value: 'csv', label: 'csv' },
					{ value: 'xlsx', label: 'xlsx' }
				]"
				clearable
			/>

			<ui-button mode="neutral" :loading="isLoadingReport" @click="getReport" :disabled="!reportFormat">
				{{ $t("Download report") }}
			</ui-button>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.filters {
		width: 100%;
		display: flex;
		gap: 12px;

		.vertical-border {
			width: 1px;
			height: 20px;
			background-color: $grey;
			align-self: center;
		}

		.ui-tabs {
			flex-wrap: wrap;
		}

		.ui-tabs-item__button {
			width: fit-content;
			padding: 0 16px;
		}

		&__select {
			:deep(.ui-select__placeholder-inner) {
				width: 100%;
			}

			width: 250px;
		}
	}
</style>
