import { DEFAULT_CURRENCIES_INFO, DEFAULT_CURRENCY_PRECISION } from "@shared/utils/constants/blockchain";
import type { BlockchainType } from "@shared/utils/types/blockchain";
import { URL_REGEX } from "@shared/utils/constants/regex";

// text / Text
export const capitalizeFirstLetter = (str: string, locale?: string): string => {
	if (!str) return "";
	return str.charAt(0).toLocaleUpperCase(locale || "en") + str.slice(1);
};

export const changeChainBsc = (chain: string): string => {
	if (!chain) return "";
	return chain === "BNBSmartChain" ? "BSC" : chain;
};

// Check if it's JSON
export const checkIsJSON = (str: string): boolean => {
	try {
		if (!str) return false;
		JSON.parse(str);
		return true;
	} catch (error: any) {
		console.error(error);
		return false;
	}
};

// 57346.87000000 / $57 346
export const formatDollars = (
	amount: string | number | null | undefined,
	currencyValue: string = "$", // which currency to return
	errorValue: string = "—", // value returned on error
	countPartMoreOneDollar: number = 0, // number of decimal places when amount = from 1 to ~
	countPartLessOneDollar: number = 2, // number of decimal places when amount = from 0 to 1
	isFormattedIntegerPart: boolean = true // whether to format dollar output
): string => {
	if (amount === null || amount === undefined) return errorValue;
	const num = typeof amount === "string" ? parseFloat(amount) : amount;
	if (Number.isNaN(num) || !Number.isFinite(num)) return errorValue;
	if (num > 0 && num < 1) {
		const factor: number = 10 ** countPartLessOneDollar;
		return currencyValue + (Math.floor(num * factor) / factor).toFixed(countPartLessOneDollar).replace(/\.?0+$/, "");
	}
	const [integerPart = "0", fractionalPart] = String(num).split(".");
	const formattedIntegerPart = isFormattedIntegerPart
		? parseFloat(integerPart).toLocaleString("ru-RU")
		: parseFloat(integerPart);
	const formattedFractionalPart =
		fractionalPart !== undefined && fractionalPart !== null ? fractionalPart.slice(0, countPartMoreOneDollar) : "";
	const hasMeaningfulFraction = Boolean(
		countPartMoreOneDollar > 0 && formattedFractionalPart && parseInt(formattedFractionalPart, 10) > 0
	);
	return hasMeaningfulFraction
		? `${currencyValue}${formattedIntegerPart}.${formattedFractionalPart}`
		: currencyValue + formattedIntegerPart;
};

// TRX * rate / 55$ or send prop "usdToCurrency" USD / rate
export const convertCurrencyInUsd = (
	amount: string | number | null | undefined,
	rate: string | number | null | undefined,
	direction: "currencyToUsd" | "usdToCurrency" = "currencyToUsd"
): number => {
	const amountValue = parseFloat(String(amount));
	const rateValue = parseFloat(String(rate));
	if (Number.isNaN(amountValue) || Number.isNaN(rateValue)) return 0;
	return direction === "currencyToUsd" ? amountValue * rateValue : amountValue / rateValue;
};

// 57346.875465654654 / 57346.875465
export const formatAmountBlockchain = (
	amount: string | number | null | undefined,
	currencyId?: string,
	setCount?: number,
	errorValue: string = "—",
	isFormattedIntegerPart: boolean = false
): string => {
	if (amount === null || amount === undefined) return errorValue;
	const precisionCurrency: number =
		currencyId && currencyId in DEFAULT_CURRENCIES_INFO
			? DEFAULT_CURRENCIES_INFO[currencyId as BlockchainType].precision
			: DEFAULT_CURRENCY_PRECISION;
	const count: number = setCount ?? precisionCurrency;
	const num: number = typeof amount === "string" ? parseFloat(amount) : amount;
	if (Number.isNaN(num) || !Number.isFinite(num)) return errorValue;
	let integerPartRaw: string;
	let fractionalPartRaw: string;
	if (typeof amount === "string") {
		[integerPartRaw = "0", fractionalPartRaw = ""] = amount.split(".");
	} else {
		if (count === 0) {
			const integerValue = Math.floor(num);
			integerPartRaw = integerValue.toString();
			fractionalPartRaw = "";
		} else {
			const factor = 10 ** count;
			const truncated = Math.floor(num * factor) / factor;
			const fixed = truncated.toFixed(count);
			[integerPartRaw = "0", fractionalPartRaw = ""] = fixed.split(".");
		}
	}
	if (count === 0) {
		const integerValue = Math.floor(num);
		return isFormattedIntegerPart ? integerValue.toLocaleString("en-US") : String(integerValue);
	}
	const finalFractional = fractionalPartRaw.slice(0, count).replace(/0+$/, "");
	const formattedInteger = isFormattedIntegerPart
		? parseFloat(integerPartRaw).toLocaleString("en-US")
		: integerPartRaw;
	return finalFractional ? `${formattedInteger}.${finalFractional}` : formattedInteger;
};

// BTC.Bitcoin - BTC
export const getCurrentCoin = (currency_id: string): string => {
	if (!currency_id) return "";
	return currency_id.split(".")[0];
};

// BTC.Bitcoin - Bitcoin
export const getCurrentBlockchain = (currency_id: string): string => {
	if (!currency_id) return "";
	return currency_id.split(".")[1];
};

// 591f3fcdc652cd3bbc69d3973ff699f88573cad9a8381ffbf4c06c5631eef8f2 / 591F3FCDC652CD3BBC69D3973FF699...EEF8F2
export const truncateHash = (str: string, countPrefix: number = 14, countSuffix: number = 6): string => {
	if (!str) return "";
	const maxLength: number = Math.round(countPrefix + countSuffix);
	if (str.length <= maxLength) return str;
	const prefix: string = str.slice(0, countPrefix);
	const suffix: string = str.slice(-countSuffix);
	return prefix + "..." + suffix;
};

// Convert array of strings to array for UiSelect
export const getOptionsForUiSelect = (arr: string[]) => {
	if (!arr || !arr.length) return [];
	return arr.map((item) => ({ value: item, label: item }));
};

// http://localhost:3333/system-settings / http://localhost:3333 and /system-settings
export const splitDomain = (url: string): { base: string; path: string } | null => {
	try {
		if (!url) return null;
		const urlObj = new URL(url);
		const base = `${urlObj.protocol}//${urlObj.host}`;
		const path = urlObj.pathname + urlObj.search + urlObj.hash;
		return { base, path };
	} catch (error: any) {
		console.error(error);
		return null;
	}
};

// uuid - 9f2b3ef7-2e06-4f02-bf4b-6f19f2a1e05c
export const generateUUID = (): string => {
	const buf = new Uint8Array(16);
	crypto.getRandomValues(buf);
	buf[6] = (buf[6] & 0x0f) | 0x40;
	buf[8] = (buf[8] & 0x3f) | 0x80;
	return [...buf]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
		.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
};

export const copiedText = async (text: string) => {
	await navigator.clipboard.writeText(text);
};

// URL validation
export const isValidUrl = (value: string | null | undefined): boolean => {
	if (!value) return false;
	try {
		new URL(value);
		const pattern = new RegExp(URL_REGEX, "i");
		return pattern.test(value);
	} catch (error: any) {
		console.error(error);
		return false;
	}
};
