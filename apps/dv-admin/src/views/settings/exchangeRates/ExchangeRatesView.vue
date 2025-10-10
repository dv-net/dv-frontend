<script setup lang="ts">
	import { UiButton, UiSelect, UiTabs, UiTabsItem, UiTag, UiTable } from "@dv.net/ui-kit/dist";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { computed, onMounted, ref } from "vue";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general";
	import { storeToRefs } from "pinia";
	import { formatAmountBlockchain } from "@shared/utils/helpers/general";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import type { ICurrenciesRateResponse } from "@dv-admin/utils/types/api/apiGo";
	import { getApiCurrenciesRate, putApiCurrenciesRate } from "@dv-admin/services/api/exchangeAndCommissions.ts";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";

	const { t } = useI18n();
	const { notify } = useNotifications()

	const { user } = storeToRefs(useAuthStore());
	const { dictionary } = storeToRefs(useGeneralStore());
	const { getExchangeList } = useExchangeSettingsStore();

	const isLoading = ref<boolean>(false);
	const isLoadingRate = ref<boolean>(false);
	const currentSource = ref<string>(user.value?.rate_source || "binance");
	const currentRateScale = ref<string | undefined>(user.value?.rate_scale);
	const currenciesRate = ref<ICurrenciesRateResponse[]>([]);

	const isDisabledSaveBtn = computed<boolean>(() => currentRateScale.value === user.value?.rate_scale);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "from", label: t("Currency pair") },
		{ name: "value", label: t("Real rate") },
		{ name: "value_scale", label: t("Exchange rate for users"), width: "320" },
		{ name: "updated_at", label: t("Last update") }
	]);

	const rateScaleList = computed<IUiSelectOptions[]>(() => {
		return [
			{ value: "0", label: t("Do not adjust") },
			{ value: "-0.5", label: "-0.5%" },
			{ value: "-1", label: "-1%" },
			{ value: "-2", label: "-2%" },
			{ value: "-3", label: "-3%" }
		];
	});

	const getCurrenciesRate = async () => {
		try {
			isLoading.value = true;
			const data = await getApiCurrenciesRate(currentSource.value);
			if (data) currenciesRate.value = data;
		} catch (error: any) {
			currenciesRate.value = [];
			console.error(error)
		} finally {
			isLoading.value = false;
		}
	};

	const putCurrenciesRate = async (rate_scale: string, rate_source: string) => {
		try {
			isLoadingRate.value = true;
			await putApiCurrenciesRate(rate_scale, rate_source);
			currentRateScale.value = rate_scale;
			await getCurrenciesRate();
			notify(t("Crypto exchange settings have been changed"), "success");
		} catch (error: any) {
			console.error(error)
		} finally {
			isLoadingRate.value = false;
		}
	};

	onMounted(async () => {
		await Promise.all([getCurrenciesRate(), getExchangeList()]);
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Settings')" back-name-route="settings" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Exchange rates") }}</h1>
		<block-section mode="grey-border" class="info" radius="md">
			<p class="info__text">
				{{
					$t(
						"In this section, you can view exchange rates and set a downward coefficient. We collect rates from all exchanges and select the most favorable one for you"
					)
				}}
			</p>
		</block-section>
		<div v-if="user" class="rates">
			<h2 class="global-title-h3">{{ $t("Rates") }}</h2>
			<div class="rates__inner">
				<ui-select
					v-model="user.rate_scale"
					:options="rateScaleList"
					size="lg"
					type="default"
				/>
				<ui-button
					mode="neutral"
					size="xxl"
					:loading="isLoadingRate"
					:disabled="isDisabledSaveBtn"
					@click="putCurrenciesRate(user.rate_scale, user.rate_source)"
				>
					{{ $t("Save") }}
				</ui-button>
			</div>
		</div>
		<div class="table">
			<div v-if="dictionary?.available_rate_sources?.length">
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
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		.info {
			padding: 12px 24px;
			width: max-content;
			&__text {
				color: $secondary;
				max-width: 800px;
				width: 100%;
				font-size: 16px;
				font-weight: 500;
				line-height: 20px;
			}
		}
		.rates {
			display: flex;
			flex-direction: column;
			gap: 12px;
			margin: 32px 0 44px;
			max-width: 533px;
			width: 100%;
			&__inner {
				display: flex;
				align-items: center;
				gap: 12px;
			}
		}
		.table {
			display: flex;
			flex-direction: column;
			gap: 16px;
		}
	}
</style>
