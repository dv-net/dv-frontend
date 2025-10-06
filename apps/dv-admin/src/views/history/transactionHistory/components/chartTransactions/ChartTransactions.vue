<script setup lang="ts">
	import { Line } from "vue-chartjs";
	import CrosshairPlugin from "chartjs-plugin-crosshair";
	import {
		CategoryScale,
		Chart as ChartJS,
		Filler,
		Legend,
		LinearScale,
		LineElement,
		PointElement,
		Title,
		Tooltip
	} from "chart.js";
	import { storeToRefs } from "pinia";
	import { useTransactionStore } from "@dv-admin/stores/history";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse.ts";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { UiCheckbox, UiSelect } from "@dv.net/ui-kit";
	import { computed } from "vue";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general.ts";
	import { getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import { optionsChartTransactions } from "@dv-admin/utils/constants/history";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import { useGeneralStore } from "@dv-admin/stores/general";

	ChartJS.register(
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		Title,
		Tooltip,
		Legend,
		Filler,
		CrosshairPlugin
	);

	const { isHideLowBalance, transactionsStats, filterTransactions } = storeToRefs(useTransactionStore());
	const { getTransaction, getTransactionStats } = useTransactionStore();
	const { dictionary } = storeToRefs(useGeneralStore());

	const options = computed<IUiSelectOptions[]>(() => {
		if (!dictionary.value?.available_currencies?.length) return [];
		return dictionary.value.available_currencies
			.map((item) => item.id)
			.map((item) => ({ label: `${getCurrentCoin(item)} (${getCurrentBlockchain(item)})`, value: item }));
	});

	const gradientChart = (ctx: any) => {
		const { chartArea, ctx: canvasCtx } = ctx.chart;
		if (!chartArea) {
			return "rgba(0, 95, 249, 0.2)";
		}
		const gradientFill = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
		gradientFill.addColorStop(0, "rgba(0, 95, 249, 0.3)");
		gradientFill.addColorStop(1, "rgba(0, 95, 249, 0)");
		return gradientFill;
	};

	const getNewDataTransactions = async () => {
		filterTransactions.value.page = 1;
		await Promise.all([getTransaction(), getTransactionStats()]);
	};

	const handleMouseEnter = () => {
		const tooltip = document.getElementById("chartjs-tooltip");
		if (tooltip) tooltip.style.display = "flex";
	};

	const handleMouseLeave = () => {
		const tooltip = document.getElementById("chartjs-tooltip");
		if (tooltip) tooltip.style.display = "none";
	};
</script>

<template>
	<block-section mode="grey-border" class="chart" @mouseleave="handleMouseLeave" @mouseenter="handleMouseEnter">
		<div class="chart__top">
			<ui-select
				class="chart__select"
				v-model="filterTransactions.currencies"
				:options="options"
				size="md"
				:placeholder="$t('Select currency')"
				clearable
				@change="getNewDataTransactions"
				@clear="getNewDataTransactions"
			>
				<template #selected>
					<blockchain-card
						v-if="filterTransactions.currencies"
						:type="filterTransactions.currencies as BlockchainType"
					/>
				</template>
				<template #default="{ option }">
					<blockchain-card :type="option.value as BlockchainType" />
				</template>
			</ui-select>
			<ui-checkbox size="sm" v-model="isHideLowBalance" @change="getNewDataTransactions">
				{{ $t("Hide low balance transactions") }}
			</ui-checkbox>
		</div>
		<Line
			id="chart"
			ref="chartRef"
			:height="300"
			:data="{
				labels: transactionsStats.map((item) =>
					filterTransactions.resolution === 'day'
						? formatDate(item.date, undefined, 'UTC').split(', ')[0]
						: formatDate(item.date, undefined, 'UTC')
				),
				datasets: [
					{
						label: '',
						data: transactionsStats.map((item) => parseFloat(item.amount_usd)),
						fill: true,
						borderColor: '#005ff9',
						backgroundColor: gradientChart,
						tension: 0.1,
						pointRadius: 2,
						borderWidth: 1
					}
				]
			}"
			:options="optionsChartTransactions"
		/>
	</block-section>
</template>

<style scoped lang="scss">
	.chart {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin-bottom: 24px;

		&__top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
		}

		&__select {
			width: 250px;
		}
	}
</style>
