<script setup lang="ts">
	import { UiButton, UiSelect, UiTabs, UiTabsItem, UiTag, UiTable, UiIcon } from "@dv.net/ui-kit/dist";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { computed, onMounted, ref } from "vue";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general";
	import { useExchangeAndCommissionsStore } from "@dv-admin/stores/exchangeAndCommissions";
	import { storeToRefs } from "pinia";
	import { formatAmountBlockchain } from "@shared/utils/helpers/general";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { RATE_SCALE_LIST } from "@dv-admin/utils/constants/exchangeRates";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import type { ExchangeSlugType } from "@dv-admin/utils/types/api/apiGo";
	import { exchangeLogoSmall } from "@dv-admin/utils/constants/exchange";

	const { t } = useI18n();

	const { currentSource, currenciesRate, isLoading, isLoadingRate } = storeToRefs(useExchangeAndCommissionsStore());
	const { user } = storeToRefs(useAuthStore());
	const { dictionary } = storeToRefs(useGeneralStore());
	const { activeExchange } = storeToRefs(useExchangeSettingsStore());
	const { getExchangeList } = useExchangeSettingsStore();
	const { getCurrenciesRate, putCurrenciesRate } = useExchangeAndCommissionsStore();

	const isOpen = ref(false);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "from", label: t("Currency pair") },
		{ name: "value", label: t("Real rate") },
		{ name: "value_scale", label: t("Exchange rate for users"), width: "320" },
		{ name: "updated_at", label: t("Last update") }
	]);

	const customSelectItems = ref([
		{ label: "Use the most profitable rate from all crypto exchanges (min)", value: "dv-min" },
		{ label: "Use the most profitable rate from all crypto exchanges (max)", value: "dv-max" },
		{ label: "Use rates from the active crypto exchange", value: "active" },
		{ label: "Use the average rate across all crypto exchanges", value: "dv-avg" }
	]);

	const activeExchanges = computed<IUiSelectOptions[]>(() => {
		if (!dictionary.value?.available_rate_sources?.length) return [];
		return dictionary.value.available_rate_sources
			.filter((el) => !el.includes("dv-"))
			.map((item) => ({ value: item, label: item }));
	});

	const activeExchangeCustomLabel = computed(
		() => customSelectItems.value.find((el) => el?.value === user.value?.rate_source)?.label
	);
	const activeExchangeLabel = computed(
		() =>
			[...customSelectItems.value, ...activeExchanges.value].find((el) => el.value === user.value?.rate_source)
				?.label || ""
	);

	const changeRateSourceHandler = (value: string) => {
		if (user.value) user.value.rate_source = value;
		isOpen.value = !isOpen.value;
	};

	onMounted(async () => {
		await Promise.all([getCurrenciesRate(), getExchangeList()]);

		const activeExchangeOptionIndex = customSelectItems.value.findIndex((el) => el.value === "active");

		if (activeExchange.value) customSelectItems.value[activeExchangeOptionIndex].value = activeExchange.value;
		else customSelectItems.value = customSelectItems.value.filter((el) => el.value !== "active");
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Settings')" back-name-route="settings" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Exchange rates") }}</h1>
		<block-section mode="grey-border">
			<p class="page__text">
				{{
					$t(
						"Here you select the exchange rate source and can set an adjustment. For example, by lowering the rate by a couple of percent, you can compensate for possible price fluctuations and partially cover the withdrawal fee"
					)
				}}.
			</p>
		</block-section>

		<block-section v-if="user" class="page__selects">
			<h2 class="global-title-h3">{{ $t("Exchange rates") }}</h2>
			<div class="page__selects-row">
				<div class="page__selects-inner">
					<ui-select
						v-model="user.rate_source"
						:options="customSelectItems"
						v-model:isOpen="isOpen"
						type="default"
						size="lg"
						:placeholder="$t('Preferred price source')"
						:teleport="false"
					>
						<template #selected>
							<span class="flex is-align-center gap-8">
								<component
									v-if="!activeExchangeCustomLabel"
									:is="exchangeLogoSmall[activeExchangeLabel as ExchangeSlugType]"
								/>
								{{ activeExchangeCustomLabel ? $t(activeExchangeLabel) : activeExchangeLabel }}
							</span>
						</template>
						<template #default="{ option }">{{ $t(option.label) }}</template>
						<template #footer>
							<div class="exchange-rates-custom-select__items">
								<div class="exchange-rates-custom-select__items-header">
									{{ $t("Use rates from a specific crypto exchange") }}
								</div>
								<button
									v-for="item in activeExchanges"
									:key="item.value"
									:class="{
										'exchange-rates-custom-select__item': true,
										'ui-select__option': true,
										'is-checked': item.value === user?.rate_source
									}"
									@click="changeRateSourceHandler(item.value)"
								>
									<span class="flex is-align-center gap-8">
										<component :is="exchangeLogoSmall[item.label as ExchangeSlugType]" />
										{{ item.label }}
									</span>
									<UiIcon v-if="item.value === user?.rate_source" color="#1968e5" type="400" name="done" />
								</button>
							</div>
						</template>
					</ui-select>

					<ui-select
						v-model="user.rate_scale"
						:options="RATE_SCALE_LIST"
						size="lg"
						type="default"
						:placeholder="`${$t('Adjust currencies to')} %`"
					>
						<template #selected="{ option }: any">
							<div class="flex gap-4">
								<span>{{ option?.label }}</span>
								<tooltip-helper
									class="page__selects__tooltip"
									:title="option?.label"
									:text="
										$t(
											'You can artificially lower the cryptocurrency rate by a few percent for the user to cover the fees for transfers and compensate for rate fluctuations.'
										)
									"
								/>
							</div>
						</template>
					</ui-select>
				</div>

				<ui-button
					mode="neutral"
					size="xxl"
					:loading="isLoadingRate"
					@click="putCurrenciesRate(user.rate_scale, user.rate_source)"
				>
					{{ $t("Save") }}
				</ui-button>
			</div>
		</block-section>

		<div v-if="dictionary?.available_rate_sources?.length" class="mb-16">
			<ui-tabs mode="light" v-model="currentSource" @update:model-value="getCurrenciesRate">
				<ui-tabs-item v-for="item in dictionary.available_rate_sources" :key="item" :value="item">
					{{ item.toUpperCase() }}
				</ui-tabs-item>
			</ui-tabs>
		</div>

		<ui-table :loading="isLoading" :headers="headers" :data="currenciesRate" table-layout="fixed">
			<template #header-cell="{ header, title }">
				{{ title }}
				<tooltip-helper
					v-if="header.name === 'value' || header.name === 'value_scale'"
					:title="title"
					:text="
						$t(
							header.name === 'value'
								? 'The cryptocurrency rate received in real time from the crypto exchange.'
								: 'The cryptocurrency rate at which transactions are made for your clients.'
						)
					"
				/>
			</template>
			<template #body-cell-from="{ row }"> {{ row.from }}/{{ row.to }}</template>
			<template #body-cell-value="{ row }">
				{{ formatAmountBlockchain(row.value) }}
			</template>
			<template #body-cell-value_scale="{ row }">
				{{ formatAmountBlockchain(row.value_scale) }}
			</template>
			<template #body-cell-updated_at="{ row }">
				<ui-tag v-if="row?.updated_at" mode="positive" :text="formatDate(row.updated_at)" />
				<span v-else>—</span>
			</template>
		</ui-table>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;

		&__text {
			color: $secondary;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			max-width: 920px;
			width: 100%;
		}

		&__selects {
			display: flex;
			flex-direction: column;
			gap: 16px;
			margin: 36px 0 20px;
			padding: 28px 24px 24px 24px;

			&-row {
				display: flex;
				align-items: center;
				gap: 12px;
			}

			&-inner {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 12px;
				flex-grow: 1;
			}

			&__tooltip {
				position: absolute;
				z-index: auto;
				left: 40px;
			}
		}

		:deep(.ui-select__footer) {
			display: flex;
			flex-direction: column;
			padding: 0;
			align-items: inherit;

			.exchange-rates-custom-select {
				&__items {
					background-color: #f7f9fb;

					> :not(:first-child) {
						min-height: 44px;
					}
				}

				&__item {
					display: flex;
					justify-content: flex-start;
					font-weight: 400;

					&.is-checked {
						background-color: #e3edfc;
					}

					&:hover {
						&:not(.is-checked) {
							background-color: darken(#f7f9fb, 2);
						}
					}
				}

				&__items-header {
					padding: 12px 16px 6px;
					color: #6b6d80;
					font-size: 12px;
					font-weight: 500;
					letter-spacing: 0.48px;
				}
			}
		}
	}
</style>
