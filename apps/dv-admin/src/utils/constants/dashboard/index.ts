import { ref } from "vue";
import type { ITronTransferTypeList } from "@dv-admin/utils/types/schemas";

export const tronTransferTypeList = ref<ITronTransferTypeList[]>([
	{
		id: "burntrx",
		title: "Burn TRX",
		subtitle: "Simple option",
		description:
			"An easy way to start accepting USDT is to transfer them via TRX from hot wallets to cold ones. In this case, each transaction will cost about $1-2",
		iconNameSubtitle: "handshake",
		iconColor: "#1968e5"
	},
	{
		id: "cloud_delegate",
		title: "Delegate cloud from DV.net",
		subtitle: "Simple and profitable",
		description:
			"Transfers will be made using DaVinci Merchant resources, which is twice as profitable as simply burning TRX with each transaction",
		iconNameSubtitle: "paid",
		iconColor: "#e08b00"
	},
	{
		id: "resources",
		title: "Delegate",
		subtitle: "Most profitable",
		description:
			"There is not enough data to evaluate yet. Once you start using Merchant, we will be able to analyze payments and show statistics",
		iconNameSubtitle: "delegate-icon",
		iconColor: "#1f9649"
	}
]);

export const optionsChartTronInfo: any = {
	responsive: true,
	interaction: {
		mode: "index",
		intersect: false
	},
	scales: {
		y1: {
			type: "linear",
			display: true,
			position: "left",
			title: {
				display: true,
				text: "Count"
			},
			ticks: {
				beginAtZero: true
			}
		},
		y2: {
			type: "linear",
			display: true,
			position: "right",
			title: {
				display: true,
				text: "Energy"
			},
			ticks: {
				beginAtZero: true
			},
			grid: {
				drawOnChartArea: false
			}
		}
	}
};
