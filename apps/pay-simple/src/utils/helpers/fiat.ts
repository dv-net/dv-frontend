import { formatDollars } from "@shared/utils/helpers/general";

const FIAT_SYMBOLS: Record<string, string> = {
	USD: "$",
	EUR: "€",
	GBP: "£",
	CNY: "¥",
	JPY: "¥",
	RUB: "₽",
	UAH: "₴",
	KRW: "₩",
	INR: "₹",
	TRY: "₺",
	BRL: "R$",
	AUD: "A$",
	CAD: "C$",
	CHF: "CHF ",
	PLN: "zł",
	THB: "฿"
};

export const getFiatPrefix = (currency: string): string => {
	const code = currency.toUpperCase();
	return FIAT_SYMBOLS[code] ?? `${code} `;
};

export const formatFiatAmount = (
	amount: string | number | null | undefined,
	currency: string,
	errorValue: string = "—"
): string => formatDollars(amount, getFiatPrefix(currency), errorValue, 2);
