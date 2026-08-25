import type { CurrencyType, BlockchainType } from "@shared/utils/types/blockchain";
import type { IPayerAddressResponse } from "@pay-shared/utils/types/payer";

export interface ICardSelectBlockchainProps {
	type: "currency" | "blockchain";
	currency?: CurrencyType;
	currencyId?: BlockchainType;
	isShowBtnChange?: boolean;
	addresses: IPayerAddressResponse[];
	/** Precomputed display rate from the app store */
	amountRate?: string;
}
