export interface IFormatAmountBlockchainOptions {
	currencyId?: string; // USDT.Tron — precision from DEFAULT_CURRENCIES_INFO
	count?: number; // manual decimal places; otherwise currency precision or 6
	errorValue?: string; // fallback for empty/invalid amount, default "—"
	thousandSeparator?: string; // thousands separator: " " → 57 346, "," → 57,346, default none
}

export interface IFormatDollarsOptions {
	currency?: string; // display prefix: "$", "€", "" — default "$"
	errorValue?: string; // fallback for empty/invalid amount, default "—"
	countPartMoreOneDollar?: number; // decimals when amount >= 1, default 0
	countPartLessOneDollar?: number; // decimals when 0 < amount < 1, default 2
	thousandSeparator?: string; // thousands separator: " " → 57 346, "," → 57,346, "" none
}
