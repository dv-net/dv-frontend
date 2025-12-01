<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { storeToRefs } from "pinia";
	import { formatDollars } from "@shared/utils/helpers/general";
	import { useI18n } from "vue-i18n";
	import { computed } from "vue";
	import { UiIcon, UiTable } from "@dv.net/ui-kit";
	import { getReplenishmentDeclension, getDate } from "@dv-admin/utils/helpers/dashboard";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";

	const { depositSummary, isLoadingDeposit } = storeToRefs(useDashboardStore());
	const { t, locale } = useI18n();

	const isVisibleTable = computed<boolean>(() => {
		if (isLoadingDeposit.value) return true;
		return Boolean(depositSummary.value.length);
	});

	const headers = computed<UiTableHeader[]>(() => [
		{
			name: "date",
			label: t("Date"),
			width: "150",
			columnClass: (row: any) => (row.isMoreDetails ? "column-alignment" : "")
		},
		{
			name: "sum_usd",
			label: t("Total"),
			width: "100",
			columnClass: (row: any) => (row.isMoreDetails ? "column-alignment" : "")
		},
		{
			name: "transactions_count",
			label: t("Count"),
			width: "180",
			columnClass: (row: any) => (row.isMoreDetails ? "column-alignment" : "")
		},
		{ name: "details", label: t("Top-Ups") },
		{
			name: "arrow",
			width: "60",
			columnClass: (row: any) => (row.isMoreDetails ? "column-alignment" : "")
		}
	]);
</script>

<template>
	<block-section v-if="isVisibleTable" class="deposit" :title="$t('Summary of deposits')" :isLoading="isLoadingDeposit">
		<ui-table
			:loading="isLoadingDeposit"
			:headers="headers"
			:data="depositSummary"
			table-layout="fixed"
			class="deposit__table"
			@rowClick="(row) => (row.isMoreDetails = !row.isMoreDetails)"
			:row-class="(row) => (row.details_by_currency.length > 4 ? '' : 'no-pointer')"
		>
			<template #body-cell-date="{ row }">
				{{
					getDate(row.date, row.type, locale).isTranslate
						? $t(getDate(row.date, row.type, locale).text)
						: getDate(row.date, row.type, locale).text
				}}
			</template>
			<template #body-cell-sum_usd="{ row }"> {{ formatDollars(row.sum_usd) }}</template>
			<template #body-cell-transactions_count="{ row }">
				<span class="replenishment">
					{{ row.transactions_count }} {{ $t(getReplenishmentDeclension(row.transactions_count)) }}
				</span>
			</template>
			<template #body-cell-details="{ row }">
				<div class="coins" :class="{ hidden: !row.isMoreDetails }">
					<div
						class="coins__item"
						v-for="item in row.details_by_currency"
						:key="item.currency"
						:class="{ 'coins__item--green': item.percentage > 50 }"
					>
						<span>{{ item.percentage }}%</span>
						<span>{{ item.currency }}</span>
					</div>
				</div>
			</template>
			<template #body-cell-arrow="{ row }">
				<div v-if="row.details_by_currency.length > 4" class="arrow">
					<span class="arrow__icon" :class="{ 'arrow__icon--rotated': row.isMoreDetails }">
						<ui-icon type="400" name="keyboard-arrow-down" color="#A4A5B1" />
					</span>
				</div>
			</template>
		</ui-table>
	</block-section>
</template>

<style scoped lang="scss">
	.deposit {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 20px;
		&__table {
			&:deep(.ui-table) {
				.ui-table__body-row {
					@media (hover: hover) {
						&:hover {
							background-color: unset;
						}
					}
					&:not(.no-pointer) {
						@extend .pointer;
					}
					.column-alignment {
						vertical-align: top;
						.ui-table__body-cell-inner {
							margin-top: 5px;
						}
						&:nth-child(3) {
							.ui-table__body-cell-inner {
								margin-top: 0;
							}
						}
					}
				}
			}
			.replenishment {
				flex-shrink: 0;
				min-width: 100px;
				max-width: 140px;
				color: $blue;
				font-size: 12px;
				font-weight: 500;
				padding: 4px 8px;
				border-radius: 4px;
				border: 1px solid $grey;
				background-color: $blue-opacity;
				word-break: break-word;
			}
			.coins {
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				gap: 4px;
				&.hidden {
					overflow: hidden;
					height: 30px;
				}
				&__item {
					flex-shrink: 0;
					width: 104px;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 4px;
					border-radius: 6px;
					padding: 4px 8px;
					color: $blue;
					font-size: 12px;
					font-weight: 500;
					background: #F7F9FB;
					word-break: break-word;
					&--green {
						color: #1F9649;
						background: rgba(31, 150, 73, 0.08);
					}
				}
			}
			.arrow {
				width: 100%;
				display: flex;
				justify-content: flex-end;
				&__icon {
					flex-shrink: 0;
					@extend .center;
					width: 25px;
					height: 25px;
					transition: transform 0.3s ease;
					&--rotated {
						transform: rotate(180deg);
					}
				}
			}
		}
	}
</style>
