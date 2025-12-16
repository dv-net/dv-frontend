<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { storeToRefs } from "pinia";
	import { changeChainBsc, formatDollars, getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general";
	import { useI18n } from "vue-i18n";
	import { computed, ref } from "vue";
	import { UiTable } from "@dv.net/ui-kit";
	import { getReplenishmentDeclension, getDate } from "@dv-admin/utils/helpers/dashboard";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import type { IDepositFilteredSummary } from "@dv-admin/utils/types/schemas";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import type { BlockchainType } from "@shared/utils/types/blockchain";

	const { depositSummary, isLoadingDeposit } = storeToRefs(useDashboardStore());
	const { dictionary } = storeToRefs(useGeneralStore());
	const { t, locale } = useI18n();

	const expandListUuid = ref<number[]>([]);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "date", label: t("Date"), width: "150" },
		{ name: "sum_usd", label: t("Total"), width: "100" },
		{ name: "transactions_count", label: t("Count"), width: "180" },
		{ name: "details", label: t("Top-Ups") },
		{ expande: true, width: "60" }
	]);

	const isVisibleTable = computed<boolean>(() => {
		if (isLoadingDeposit.value) return true;
		return Boolean(depositSummary.value.length);
	});

	const isShowOnlyCoin = (currencyId: string): boolean => {
		const currencies = dictionary.value?.available_currencies;
		if (!currencies?.length) return false;
		const targetCoin = getCurrentCoin(currencyId);
		const matchingCoins = currencies.map(({ id }) => getCurrentCoin(id)).filter((coin) => coin === targetCoin);
		return matchingCoins.length === 1;
	};

	const getFormatingChain = (currency: string): string => {
		const coin = getCurrentCoin(currency);
		const chain = getCurrentBlockchain(currency);
		const formatingChain = changeChainBsc(chain);
		return `${coin} (${formatingChain})`;
	};

	const handleOpenRow = (row: IDepositFilteredSummary) => {
		if (expandListUuid.value.includes(row.id)) {
			expandListUuid.value = expandListUuid.value.filter((item) => item !== row.id);
		} else {
			expandListUuid.value.push(row.id);
		}
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
			expande-key="id"
			v-model:expanded="expandListUuid"
			@row-click="handleOpenRow"
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
				<div class="coins">
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
			<template #expande="{ row }">
				<div class="expande">
					<div
						v-for="item in row.allDetailsByCurrency"
						:key="item.currency"
						class="expande__item"
						:class="{ 'expande__item--highlight': item.percentage > 50 }"
						:style="{ '--percentage-width': item.percentage + '%' }"
					>
						<div class="top">
							<span class="top__percent"> {{ item.percentage }}% </span>
							<div class="top__inner">
								<blockchain-icon width="16px" height="16px" :type="item.currency as BlockchainType" />
								<span class="top__inner-text">
									{{ isShowOnlyCoin(item.currency) ? getCurrentCoin(item.currency) : getFormatingChain(item.currency) }}
								</span>
							</div>
							<span class="top__sum">{{ formatDollars(item.sum_usd) }}</span>
						</div>
					</div>
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
							cursor: pointer;
							background-color: unset;
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
					background: #f7f9fb;
					word-break: break-word;
					&--green {
						color: #1f9649;
						background: rgba(31, 150, 73, 0.08);
					}
				}
			}
			.expande {
				padding: 16px;
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				gap: 8px;
				flex-grow: 1;
				border-top: 1px solid #e1e8f1;
				&__item {
					height: 38px;
					position: relative;
					overflow: hidden;
					border-radius: 8px;
					padding: 6px 8px;
					transition: all 0.2s ease;
					border: 1px solid #ecf0f5;
					background-color: #f7f9fb;
					&::before {
						content: "";
						position: absolute;
						inset: auto 8px 6px;
						height: 3px;
						border-radius: 4px;
						background: #ecf0f5;
					}
					&::after {
						content: "";
						position: absolute;
						inset: auto 8px 6px;
						height: 3px;
						width: var(--percentage-width);
						max-width: calc(100% - 16px);
						transition: background 0.2s ease;
						border-radius: 4px;
						background:
							linear-gradient(
								90deg,
								rgba(255, 255, 255, 0) 0.46%,
								rgba(0, 0, 0, 0.9) 100.55%,
								rgba(255, 255, 255, 0) 163.59%
							),
							linear-gradient(270deg, #000aff 0%, #08e1ff 99.85%),
							linear-gradient(90deg, #f4ffea 0.01%, #ffeadc 53.45%, #d2eaff 99.99%),
							linear-gradient(
								90deg,
								rgba(255, 255, 255, 0) 0.46%,
								rgba(0, 0, 0, 0.9) 100.55%,
								rgba(255, 255, 255, 0) 163.59%
							),
							linear-gradient(90deg, rgba(210, 238, 210, 0.7) 0%, #d2eed2 100%);
						background-blend-mode: overlay, normal, normal, overlay, normal;
					}
					&--highlight {
						background: rgba(31, 150, 73, 0.04);
						box-shadow: 0 0 0 1px rgba(31, 150, 73, 0.12);
						&::after {
							background: linear-gradient(90deg, #1f9649 0%, #4ade80 100%);
						}
						.expande__percent {
							color: #1f9649;
						}
					}
				}
				.top {
					position: relative;
					display: grid;
					grid-template-columns: 32px 1fr 50px;
					z-index: 1;
					&__percent {
						text-align: left;
						white-space: nowrap;
						color: #1968e5;
						border-right: 1px solid #e1e8f1;
						padding-right: 12px;
						font-size: 12px;
						font-weight: 500;
						line-height: 16px;
					}
					&__inner {
						display: flex;
						align-items: center;
						gap: 3px;
						padding: 0 8px;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
						&-text {
							color: #6b6d80;
							font-size: 12px;
							font-weight: 500;
							line-height: 16px;
						}
					}
					&__sum {
						text-align: right;
						color: #303345;
						font-size: 12px;
						font-weight: 500;
						line-height: 16px;
					}
				}
			}
		}
	}
</style>
