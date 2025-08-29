import { type Component } from "vue";
import type { ENUM_ADDRESS_BOOK_TYPES } from "@dv-admin/utils/constants/addressBook";
import type { BlockchainType } from "@shared/utils/types/blockchain";

export interface IProfileUserChangeEmail {
	code: string;
	email: string;
}

export interface IProfileRowConnectTelegram {
	id: number;
	icon: Component;
	title: string;
	text: string;
}

export interface IProfileRowAdvantagesCards {
	id: number;
	iconName: string;
	title: string;
	text: string;
}

export type IFilteredDepositSummaryDetailsCurrency = {
	currency: string;
	tx_count: number;
	percentage: number;
	sum_usd: string;
};
export interface IDepositFilteredSummary {
	details_by_currency: IFilteredDepositSummaryDetailsCurrency[];
	date: string;
	sum_usd: string;
	transactions_count: number;
	type: string;
	isMoreDetails: boolean;
}

export interface ITronTransferTypeList {
	id: string;
	title: string;
	subtitle: string;
	description: string;
	iconNameSubtitle: string;
	iconColor: string;
}

export interface IFormAddressBook {
	address: string | null;
	typeAddress: ENUM_ADDRESS_BOOK_TYPES;
	create_withdrawal_rule: boolean;
	name: string | null;
	tag: string | null;
	totp: string | null;
	blockchain: string | null;
	currency_id: string | null;
	is_evm: boolean;
	is_universal: boolean;
}

export interface IAddressBookCurrencies {
	currency_id: BlockchainType;
	withdrawal_rule_exists: boolean;
	id: string;
}

export interface IAddressBookList {
	type: ENUM_ADDRESS_BOOK_TYPES;
	address: string;
	name: string | null;
	tag: string | null;
	submitted_at: string;
	is_evm?: boolean;
	is_universal?: boolean;
	currency_count?: number;
	blockchain?: string;
	withdrawal_rule_exists?: boolean;
	blockchains?: string[];
	currency_id?: BlockchainType;
	id?: string;
	currencies?: IAddressBookCurrencies[];
}

export interface IMapAddressBookRow {
	withdrawalCurrencies: IAddressBookCurrencies[];
	hasAnyWithdrawalRule: boolean;
	hasAllWithdrawalRules: boolean;
}
