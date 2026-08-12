import type { CurrencyType } from "@pay-simple/utils/types/blockchain";
import type { BlockchainType } from "@shared/utils/types/blockchain";

export interface IProps {
	type: "currency" | "blockchain";
	currency?: CurrencyType;
	currencyId?: BlockchainType;
	isShowBtnChange?: boolean;
}
