import { type Ref, isRef } from "vue";
import { PRECISION_CURRENCIES } from "@shared/utils/constants/blockchain";
import type { BlockchainType } from "@shared/utils/types/blockchain";
import { URL_REGEX } from "@shared/utils/constants/regex";

// text / Text
export const capitalizeFirstLetter = (str: string, locale?: string): string => {
	if (!str) return "";
	return str.charAt(0).toLocaleUpperCase(locale || "en") + str.slice(1);
};

// Check if it's JSON
export const checkIsJSON = (str: any): boolean => {
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
	amount: any,
	currencyValue: string = "$", // which currency to return
	errorValue: string = "—", // value returned on error
	countPartMoreOneDollar: number = 0, // number of decimal places when amount = from 1 to ~
	countPartLessOneDollar: number = 2, // number of decimal places when amount = from 0 to 1
	isFormattedIntegerPart: boolean = true // whether to format dollar output
): string => {
	const num: number = parseFloat(amount);
	if (isNaN(num) || !isFinite(num)) return errorValue;
	if (num > 0 && num < 1) {
		const factor: number = 10 ** countPartLessOneDollar;
		return currencyValue + (Math.floor(num * factor) / factor).toFixed(countPartLessOneDollar).replace(/\.?0+$/, "");
	}
	const [integerPart, fractionalPart] = String(num).split(".");
	const formattedIntegerPart = isFormattedIntegerPart
		? parseFloat(integerPart).toLocaleString("ru-RU")
		: parseFloat(integerPart);
	const formattedFractionalPart = fractionalPart?.slice(0, countPartMoreOneDollar) || "";
	return countPartMoreOneDollar > 0 && formattedFractionalPart
		? `${currencyValue}${formattedIntegerPart}.${formattedFractionalPart}`
		: currencyValue + formattedIntegerPart;
};

// TRX * rate / 55$ or send prop "usdToCurrency" USD / rate
export const convertCurrencyInUsd = (amount: any, rate: any, direction = "currencyToUsd"): number => {
	const amountValue = parseFloat(amount);
	const rateValue = parseFloat(rate);
	if (isNaN(amountValue) || isNaN(rateValue)) return 0;
	return direction === "currencyToUsd" ? amountValue * rateValue : amountValue / rateValue;
};

// 57346.875465654654 / 57346.875465
export const formatAmountBlockchain = (
	amount: any,
	currencyId?: string,
	setCount?: number,
	errorValue = "—"
): string => {
	const precisionCurrency: number | null =
		currencyId && currencyId in PRECISION_CURRENCIES ? PRECISION_CURRENCIES[currencyId as BlockchainType] : null;
	const count: number = setCount || precisionCurrency || 6;
	const num: number = parseFloat(amount);
	if (isNaN(num) || !isFinite(num)) return errorValue;
	if (count === 0) {
		return String(Math.floor(num));
	}
	const factor: number = 10 ** count;
	return (Math.floor(num * factor) / factor).toFixed(count).replace(/\.?0+$/, "");
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

// 436f6e74726163742076616c6964617465206572 / contract validation error: account [TH8QmAkt1vCwk26dc9oLnipsLWCgCBa6mr9] does not exist
export const hexToText = (hex: string) => {
	if (!hex) return "";
	const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []);
	const decoder = new TextDecoder("utf-8");
	return decoder.decode(bytes);
};

// Clean object for backend from falsy values (except bool and 0)
export const normalizeRequestObject = (body: any) => {
	return Object.entries(body).reduce((result, [key, value]) => {
		if (typeof value === "number" && value === 0) return result;
		(result as any)[key] = !value && typeof value !== "boolean" ? null : value;
		return result;
	}, {});
};

// Clear object fields if all fields are string type
export const clearObjectValues = (obj: Ref<Record<any, string>> | Record<any, string>) => {
	if (isRef(obj)) {
		Object.keys(obj.value).forEach((key) => {
			if (Object.prototype.hasOwnProperty.call(obj.value, key) && typeof obj.value[key] === "string") {
				obj.value[key] = "";
			}
		});
	} else {
		Object.keys(obj).forEach((key) => {
			if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === "string") {
				obj[key] = "";
			}
		});
	}
};

export const copiedText = async (text: string) => {
	await navigator.clipboard.writeText(text);
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

// URL validation
export const isValidUrl = (string: any) => {
	try {
		new URL(string);
		const pattern = new RegExp(URL_REGEX, "i");
		return pattern.test(string);
	} catch (error: any) {
		console.error(error);
		return false;
	}
};
