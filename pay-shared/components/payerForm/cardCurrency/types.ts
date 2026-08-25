import type { CurrencyType } from "@shared/utils/types/blockchain";
import type { IInfoBlockchains } from "@pay-shared/utils/types/currency";

export interface ICardCurrencyProps {
	currency: CurrencyType;
	currencyLabel?: string | null;
	blockchains?: IInfoBlockchains[];
	mode?: "grey" | "white";
	height?: number;
	selected?: boolean;
	isHoverActive?: boolean;
	isShowPrice?: boolean;
	/** Precomputed display rate from the app store */
	amountRate?: string;
}
