import type { CurrencyType } from "@pay-simple/utils/types/blockchain";
import type { IInfoBlockchains } from "@pay-simple/utils/types/api/apiGo.ts";

export interface IProps {
	currency: CurrencyType;
	currencyLabel?: string | null;
	blockchains?: IInfoBlockchains[];
	mode?: "grey" | "white";
	height?: number;
	selected?: boolean;
	isHoverActive?: boolean;
	isShowPrice?: boolean;
}
