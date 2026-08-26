import type { BlockchainType } from "@shared/utils/types/blockchain";

export interface IInfoBlockchains {
	blockchain: string;
	isActive: false;
}

export interface IInfoCurrency {
	id: BlockchainType;
	code: string;
	name: string;
	blockchain: string;
	precision: number;
	is_bitcoin_like: boolean;
	is_evm_like: boolean;
	currency_label: string | null;
	token_label: string | null;
	blockchains?: IInfoBlockchains[];
	contract_address: string;
	is_native: boolean;
	sort_order?: number | null;
}
