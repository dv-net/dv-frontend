import type { CurrencyType } from "@pay/utils/types/blockchain";
import type { IInfoBlockchains } from "@pay/utils/types/api/apiGo.ts";

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
