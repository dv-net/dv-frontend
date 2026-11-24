import { type Component } from "vue";
import type { ENUM_ADDRESS_BOOK_TYPES } from "@dv-admin/utils/constants/addressBook";
import type { BlockchainType } from "@shared/utils/types/blockchain";
import type { IWithdrawalAddressItemResponse } from "@dv-admin/utils/types/api/apiGo";

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
	id: number;
	details_by_currency: IFilteredDepositSummaryDetailsCurrency[];
	allDetailsByCurrency: IFilteredDepositSummaryDetailsCurrency[];
	date: string;
	sum_usd: string;
	transactions_count: number;
	type: string;
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

export interface IPendingDeleteWalletGroup {
	walletId: string;
	currencyId?: string;
	addresses: IWithdrawalAddressItemResponse[];
	manualAddress: string | null;
}

export interface ICoinKytEntity {
	name?: string;
	type_label?: string;
	type?: string;
}

export interface ICoinKytDiscreteItem {
	type_label?: string;
	type?: string;
	risk_score_grade?: string;
	received_count_coef?: string | number;
	sent_count_coef?: string | number;
	total?: string;
}

export interface ICoinKytDiscrete {
	received?: ICoinKytDiscreteItem[];
	sent?: ICoinKytDiscreteItem[];
}

export interface ICoinKytIndirect {
	type_label?: string;
	type?: string;
	risk_score_grade?: string;
	total_count_coef?: string | number;
	total?: string;
}

export interface ICoinKytAlert {
	risk_grade?: string;
	risk_profile?: string;
	address?: string;
}

export interface ICoinKytReport {
	id?: string;
	blockchain?: string;
	token?: string;
	address?: string;
	risk_score?: string | number;
	risk_score_grade?: string;
	inputs?: number;
	outputs?: number;
	from_entity?: ICoinKytEntity[];
	to_entity?: ICoinKytEntity[];
	indirects?: ICoinKytIndirect[];
	block_number?: number;
	timestamp?: string;
	link?: string;
	too_many_indirects?: boolean;
	owner?: string | ICoinKytEntity;
	balance?: string | number;
	received?: string | number;
	sent?: string | number;
	discrete?: ICoinKytDiscrete;
	alerts?: ICoinKytAlert[];
}

export interface IAmlExposureRow {
	label: string;
	percent: number;
}

export interface IAmlExposureGroup {
	grade: string;
	percent: number;
	rows: IAmlExposureRow[];
}

export interface IAmlReportContext {
	id?: string;
	status?: string;
	score?: string | number | null;
	riskLevel?: string | null;
	txHash?: string | null;
	amountUsd?: string | number | null;
	currencyId?: string | null;
	email?: string | null;
	createdAt?: string | null;
	requestPayload?: string | null;
}

export interface IAmlBotSignals {
	[category: string]: string | number;
}

export interface IAmlBotTokenDetails {
	code?: string;
	issuer?: string;
	token_id?: number;
}

export interface IAmlBotCheckData {
	tx?: string;
	address?: string;
	asset?: string;
	network?: string;
	status?: string;
	flow?: string;
	direction?: string;
	riskscore?: string | number;
	hasHighRisk?: boolean;
	hasBlackListFlag?: boolean;
	blackListsConnections?: boolean;
	fiat?: string | number;
	amount?: string | number;
	risky_volume?: string | number;
	timestamp?: string;
	signals?: IAmlBotSignals;
	extras?: { tags?: string[] };
	counterparty?: { signals?: { in?: IAmlBotSignals; out?: IAmlBotSignals } };
	tokenDetails?: IAmlBotTokenDetails;
}

export interface IAmlBotResponse {
	result?: boolean;
	description?: string;
	data?: IAmlBotCheckData;
}
