<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { storeToRefs } from "pinia";
	import { formatDollars } from "@shared/utils/helpers/general";
	import { useI18n } from "vue-i18n";
	import { computed } from "vue";
	import { UiButton, UiTable } from "@dv.net/ui-kit";
	import { getReplenishmentDeclension, getDate } from "@dv-admin/utils/helpers/dashboard";
	import { getCurrentCoin } from "@shared/utils/helpers/general";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useGeneralStore } from "@dv-admin/stores/general";

	const { depositSummary, isLoadingDeposit } = storeToRefs(useDashboardStore());
	const { dictionary } = storeToRefs(useGeneralStore())
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
		{ name: "transactions_count", label: t("Details and number of top ups") },
		{
			name: "details",
			width: "180",
			columnClass: (row: any) => (row.isMoreDetails ? "column-alignment" : "")
		}
	]);

	const isShowOnlyCoin = (currencyId: string): boolean => {
		const currencies = dictionary.value?.available_currencies;
		if (!currencies?.length) return false;
		const targetCoin = getCurrentCoin(currencyId);
		const matchingCoins = currencies
			.map(({ id }) => getCurrentCoin(id))
			.filter((coin) => coin === targetCoin);
		return matchingCoins.length === 1;
	};
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
			:row-class="(row) => (row.details_by_currency.length > 3 ? '' : 'no-pointer')"
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
				<div class="detail">
					<span class="detail__replenishment">
						{{ row.transactions_count }} {{ $t(getReplenishmentDeclension(row.transactions_count)) }}
					</span>
					<div class="detail__coins" :class="{ hidden: !row.isMoreDetails }">
						<div
							class="detail__coin"
							v-for="item in row.details_by_currency"
							:key="item.currency"
						>
							<span class="detail__coin-blue" :class="{ 'detail__coin-green': item.percentage > 50 }">
								{{ item.percentage }}%
							</span>
							<span>
								{{ isShowOnlyCoin(item.currency) ? getCurrentCoin(item.currency) : item.currency.replace(".", " ") }}
							</span>
						</div>
					</div>
				</div>
			</template>

			<template #body-cell-details="{ row }">
				<Transition
					v-if="row.details_by_currency.length > 3"
					name="fade"
					mode="out-in"
					:duration="{ enter: 10, leave: 10 }"
					style="margin-left: auto"
				>
					<ui-button
						:key="String(row.isMoreDetails)"
						:type="row.isMoreDetails ? 'outline-light' : 'outline'"
						:mode="row.isMoreDetails ? 'neutral' : 'accent'"
						size="sm"
						:left-icon-name="row.isMoreDetails ? 'keyboard-arrow-up' : 'keyboard-arrow-down'"
						left-icon-size="sm"
					>
						{{ row.isMoreDetails ? $t("Hide") : $t("Show all") }}
					</ui-button>
				</Transition>
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
					&:not(.no-pointer) {
						@extend .pointer;
					}

					.column-alignment {
						vertical-align: top;

						.ui-table__body-cell-inner {
							margin-top: 5px;
						}
					}

					&:first-child .ui-table__body-cell {
						&:first-child {
							.ui-table__body-cell-inner {
								font-weight: 500;
							}
						}

						&:nth-child(2) {
							.ui-table__body-cell-inner {
								font-weight: 500;
							}
						}
					}
				}
			}

			.detail {
				display: flex;
				gap: 4px;
				align-items: center;
				flex-grow: 1;

				&__replenishment {
					flex-shrink: 0;
					align-self: baseline;
					min-width: 100px;
					color: $blue;
					font-size: 12px;
					font-weight: 500;
					padding: 4px 8px;
					border-radius: 4px;
					border: 1px solid $grey;
					background-color: $blue-opacity;
				}

				&__coins {
					display: flex;
					flex-wrap: wrap;
					gap: 4px;
					flex-grow: 1;

					&.hidden {
						overflow: hidden;
						height: 30px;
					}
				}

				&__coin {
					display: flex;
					align-items: center;
					gap: 4px;
					border-radius: 4px;
					border: 1px solid $grey;
					padding: 4px 8px;
					color: $secondary;
					font-size: 12px;
					font-weight: 500;
					width: max-content;

					&-blue {
						color: $blue;
					}

					&-green {
						color: #5dd565;
					}
				}
			}
		}
	}
</style>
