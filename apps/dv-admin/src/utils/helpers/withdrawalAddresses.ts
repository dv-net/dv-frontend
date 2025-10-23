import type { IWithdrawalAddressItemResponse } from "@dv-admin/utils/types/api/apiGo";
import { v4 as uuidv4 } from "uuid";

export const getFreshAddressee = () => ({
	id: uuidv4(),
	address: "",
	name: "",
	updated_at: "",
	created_at: "",
	deleted_at: "",
	withdrawal_wallet_id: ""
});

// Comparison of arrays by specific fields in withdrawal rules
export const isMatchByFields = <T>(obj1: T, obj2: T, fields: (keyof T)[]): boolean => {
	return fields.every((field) => obj1[field] === obj2[field]);
};
export const areArraysEqualByFields = <T>(arr1: T[], arr2: T[], fields: (keyof T)[]): boolean => {
	return (
		arr1.every((obj1) => arr2.some((obj2) => isMatchByFields(obj1, obj2, fields))) &&
		arr2.every((obj2) => arr1.some((obj1) => isMatchByFields(obj1, obj2, fields)))
	);
};

// Processing wallets entered in textarea
export const formatingWithdrawalAddresses = (addresses: string): IWithdrawalAddressItemResponse[] => {
	const arrayRows: string[] = addresses.split("\n").filter(Boolean);
	return arrayRows.map((row) => {
		const isBracketsAll: boolean = row.includes("[") && row.includes("]");
		const isBracketsMinOne: boolean = row.includes("[") || row.includes("]");
		const isBracketsOnlyLeft: boolean = row.includes("[") && !row.includes("]");

		// If no brackets (name not specified)
		if (!isBracketsMinOne) {
			return { ...getFreshAddressee(), name: "", address: row.trim() };
		}

		// When there are two brackets (name is specified)
		if (isBracketsAll) {
			// Extract address — all characters before the first square bracket
			const addressMatch = row.match(/^[^\[\]]+/);
			const address = addressMatch ? addressMatch[0].trim() : "";
			const nameMatch = row.match(/\[([^\[\]]*)\]/);
			const name = nameMatch ? nameMatch[1].trim() : "";
			return {
				...getFreshAddressee(),
				name,
				address
			};
		}

		// When there is only one left bracket
		if (isBracketsOnlyLeft) {
			// Remove all extra spaces and brackets at the beginning and end of the string
			const str = row.replace(/[\[\] ]+/g, " ").trim();
			// Split the string into parts
			const parts = str.split(" ");
			// First part is the address
			const address = parts[0];
			// The rest of the string is the name
			const name = parts.slice(1).join(" ");
			return {
				...getFreshAddressee(),
				name,
				address
			};
		}

		// Other cases
		const match = row.match(/^([a-zA-Z0-9\s]+)(?=\s*[\]\[])/);
		const address = match ? match[0] : "";
		return {
			...getFreshAddressee(),
			name: "",
			address: address.trim()
		};
	});
};
