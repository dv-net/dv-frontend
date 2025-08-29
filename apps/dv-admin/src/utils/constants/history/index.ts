import { formatDollars } from "@shared/utils/helpers/general";
import type { ITransactionRequest } from "@dv-admin/utils/types/api/apiGo.ts";
import { getLastDaysRange } from "@dv-admin/utils/helpers/dateParse.ts";
import i18n from "@dv-admin/utils/plugins/i18n";

export const filterTransactionsStartData: ITransactionRequest = {
	page: 1,
	type: "deposit",
	page_size: 100,
	min_amount_usd: "1",
	date_to: getLastDaysRange().dateToWithTime,
	date_from: getLastDaysRange().dateFromWithTime,
	currencies: null,
	resolution: "day",
	sort_by: null,
	sort_direction: null
};

export const TRANSACTIONS_TYPES = {
	USER_REPLENISHMENTS: "user-replenishments",
	WITHDRAWALS_FROM_HOT: "withdrawals-from-hot",
	EXCHANGES_ON_THE_EXCHANGE: "exchanges-on-the-exchange",
	WITHDRAWALS_FROM_THE_EXCHANGE: "withdrawals-from-the-exchange"
} as const;

export type ENUM_TRANSACTIONS_TYPES = (typeof TRANSACTIONS_TYPES)[keyof typeof TRANSACTIONS_TYPES];

export const TRANSACTIONS_TYPES_ARRAY: ENUM_TRANSACTIONS_TYPES[] = [
	TRANSACTIONS_TYPES.USER_REPLENISHMENTS,
	TRANSACTIONS_TYPES.WITHDRAWALS_FROM_HOT,
	TRANSACTIONS_TYPES.EXCHANGES_ON_THE_EXCHANGE,
	TRANSACTIONS_TYPES.WITHDRAWALS_FROM_THE_EXCHANGE
];

export const tabsClearQuery: ENUM_TRANSACTIONS_TYPES[] = [
	TRANSACTIONS_TYPES.WITHDRAWALS_FROM_THE_EXCHANGE,
	TRANSACTIONS_TYPES.EXCHANGES_ON_THE_EXCHANGE
];

export const optionsChartTransactions: any = {
	responsive: true,
	animations: {
		tension: {
			duration: 2000,
			easing: "linear",
			from: 1,
			to: 0,
			loop: true
		}
	},
	interaction: {
		mode: "index",
		intersect: false
	},
	plugins: {
		legend: { display: false },
		title: { display: false },
		tooltip: {
			enabled: false,
			mode: "index",
			intersect: false,
			external: (context: any) => {
				const tooltipModel = context.tooltip;

				let tooltipEl: HTMLElement | null = document.getElementById("chartjs-tooltip");
				if (!tooltipEl) {
					tooltipEl = document.createElement("div");
					tooltipEl.id = "chartjs-tooltip";
					tooltipEl.className = "chartjs-tooltip";
					document.body.appendChild(tooltipEl);
				}
				if (tooltipModel.opacity === 0 || !tooltipModel.dataPoints?.length) {
					tooltipEl.style.opacity = "0";
					return;
				}
				const point = tooltipModel.dataPoints[0];
				const price = point.dataset.data[point.dataIndex];
				tooltipEl.innerHTML = `
					<div class="chartjs-tooltip__top">${point.label}</div>
					<div class="chartjs-tooltip__content">
						<span class="chartjs-tooltip__label">${i18n.global.t("Income")}</span>
						<span class="chartjs-tooltip__price">${formatDollars(price, "$", "", 2)}</span>
					</div>
    		`;
				const canvas = context.chart.canvas;
				const canvasRect = canvas.getBoundingClientRect();
				const scrollY = window.scrollY;
				const scrollX = window.scrollX;
				requestAnimationFrame(() => {
					if (tooltipEl) {
						const tooltipWidth = tooltipEl?.offsetWidth;
						tooltipEl.style.opacity = "1";
						tooltipEl.style.left = `${canvasRect.left + scrollX + tooltipModel.caretX - tooltipWidth / 2}px`;
						tooltipEl.style.top = `${canvasRect.top + scrollY + tooltipModel.caretY + 10}px`;
					}
				});
			}
		},
		crosshair: {
			line: {
				color: "#737477",
				width: 1,
				zIndex: 0
			},
			sync: {
				enabled: true,
				group: 1,
				suppressTooltips: false
			},
			zoom: {
				enabled: true,
				zoomboxBackgroundColor: "rgba(66,133,244,0.2)",
				zoomboxBorderColor: "#48F",
				zoomButtonText: "Reset Zoom",
				zoomButtonClass: "reset-zoom"
			},
			snap: {
				enabled: true
			}
		}
	},
	scales: {
		x: {
			ticks: {
				padding: 15,
				align: "center",
				autoSkip: true,
				maxTicksLimit: 5,
				maxRotation: 0,
				minRotation: 0,
				color: "#C0C2C8",
				font: {
					size: 12
				}
			},
			grid: {
				color: "#EDEDED"
			},
			border: {
				color: "#EDEDED"
			}
		},
		y: {
			ticks: {
				callback: (value: number) => {
					if (value === 0) return "";
					return parseFloat(formatDollars(value, "", "", 2, 2, false)) + "$";
				},
				color: "#C0C2C8",
				font: {
					size: 12
				}
			},
			grid: {
				color: "#EDEDED"
			},
			border: {
				color: "#EDEDED"
			}
		}
	}
};
