import type { IFormAddressBook } from "@dv-admin/utils/types/schemas";
import type { UiTagMode } from "@dv.net/ui-kit/dist/components/UiTag/types";

export const ADDRESS_BOOK_TYPES = {
	REGULAR: "regular",
	UNIVERSAL: "universal",
	EVM: "evm"
} as const;
export type ENUM_ADDRESS_BOOK_TYPES = (typeof ADDRESS_BOOK_TYPES)[keyof typeof ADDRESS_BOOK_TYPES];

export const startDataFormAddressBook: IFormAddressBook = {
	address: null,
	typeAddress: ADDRESS_BOOK_TYPES.REGULAR,
	create_withdrawal_rule: false,
	name: null,
	totp: null,
	tag: null,
	blockchain: null,
	currency_id: null,
	is_universal: false,
	is_evm: false
};

export const ADDRESS_BOOK_TYPE_LABELS: Record<ENUM_ADDRESS_BOOK_TYPES, string> = {
	[ADDRESS_BOOK_TYPES.REGULAR]: "Token",
	[ADDRESS_BOOK_TYPES.UNIVERSAL]: "All blockchain tokens",
	[ADDRESS_BOOK_TYPES.EVM]: "All EVM chain tokens"
} as const;

export const ADDRESS_BOOK_MODE_TYPE: Record<ENUM_ADDRESS_BOOK_TYPES, UiTagMode> = {
	regular: "accent",
	universal: "positive",
	evm: "warning"
} as const;
