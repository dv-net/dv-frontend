<script setup lang="ts">
	import { Line } from "vue-chartjs";
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
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { optionsChartTronInfo } from "@dv-admin/utils/constants/dashboard";
	import { computed } from "vue";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { storeToRefs } from "pinia";
	import dayjs from "dayjs";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse.ts";

	ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

	const { tronResourceExpenses, depositTronSummary } = storeToRefs(useDashboardStore());

	const chartAllData = computed<{ labels: any[]; datasets: any[] }>(() => {
		if (!tronResourceExpenses.value || !depositTronSummary.value.length) {
			return { labels: [], datasets: [] };
		}
		const dateTronResourceExpenses = Object.keys(tronResourceExpenses.value);
		const dateDepositSummary = depositTronSummary.value.map((item) => item.date);
		const uniqueDates = [...new Set([...dateTronResourceExpenses, ...dateDepositSummary])].sort(
			(a, b) => dayjs(a).unix() - dayjs(b).unix()
		);
		const labels: string[] = uniqueDates.map((item) => formatDate(item).split(" ")[0]);

		const line1 = uniqueDates.map((item: string) => {
			const match = depositTronSummary.value.find((entry) => entry.date.startsWith(item));
			return match ? match.transactions_count : 0;
		});
		const line2 = uniqueDates.map((item: string) => {
			const delegatedEnergy =
				tronResourceExpenses.value && tronResourceExpenses.value[item]?.delegated_energy
					? Number(tronResourceExpenses.value[item]?.delegated_energy)
					: 0;
			const stakedEnergy =
				tronResourceExpenses.value && tronResourceExpenses.value[item]?.staked_energy
					? Number(tronResourceExpenses.value[item]?.staked_energy)
					: 0;
			return delegatedEnergy + stakedEnergy;
		});
		const line3 = uniqueDates.map((item: string) => {
			return tronResourceExpenses.value && tronResourceExpenses.value[item]?.available_energy
				? Number(tronResourceExpenses.value[item]?.available_energy)
				: 0;
		});
		const line4 = uniqueDates.map((item: string) => {
			return tronResourceExpenses.value && tronResourceExpenses.value[item]?.transfer_count
				? Number(tronResourceExpenses.value[item]?.transfer_count)
				: 0;
		});

		return {
			labels,
			datasets: [
				{
					label: "Deposits",
					data: line1,
					borderColor: "#005ff9",
					backgroundColor: "transparent",
					tension: 0.1,
					pointRadius: 2,
					borderWidth: 1,
					yAxisID: "y1"
				},
				{
					label: "Total energy",
					data: line2,
					borderColor: "#50E3C2",
					backgroundColor: "transparent",
					tension: 0.1,
					pointRadius: 2,
					borderWidth: 1,
					yAxisID: "y2"
				},
				{
					label: "Available energy",
					data: line3,
					borderColor: "#F5A623",
					backgroundColor: "transparent",
					tension: 0.1,
					pointRadius: 2,
					borderWidth: 1,
					yAxisID: "y2"
				},
				{
					label: "Transfer count",
					data: line4,
					borderColor: "#D0021B",
					backgroundColor: "transparent",
					tension: 0.1,
					pointRadius: 2,
					borderWidth: 1,
					yAxisID: "y1"
				}
			]
		};
	});
</script>

<template>
	<block-section mode="grey-border" class="chart">
		<Line
			id="chartTronInfo"
			ref="chartRefTronInfo"
			:data="{
				labels: chartAllData.labels,
				datasets: chartAllData.datasets
			}"
			:options="optionsChartTronInfo"
		/>
	</block-section>
</template>

<style scoped lang="scss">
	.chart {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
</style>
