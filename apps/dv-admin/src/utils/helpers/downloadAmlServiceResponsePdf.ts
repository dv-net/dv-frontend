import { jsPDF } from "jspdf";
import logoUrl from "@dv-admin/assets/images/aml/dv-logo.png";
import {
	formatAmountBlockchain,
	formatDollars,
	getCurrentBlockchain,
	getCurrentCoin
} from "@shared/utils/helpers/general";
import type {
	IAmlBotCheckData,
	IAmlBotResponse,
	IAmlBotSignals,
	IAmlExposureGroup,
	IAmlReportContext,
	ICoinKytDiscreteItem,
	ICoinKytReport
} from "@dv-admin/utils/types/schemas";

type RGB = [number, number, number];

const TEXT: RGB = [48, 51, 69];
const MUTED: RGB = [107, 109, 128];
const LINE: RGB = [225, 232, 241];
const GRADE_INK: Record<string, RGB> = {
	high: [196, 78, 88],
	severe: [164, 54, 78],
	moderate: [184, 122, 32],
	low: [46, 132, 96],
	undefined: [120, 126, 140]
};
const GRADE_WASH: Record<string, RGB> = {
	high: [252, 236, 237],
	severe: [250, 232, 236],
	moderate: [255, 244, 224],
	low: [232, 245, 238],
	undefined: [241, 242, 245]
};
const GRADE_ORDER = ["high", "severe", "moderate", "low", "undefined"];

const RISK_LABEL: Record<string, string> = {
	none: "None",
	low: "Low",
	medium: "Medium",
	moderate: "Moderate",
	high: "High",
	severe: "Severe",
	critical: "Critical",
	undefined: "Not determined"
};

const AML_BOT_SIGNAL_LABEL: Record<string, string> = {
	merchant_services: "Merchant services",
	exchange: "Exchange",
	wallet: "Wallet",
	miner: "Miner",
	payment: "Payment",
	marketplace: "Marketplace",
	p2p_exchange: "P2P exchange",
	seized_assets: "Seized assets",
	other: "Other",
	unnamed_entity_low_risk: "Unnamed entity (low risk)",
	infrastructure_as_a_service: "Infrastructure as a service",
	decentralized_exchange_contract: "Decentralized exchange contract",
	unnamed_service: "Unnamed service",
	atm: "ATM",
	risky_exchange: "Risky exchange",
	p2p_exchange_mlrisk_high: "P2P exchange, high ML risk",
	liquidity_pools: "Liquidity pools",
	unnamed_entity_medium_risk: "Unnamed entity (medium risk)",
	enforcement_action: "Enforcement action",
	ransom: "Ransom",
	dark_market: "Dark market",
	dark_service: "Dark service",
	illegal_service: "Illegal service",
	mixer: "Mixer",
	scam: "Scam",
	gambling: "Gambling",
	stolen_coins: "Stolen coins",
	exchange_fraudulent: "Fraudulent exchange",
	child_exploitation: "Child exploitation",
	sanctions: "Sanctions",
	terrorism_financing: "Terrorism financing",
	malware: "Malware",
	unnamed_entity_high_risk: "Unnamed entity (high risk)"
};

const AML_BOT_LOW = [
	"merchant_services",
	"exchange",
	"wallet",
	"miner",
	"payment",
	"marketplace",
	"p2p_exchange",
	"seized_assets",
	"other",
	"unnamed_entity_low_risk"
];
const AML_BOT_MODERATE = [
	"infrastructure_as_a_service",
	"decentralized_exchange_contract",
	"unnamed_service",
	"atm",
	"risky_exchange",
	"p2p_exchange_mlrisk_high",
	"liquidity_pools",
	"unnamed_entity_medium_risk"
];
const AML_BOT_HIGH = [
	"enforcement_action",
	"ransom",
	"dark_market",
	"dark_service",
	"illegal_service",
	"mixer",
	"scam",
	"gambling",
	"stolen_coins",
	"exchange_fraudulent",
	"child_exploitation",
	"sanctions",
	"terrorism_financing",
	"malware",
	"unnamed_entity_high_risk"
];

const signalGrade = (category: string): string => {
	if (AML_BOT_HIGH.includes(category)) return "high";
	if (AML_BOT_MODERATE.includes(category)) return "moderate";
	if (AML_BOT_LOW.includes(category)) return "low";
	return "undefined";
};

const signalLabel = (category: string): string =>
	AML_BOT_SIGNAL_LABEL[category] ??
	category
		.split("_")
		.map((word) => (word.length <= 3 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
		.join(" ");

const normalizeGrade = (level: string): string => {
	const value = level.toLowerCase();
	if (value === "medium") return "moderate";
	if (value === "critical") return "severe";
	if (value === "none") return "low";
	return value in GRADE_INK ? value : "undefined";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const parseResponse = (raw: string): unknown => {
	try {
		const value: unknown = JSON.parse(raw);
		return typeof value === "string" ? JSON.parse(value) : value;
	} catch {
		return null;
	}
};

const isCoinKytReport = (value: unknown): value is ICoinKytReport =>
	isRecord(value) &&
	"risk_score" in value &&
	("risk_score_grade" in value || "discrete" in value || "indirects" in value || "from_entity" in value);

const toPercent = (value: string | number | undefined | null): number | null => {
	if (value == null || value === "") return null;
	const number = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(number)) return null;
	return Math.abs(number) <= 1 ? number * 100 : number;
};

const formatPercent = (value: number): string => `${value.toFixed(2).replace(/\.?0+$/, "")}%`;

const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const riskLabel = (level: string): string => RISK_LABEL[level.toLowerCase()] ?? titleCase(level);

const gradeColor = (grade: string): RGB => GRADE_INK[grade] ?? GRADE_INK.undefined;

const gradeWash = (grade: string): RGB => GRADE_WASH[grade] ?? GRADE_WASH.undefined;

const formatGeneratedAt = (iso?: string): string => {
	const date = iso ? new Date(iso) : new Date();
	if (Number.isNaN(date.getTime())) return "";
	const pad = (part: number) => String(part).padStart(2, "0");
	return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
};

const assetLabel = (report: ICoinKytReport): string => {
	const token = report.token?.trim();
	if (token && token.length <= 10 && !token.startsWith("0x")) return token.toUpperCase();
	return (report.blockchain || "").toUpperCase();
};

const withAsset = (amount: string, report: ICoinKytReport): string => {
	const asset = assetLabel(report);
	return asset ? `${amount} ${asset}` : amount;
};

const formatAmount = (raw: string | undefined, report: ICoinKytReport): string => {
	const amount = formatAmountBlockchain(raw, { errorValue: "" });
	if (!amount) return "-";
	return withAsset(amount, report);
};

const readScalar = (value: unknown): string => {
	if (typeof value === "string" && value.trim()) return value.trim();
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	return "";
};

const readOwner = (report: ICoinKytReport): string => {
	if (typeof report.owner === "string") return report.owner.trim();
	if (isRecord(report.owner)) return readScalar(report.owner.name) || readScalar(report.owner.type_label);
	return "";
};

const groupExposure = (
	items: ICoinKytDiscreteItem[] | undefined,
	coefKey: "received_count_coef" | "sent_count_coef"
): IAmlExposureGroup[] => {
	const groups = new Map<string, IAmlExposureGroup>();

	for (const item of items ?? []) {
		const percent = toPercent(item[coefKey]);
		if (percent == null || percent <= 0) continue;
		const grade = (item.risk_score_grade || "undefined").toLowerCase();
		const group: IAmlExposureGroup = groups.get(grade) ?? { grade, percent: 0, rows: [] };
		group.percent += percent;
		group.rows.push({ label: item.type_label || item.type || "Undefined", percent });
		groups.set(grade, group);
	}

	return [...groups.values()]
		.map((group) => ({ ...group, rows: group.rows.sort((a, b) => b.percent - a.percent) }))
		.sort((a, b) => {
			const left = GRADE_ORDER.indexOf(a.grade);
			const right = GRADE_ORDER.indexOf(b.grade);
			return (left === -1 ? GRADE_ORDER.length : left) - (right === -1 ? GRADE_ORDER.length : right);
		});
};

class AmlReportPdf {
	private readonly doc = new jsPDF({ unit: "pt", format: "a4" });
	private readonly pageWidth = this.doc.internal.pageSize.getWidth();
	private readonly pageHeight = this.doc.internal.pageSize.getHeight();
	private readonly margin = 40;
	private readonly contentBottom = this.pageHeight - 68;
	private readonly report: ICoinKytReport;
	private readonly logo: HTMLImageElement;
	private y = 0;
	private started = false;

	constructor(report: ICoinKytReport, logo: HTMLImageElement) {
		this.report = report;
		this.logo = logo;
	}

	save(fileName: string) {
		this.addPage();
		this.drawSummary();
		this.drawExposure("Received", this.report.discrete?.received, "received_count_coef");
		this.drawExposure("Sent", this.report.discrete?.sent, "sent_count_coef");
		this.drawIndirects();
		this.drawDirects();
		this.drawAlerts();
		this.drawFooters();
		this.doc.setProperties({
			title: `AML report ${this.report.id || ""}`.trim(),
			creator: "DV.net"
		});
		this.doc.save(fileName);
	}

	private addPage() {
		if (this.started) this.doc.addPage();
		this.started = true;
		this.drawHeader();
		this.y = 86;
	}

	private ensure(height: number) {
		if (this.y + height > this.contentBottom) this.addPage();
	}

	private drawHeader() {
		const generatedAt = formatGeneratedAt(this.report.timestamp);
		this.doc.addImage(this.logo, "PNG", this.margin, 18, 124, 36);

		this.doc.setFont("helvetica", "bold");
		this.doc.setFontSize(8);
		this.doc.setTextColor(...MUTED);
		this.doc.text("AML REPORT", this.pageWidth - this.margin, 28, { align: "right" });
		this.doc.setFont("helvetica", "normal");
		this.doc.setTextColor(...TEXT);
		this.doc.text(this.report.id || "-", this.pageWidth - this.margin, 40, { align: "right" });
		if (generatedAt) {
			this.doc.setTextColor(...MUTED);
			this.doc.text(generatedAt, this.pageWidth - this.margin, 52, { align: "right" });
		}

		this.doc.setDrawColor(...LINE);
		this.doc.setLineWidth(0.8);
		this.doc.line(this.margin, 66, this.pageWidth - this.margin, 66);
	}

	private drawFooters() {
		const total = this.doc.getNumberOfPages();
		for (let page = 1; page <= total; page += 1) {
			this.doc.setPage(page);
			const ruleY = this.pageHeight - 36;
			this.doc.setDrawColor(...LINE);
			this.doc.setLineWidth(0.8);
			this.doc.line(this.margin, ruleY, this.pageWidth - this.margin, ruleY);
			this.doc.setFont("helvetica", "normal");
			this.doc.setFontSize(8);
			this.doc.setTextColor(...MUTED);
			this.doc.text(`Page ${page} of ${total}`, this.pageWidth / 2, ruleY + 14, { align: "center" });
		}
	}

	private drawSummary() {
		const blockchain = (this.report.blockchain || "").toUpperCase();
		const address = this.report.address || "Undefined";
		const score = toPercent(this.report.risk_score);
		const grade = (this.report.risk_score_grade || "undefined").toLowerCase();
		const owner = readOwner(this.report);
		const typeLabel =
			typeof this.report.owner !== "string" && isRecord(this.report.owner)
				? readScalar(this.report.owner.type_label)
				: "";
		const balance = readScalar(this.report.balance);
		const received = readScalar(this.report.received);
		const sent = readScalar(this.report.sent);
		const meta = [
			this.report.inputs != null ? `Inputs  ${this.report.inputs}` : "",
			this.report.outputs != null ? `Outputs  ${this.report.outputs}` : "",
			this.report.block_number != null ? `Block  ${this.report.block_number}` : ""
		].filter(Boolean);

		const extraCount = [owner, typeLabel, balance, received, sent].filter(Boolean).length;
		const cardHeight = 16 + 22 + (score == null ? 0 : 24) + extraCount * 20 + (meta.length ? 22 : 0) + 8;
		this.ensure(cardHeight);
		const width = this.pageWidth - this.margin * 2;
		this.doc.setFillColor(247, 249, 251);
		this.doc.roundedRect(this.margin, this.y, width, cardHeight, 12, 12, "F");

		const labelX = this.margin + 16;
		const valueX = this.margin + 128;
		let cursor = this.y + 16;

		this.doc.setFont("helvetica", "normal");
		this.doc.setFontSize(10);
		this.doc.setTextColor(...MUTED);
		this.doc.text(blockchain ? `${blockchain} address` : "Address", labelX, cursor + 11);
		this.doc.setFont("helvetica", "bold");
		this.doc.setTextColor(...TEXT);
		const addressLines = this.doc.splitTextToSize(address, width - 144) as string[];
		this.doc.text(addressLines[0] || address, valueX, cursor + 11);
		cursor += 22;

		if (score != null) {
			this.doc.setFont("helvetica", "normal");
			this.doc.setFontSize(10);
			this.doc.setTextColor(...MUTED);
			this.doc.text("Risk score", labelX, cursor + 12);
			const pill = `${formatPercent(score)}   ${titleCase(grade)}`;
			this.doc.setFont("helvetica", "bold");
			this.doc.setFontSize(10);
			const pillWidth = this.doc.getTextWidth(pill) + 18;
			this.doc.setFillColor(...gradeWash(grade));
			this.doc.roundedRect(valueX, cursor + 1, pillWidth, 18, 9, 9, "F");
			this.doc.setTextColor(...gradeColor(grade));
			this.doc.text(pill, valueX + 9, cursor + 13);
			cursor += 24;
		}

		const extras: Array<[string, string]> = [];
		if (owner) extras.push(["Owner", owner]);
		if (typeLabel) extras.push(["Type", typeLabel]);
		if (balance) extras.push(["Balance", withAsset(balance, this.report)]);
		if (received) extras.push(["Received", withAsset(received, this.report)]);
		if (sent) extras.push(["Sent", withAsset(sent, this.report)]);
		for (const [label, value] of extras) {
			this.doc.setFont("helvetica", "normal");
			this.doc.setFontSize(10);
			this.doc.setTextColor(...MUTED);
			this.doc.text(label, labelX, cursor + 11);
			this.doc.setFont("helvetica", "bold");
			this.doc.setTextColor(...TEXT);
			this.doc.text(value, valueX, cursor + 11);
			cursor += 20;
		}

		if (meta.length) {
			this.doc.setFont("helvetica", "normal");
			this.doc.setFontSize(10);
			this.doc.setTextColor(...MUTED);
			this.doc.text(meta.join("      "), labelX, cursor + 11);
		}

		this.y += cardHeight + 8;
	}

	private drawSectionTitle(title: string) {
		this.ensure(26);
		this.y += 8;
		this.doc.setFont("helvetica", "bold");
		this.doc.setFontSize(12);
		this.doc.setTextColor(...TEXT);
		this.doc.text(title, this.margin, this.y + 12);
		this.y += 22;
	}

	private drawExposure(
		title: string,
		items: ICoinKytDiscreteItem[] | undefined,
		coefKey: "received_count_coef" | "sent_count_coef"
	) {
		const groups = groupExposure(items, coefKey);
		if (!groups.length) return;

		this.drawSectionTitle(title);
		const width = this.pageWidth - this.margin * 2;

		for (const group of groups) {
			this.ensure(22);
			this.doc.setFillColor(...gradeWash(group.grade));
			this.doc.roundedRect(this.margin, this.y, width, 18, 3, 3, "F");
			this.doc.setFont("helvetica", "bold");
			this.doc.setFontSize(9);
			this.doc.setTextColor(...gradeColor(group.grade));
			this.doc.text(titleCase(group.grade), this.margin + 8, this.y + 12);
			this.doc.text(formatPercent(group.percent), this.pageWidth - this.margin - 8, this.y + 12, { align: "right" });
			this.y += 26;

			for (const row of group.rows) {
				this.ensure(16);
				this.doc.setFillColor(...gradeColor(group.grade));
				this.doc.roundedRect(this.margin, this.y + 1, 8, 8, 1.5, 1.5, "F");
				this.doc.setFont("helvetica", "normal");
				this.doc.setFontSize(10);
				this.doc.setTextColor(...TEXT);
				const label = (this.doc.splitTextToSize(row.label, width - 90) as string[])[0] || row.label;
				this.doc.text(label, this.margin + 16, this.y + 9);
				this.doc.setFont("helvetica", "bold");
				this.doc.setTextColor(...gradeColor(group.grade));
				this.doc.text(formatPercent(row.percent), this.pageWidth - this.margin, this.y + 9, { align: "right" });
				this.y += 16;
			}

			this.y += 6;
		}
	}

	private drawTable(
		title: string,
		columns: Array<{ title: string; width: number; align?: "left" | "right"; risk?: boolean }>,
		rows: string[][]
	) {
		if (!rows.length) return;
		this.drawSectionTitle(title);
		const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
		const drawHead = () => {
			this.ensure(24);
			this.doc.setFillColor(236, 241, 247);
			this.doc.roundedRect(this.margin, this.y, tableWidth, 22, 6, 6, "F");
			this.doc.setFont("helvetica", "bold");
			this.doc.setFontSize(8);
			this.doc.setTextColor(...MUTED);
			let x = this.margin;
			columns.forEach((column) => {
				const textX = column.align === "right" ? x + column.width - 10 : x + 10;
				this.doc.text(column.title.toUpperCase(), textX, this.y + 14, {
					align: column.align === "right" ? "right" : "left"
				});
				x += column.width;
			});
			this.y += 22;
		};

		drawHead();
		rows.forEach((row, rowIndex) => {
			if (this.y + 22 > this.contentBottom) {
				this.addPage();
				drawHead();
			}
			if (rowIndex % 2 === 1) {
				this.doc.setFillColor(250, 251, 253);
				this.doc.rect(this.margin, this.y, tableWidth, 22, "F");
			}
			let x = this.margin;
			row.forEach((cell, index) => {
				const column = columns[index];
				const textX = column.align === "right" ? x + column.width - 10 : x + 10;
				if (column.risk) {
					const grade = cell.toLowerCase();
					const color = gradeColor(grade);
					this.doc.setFillColor(...color);
					this.doc.circle(x + 14, this.y + 11, 3, "F");
					this.doc.setFont("helvetica", "bold");
					this.doc.setFontSize(9);
					this.doc.setTextColor(...(grade === "undefined" ? MUTED : color));
					this.doc.text(cell, x + 22, this.y + 14);
				} else {
					this.doc.setFont("helvetica", "normal");
					this.doc.setFontSize(10);
					this.doc.setTextColor(...TEXT);
					const lines = this.doc.splitTextToSize(cell || "-", column.width - 16) as string[];
					this.doc.text(lines[0] || "-", textX, this.y + 14, { align: column.align === "right" ? "right" : "left" });
				}
				x += column.width;
			});
			this.y += 22;
		});
	}

	private drawIndirects() {
		const rows = (this.report.indirects ?? [])
			.map((item) => ({ item, percent: toPercent(item.total_count_coef) ?? 0 }))
			.filter((row) => row.percent >= 0.005)
			.sort((a, b) => b.percent - a.percent)
			.map((row) => [
				row.item.type_label || row.item.type || "Undefined",
				titleCase(row.item.risk_score_grade || "undefined"),
				formatPercent(row.percent),
				formatAmount(row.item.total, this.report)
			]);
		const width = this.pageWidth - this.margin * 2;
		this.drawTable(
			"Indirects",
			[
				{ title: "Type", width: width - 292 },
				{ title: "Risk", width: 100, risk: true },
				{ title: "Share", width: 72, align: "right" },
				{ title: "Amount", width: 120, align: "right" }
			],
			rows
		);
		if (this.report.too_many_indirects) {
			this.ensure(16);
			this.doc.setFont("helvetica", "normal");
			this.doc.setFontSize(9);
			this.doc.setTextColor(...MUTED);
			this.doc.text("Indirect exposure is truncated.", this.margin, this.y + 12);
			this.y += 16;
		}
	}

	private drawDirects() {
		const rows = [
			...(this.report.from_entity ?? []).map((entity) => [
				"From",
				entity.name || "Undefined",
				entity.type_label || entity.type || "-"
			]),
			...(this.report.to_entity ?? []).map((entity) => [
				"To",
				entity.name || "Undefined",
				entity.type_label || entity.type || "-"
			])
		];
		const width = this.pageWidth - this.margin * 2;
		this.drawTable(
			"Directs",
			[
				{ title: "Direction", width: 90 },
				{ title: "Owner", width: width - 280 },
				{ title: "Type", width: 190 }
			],
			rows
		);
	}

	private drawAlerts() {
		const rows = (this.report.alerts ?? []).map((alert) => [
			titleCase(alert.risk_grade || "undefined"),
			alert.risk_profile || "-",
			alert.address || "-"
		]);
		const width = this.pageWidth - this.margin * 2;
		this.drawTable(
			"Alerts",
			[
				{ title: "Risk", width: 90, risk: true },
				{ title: "Profile", width: 140 },
				{ title: "Address", width: width - 230 }
			],
			rows
		);
	}
}

const readPayloadField = (payload: Record<string, unknown>, key: string): string => {
	const value = payload[key];
	if (Array.isArray(value)) return readScalar(value[0]);
	return readScalar(value);
};

const readProviderMessage = (value: unknown): string => {
	if (!isRecord(value)) return "";
	const direct = readScalar(value.detail) || readScalar(value.message) || readScalar(value.error);
	if (direct) return direct;
	return value.result === false ? readScalar(value.description) : "";
};

const isAmlBotReport = (value: unknown): value is IAmlBotResponse => {
	if (!isRecord(value) || !isRecord(value.data)) return false;
	const data = value.data;
	return (
		isRecord(data.signals) ||
		"riskscore" in data ||
		"hasHighRisk" in data ||
		data.flow === "advanced" ||
		data.flow === "advanced_limited"
	);
};

const groupBotSignals = (signals: IAmlBotSignals | undefined): IAmlExposureGroup[] => {
	const groups = new Map<string, IAmlExposureGroup>();

	for (const [category, share] of Object.entries(signals ?? {})) {
		const percent = toPercent(share);
		if (percent == null || percent <= 0) continue;
		const grade = signalGrade(category);
		const group: IAmlExposureGroup = groups.get(grade) ?? { grade, percent: 0, rows: [] };
		group.percent += percent;
		group.rows.push({ label: signalLabel(category), percent });
		groups.set(grade, group);
	}

	return [...groups.values()]
		.map((group) => ({ ...group, rows: group.rows.sort((a, b) => b.percent - a.percent) }))
		.sort((a, b) => {
			const left = GRADE_ORDER.indexOf(a.grade);
			const right = GRADE_ORDER.indexOf(b.grade);
			return (left === -1 ? GRADE_ORDER.length : left) - (right === -1 ? GRADE_ORDER.length : right);
		});
};

const formatScorePercent = (value: number): string => `${Math.ceil(value)}%`;

class AmlBotReportPdf {
	private readonly doc = new jsPDF({ unit: "pt", format: "a4" });
	private readonly pageWidth = this.doc.internal.pageSize.getWidth();
	private readonly pageHeight = this.doc.internal.pageSize.getHeight();
	private readonly margin = 40;
	private readonly contentBottom = this.pageHeight - 68;
	private readonly data: IAmlBotCheckData;
	private readonly context: IAmlReportContext;
	private readonly logo: HTMLImageElement;
	private y = 0;
	private started = false;

	constructor(response: IAmlBotResponse, logo: HTMLImageElement, context: IAmlReportContext = {}) {
		this.data = response.data ?? {};
		this.logo = logo;
		this.context = context;
	}

	save(fileName: string) {
		this.addPage();
		this.drawSummary();
		this.drawSignalSection("Signals", groupBotSignals(this.data.signals), true);
		this.drawSignalSection("Counterparty received", groupBotSignals(this.data.counterparty?.signals?.in), false);
		this.drawSignalSection("Counterparty sent", groupBotSignals(this.data.counterparty?.signals?.out), false);
		this.drawFooters();
		this.doc.setProperties({
			title: `AML report ${this.context.id || ""}`.trim(),
			creator: "DV.net"
		});
		this.doc.save(fileName);
	}

	private addPage() {
		if (this.started) this.doc.addPage();
		this.started = true;
		this.drawHeader();
		this.y = 86;
	}

	private ensure(height: number) {
		if (this.y + height > this.contentBottom) this.addPage();
	}

	private drawHeader() {
		const generatedAt = formatGeneratedAt(this.context.createdAt || undefined);
		this.doc.addImage(this.logo, "PNG", this.margin, 18, 124, 36);
		this.doc.setFont("helvetica", "bold");
		this.doc.setFontSize(8);
		this.doc.setTextColor(...MUTED);
		this.doc.text("AML REPORT", this.pageWidth - this.margin, 28, { align: "right" });
		this.doc.setFont("helvetica", "normal");
		this.doc.setTextColor(...TEXT);
		this.doc.text(this.context.id || "-", this.pageWidth - this.margin, 40, { align: "right" });
		if (generatedAt) {
			this.doc.setTextColor(...MUTED);
			this.doc.text(generatedAt, this.pageWidth - this.margin, 52, { align: "right" });
		}
		this.doc.setDrawColor(...LINE);
		this.doc.setLineWidth(0.8);
		this.doc.line(this.margin, 66, this.pageWidth - this.margin, 66);
	}

	private drawFooters() {
		const total = this.doc.getNumberOfPages();
		for (let page = 1; page <= total; page += 1) {
			this.doc.setPage(page);
			const ruleY = this.pageHeight - 36;
			this.doc.setDrawColor(...LINE);
			this.doc.setLineWidth(0.8);
			this.doc.line(this.margin, ruleY, this.pageWidth - this.margin, ruleY);
			this.doc.setFont("helvetica", "normal");
			this.doc.setFontSize(8);
			this.doc.setTextColor(...MUTED);
			this.doc.text(`Page ${page} of ${total}`, this.pageWidth / 2, ruleY + 14, { align: "center" });
		}
	}

	private payloadRecord(): Record<string, unknown> {
		const parsed = parseResponse(this.context.requestPayload || "");
		return isRecord(parsed) ? parsed : {};
	}

	private scorePercent(): number | null {
		if (this.context.score != null && this.context.score !== "") {
			const fromContext = toPercent(this.context.score);
			if (fromContext != null) return fromContext;
		}
		const fromReport = toPercent(this.data.riskscore);
		if (fromReport != null) return fromReport;
		const amount = Number(this.data.amount);
		const risky = Number(this.data.risky_volume);
		if (Number.isFinite(amount) && amount > 0 && Number.isFinite(risky)) return Math.min(100, (risky / amount) * 100);
		return this.data.signals ? 0 : null;
	}

	private riskLevel(percent: number): string {
		if (this.data.hasBlackListFlag) return "severe";
		const named = this.context.riskLevel?.toLowerCase();
		if (named && named !== "undefined") return named;
		if (this.data.hasHighRisk) return "high";
		if (percent <= 0) return "none";
		if (percent <= 20) return "low";
		if (percent <= 79) return "medium";
		return "severe";
	}

	private assetText(payload: Record<string, unknown>): string {
		if (this.context.currencyId) return formatAsset(this.context.currencyId, payload);
		const token = (this.data.tokenDetails?.code || "").toUpperCase();
		const network = (this.data.network || "").toUpperCase();
		const asset = (this.data.asset || "").toUpperCase();
		if (token && network && token !== network) return `${token} · ${network}`;
		if (asset && network && asset !== network) return `${asset} · ${network}`;
		return token || asset || network;
	}

	private directionText(value: string): string {
		if (value === "deposit") return "Deposit";
		if (value === "withdrawal") return "Withdrawal";
		return value ? titleCase(value) : "";
	}

	private summaryRows(): Array<[string, string]> {
		const payload = this.payloadRecord();
		const tx =
			this.data.tx ||
			this.context.txHash ||
			readPayloadField(payload, "hash") ||
			readPayloadField(payload, "transaction");
		const address = this.data.address || readPayloadField(payload, "address");
		const direction = this.directionText(this.data.direction || readPayloadField(payload, "direction"));
		const amount =
			this.context.amountUsd != null && this.context.amountUsd !== ""
				? formatReportAmount(this.context.amountUsd)
				: formatReportAmount(this.data.fiat);
		const tags = (this.data.extras?.tags ?? [])
			.map((tag) => tag.trim())
			.filter(Boolean)
			.join(", ");
		const rows: Array<[string, string]> = [];
		if (tx) rows.push(["Transaction", tx]);
		if (address) rows.push(["Address", address]);
		const asset = this.assetText(payload);
		if (asset) rows.push(["Asset", asset]);
		if (direction) rows.push(["Direction", direction]);
		if (amount) rows.push(["Amount", amount]);
		if (this.context.email) rows.push(["Email", this.context.email]);
		if (tags) rows.push(["Tags", tags]);
		if (this.data.hasBlackListFlag || this.data.blackListsConnections) rows.push(["Blacklist", "Listed"]);
		return rows;
	}

	private drawSummary() {
		const width = this.pageWidth - this.margin * 2;
		const valueWidth = width - 144;
		const rows = this.summaryRows();
		const percent = this.scorePercent();
		const level = percent == null ? "" : this.riskLevel(percent);
		this.doc.setFont("helvetica", "bold");
		this.doc.setFontSize(10);
		const lines = rows.map((row) => this.doc.splitTextToSize(row[1], valueWidth) as string[]);
		const rowsHeight = lines.reduce((sum, rowLines) => sum + Math.max(20, rowLines.length * 14), 0);
		const cardHeight = 16 + rowsHeight + (percent == null ? 0 : 24) + 12;
		this.ensure(cardHeight);

		this.doc.setFillColor(247, 249, 251);
		this.doc.roundedRect(this.margin, this.y, width, cardHeight, 12, 12, "F");
		const labelX = this.margin + 16;
		const valueX = this.margin + 128;
		let cursor = this.y + 16;

		rows.forEach((row, index) => {
			const rowLines = lines[index] ?? [];
			this.doc.setFont("helvetica", "normal");
			this.doc.setFontSize(10);
			this.doc.setTextColor(...MUTED);
			this.doc.text(row[0], labelX, cursor + 11);
			this.doc.setFont("helvetica", "bold");
			this.doc.setTextColor(...TEXT);
			this.doc.text(rowLines.length ? rowLines : "-", valueX, cursor + 11);
			cursor += Math.max(20, rowLines.length * 14);
		});

		if (percent != null) {
			const grade = normalizeGrade(level);
			const pill = `${formatScorePercent(percent)}   ${riskLabel(level)}`;
			this.doc.setFont("helvetica", "normal");
			this.doc.setFontSize(10);
			this.doc.setTextColor(...MUTED);
			this.doc.text("Risk score", labelX, cursor + 12);
			this.doc.setFont("helvetica", "bold");
			const pillWidth = this.doc.getTextWidth(pill) + 18;
			this.doc.setFillColor(...gradeWash(grade));
			this.doc.roundedRect(valueX, cursor + 1, pillWidth, 18, 9, 9, "F");
			this.doc.setTextColor(...gradeColor(grade));
			this.doc.text(pill, valueX + 9, cursor + 13);
		}

		this.y += cardHeight + 8;
	}

	private drawSignalSection(title: string, groups: IAmlExposureGroup[], showEmpty: boolean) {
		if (!groups.length) {
			if (!showEmpty) return;
			this.ensure(36);
			this.y += 8;
			this.doc.setFont("helvetica", "bold");
			this.doc.setFontSize(12);
			this.doc.setTextColor(...TEXT);
			this.doc.text(title, this.margin, this.y + 12);
			this.y += 22;
			this.doc.setFont("helvetica", "normal");
			this.doc.setFontSize(10);
			this.doc.setTextColor(...MUTED);
			this.doc.text("No exposure in risk categories.", this.margin, this.y + 12);
			this.y += 20;
			return;
		}

		this.ensure(34);
		this.y += 8;
		this.doc.setFont("helvetica", "bold");
		this.doc.setFontSize(12);
		this.doc.setTextColor(...TEXT);
		this.doc.text(title, this.margin, this.y + 12);
		this.y += 22;
		const width = this.pageWidth - this.margin * 2;

		for (const group of groups) {
			this.ensure(22);
			this.doc.setFillColor(...gradeWash(group.grade));
			this.doc.roundedRect(this.margin, this.y, width, 18, 3, 3, "F");
			this.doc.setFont("helvetica", "bold");
			this.doc.setFontSize(9);
			this.doc.setTextColor(...gradeColor(group.grade));
			this.doc.text(titleCase(group.grade), this.margin + 8, this.y + 12);
			this.doc.text(formatPercent(group.percent), this.pageWidth - this.margin - 8, this.y + 12, { align: "right" });
			this.y += 26;

			for (const row of group.rows) {
				this.ensure(16);
				this.doc.setFillColor(...gradeColor(group.grade));
				this.doc.roundedRect(this.margin, this.y + 1, 8, 8, 1.5, 1.5, "F");
				this.doc.setFont("helvetica", "normal");
				this.doc.setFontSize(10);
				this.doc.setTextColor(...TEXT);
				const label = (this.doc.splitTextToSize(row.label, width - 90) as string[])[0] || row.label;
				this.doc.text(label, this.margin + 16, this.y + 9);
				this.doc.setFont("helvetica", "bold");
				this.doc.setTextColor(...gradeColor(group.grade));
				this.doc.text(formatPercent(row.percent), this.pageWidth - this.margin, this.y + 9, { align: "right" });
				this.y += 16;
			}

			this.y += 6;
		}
	}
}

const formatReportAmount = (value: string | number | null | undefined): string => {
	if (value == null || value === "") return "";
	const amount = formatDollars(value, { countPartMoreOneDollar: 2, errorValue: "" });
	return amount === "" ? "" : amount;
};

const formatAsset = (currencyId: string | null | undefined, payload: Record<string, unknown>): string => {
	if (currencyId) {
		return [getCurrentCoin(currencyId), getCurrentBlockchain(currencyId)].filter(Boolean).join(" · ");
	}
	return [readPayloadField(payload, "token"), readPayloadField(payload, "blockchain").toUpperCase()]
		.filter(Boolean)
		.join(" · ");
};

const statusLabel = (status?: string): string => {
	if (status === "failed") return "Error";
	if (status === "pending") return "In progress";
	if (status === "success") return "Success";
	return status ? titleCase(status) : "Error";
};

const downloadUnavailablePdf = (
	message: string,
	fileName: string,
	logo: HTMLImageElement,
	context: IAmlReportContext = {}
) => {
	const doc = new jsPDF({ unit: "pt", format: "a4" });
	const margin = 40;
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const payload = parseResponse(context.requestPayload || "");
	const payloadRecord = isRecord(payload) ? payload : {};
	const txHash = context.txHash || readPayloadField(payloadRecord, "transaction");
	const asset = formatAsset(context.currencyId, payloadRecord);
	const amount = formatReportAmount(context.amountUsd);
	const generatedAt = formatGeneratedAt(context.createdAt || undefined);

	doc.addImage(logo, "PNG", margin, 18, 124, 36);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(8);
	doc.setTextColor(...MUTED);
	doc.text("AML REPORT", pageWidth - margin, 28, { align: "right" });
	doc.setFont("helvetica", "normal");
	doc.setTextColor(...TEXT);
	doc.text(context.id || "-", pageWidth - margin, 40, { align: "right" });
	if (generatedAt) {
		doc.setTextColor(...MUTED);
		doc.text(generatedAt, pageWidth - margin, 52, { align: "right" });
	}
	doc.setDrawColor(...LINE);
	doc.setLineWidth(0.8);
	doc.line(margin, 66, pageWidth - margin, 66);

	const width = pageWidth - margin * 2;
	const valueX = margin + 128;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(10);
	const hashLines = txHash ? (doc.splitTextToSize(txHash, width - 148) as string[]) : [];
	const facts: Array<[string, string]> = [];
	if (asset) facts.push(["Asset", asset]);
	if (amount) facts.push(["Amount", amount]);
	if (context.email) facts.push(["Email", context.email]);
	const hashHeight = hashLines.length ? Math.max(22, hashLines.length * 14) : 0;
	const cardHeight = 16 + hashHeight + facts.length * 20 + 28 + 12;
	let y = 86;

	doc.setFillColor(247, 249, 251);
	doc.roundedRect(margin, y, width, cardHeight, 12, 12, "F");
	let cursor = y + 16;
	if (hashLines.length) {
		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.setTextColor(...MUTED);
		doc.text("Transaction", margin + 16, cursor + 11);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(...TEXT);
		doc.text(hashLines, valueX, cursor + 11);
		cursor += hashHeight;
	}
	for (const [label, value] of facts) {
		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.setTextColor(...MUTED);
		doc.text(label, margin + 16, cursor + 11);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(...TEXT);
		doc.text(value, valueX, cursor + 11);
		cursor += 20;
	}
	doc.setFont("helvetica", "normal");
	doc.setFontSize(10);
	doc.setTextColor(...MUTED);
	doc.text("Status", margin + 16, cursor + 12);
	const label = statusLabel(context.status);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(10);
	const pillWidth = doc.getTextWidth(label) + 18;
	doc.setFillColor(...gradeWash("high"));
	doc.roundedRect(valueX, cursor + 1, pillWidth, 18, 9, 9, "F");
	doc.setTextColor(...gradeColor("high"));
	doc.text(label, valueX + 9, cursor + 13);

	y += cardHeight + 16;
	doc.setFillColor(...gradeWash("high"));
	doc.roundedRect(margin, y, width, 72, 12, 12, "F");
	doc.setFont("helvetica", "bold");
	doc.setFontSize(13);
	doc.setTextColor(...gradeColor("high"));
	doc.text(message, margin + 16, y + 28);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(10);
	doc.setTextColor(...TEXT);
	const note = doc.splitTextToSize(
		"The provider did not return a risk report for this transaction.",
		width - 32
	) as string[];
	doc.text(note, margin + 16, y + 48);

	doc.setDrawColor(...LINE);
	doc.line(margin, pageHeight - 36, pageWidth - margin, pageHeight - 36);
	doc.setFontSize(8);
	doc.setTextColor(...MUTED);
	doc.text("Page 1 of 1", pageWidth / 2, pageHeight - 22, { align: "center" });
	doc.setProperties({ title: `AML report ${context.id || ""}`.trim(), creator: "DV.net" });
	doc.save(fileName);
};

const downloadPlainPdf = (content: string, fileName: string, logo: HTMLImageElement) => {
	const doc = new jsPDF({ unit: "pt", format: "a4" });
	const margin = 40;
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const lines = doc.splitTextToSize(content || "-", pageWidth - margin * 2) as string[];
	let cursorY = 78;

	const header = () => {
		doc.addImage(logo, "PNG", margin, 18, 124, 36);
		doc.setDrawColor(...LINE);
		doc.setLineWidth(0.8);
		doc.line(margin, 66, pageWidth - margin, 66);
		cursorY = 86;
	};

	header();
	doc.setFont("courier", "normal");
	doc.setFontSize(9);
	doc.setTextColor(...TEXT);

	for (const line of lines) {
		if (cursorY > pageHeight - 56) {
			doc.addPage();
			header();
			doc.setFont("courier", "normal");
			doc.setFontSize(9);
			doc.setTextColor(...TEXT);
		}
		doc.text(line, margin, cursorY);
		cursorY += 12;
	}

	const total = doc.getNumberOfPages();
	for (let page = 1; page <= total; page += 1) {
		doc.setPage(page);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(9);
		doc.setTextColor(...MUTED);
		doc.text(`Page ${page} of ${total}`, pageWidth - margin, pageHeight - 36, { align: "right" });
	}

	doc.save(fileName);
};

const loadLogo = () =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error("Failed to load the report logo"));
		image.src = logoUrl;
	});

export const downloadAmlServiceResponsePdf = async (
	serviceResponse: string,
	fileName = "aml-report.pdf",
	context?: IAmlReportContext
) => {
	const logo = await loadLogo();
	const parsed = parseResponse(serviceResponse);
	if (isCoinKytReport(parsed)) {
		new AmlReportPdf(parsed, logo).save(fileName);
		return;
	}

	if (isAmlBotReport(parsed)) {
		new AmlBotReportPdf(parsed, logo, context).save(fileName);
		return;
	}

	const message = readProviderMessage(parsed);
	if (message) {
		downloadUnavailablePdf(message, fileName, logo, context);
		return;
	}

	const plain = parsed == null ? serviceResponse : JSON.stringify(parsed, null, 2);
	downloadPlainPdf(plain, fileName, logo);
};
