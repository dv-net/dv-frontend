import type { CurrencyType } from "@pay/utils/types/blockchain";

export interface IProps {
	currency: CurrencyType;
	currencyLabel?: string | null;
	blockchains?: string[];
	mode?: "grey" | "white";
	height?: number;
	selected?: boolean;
	isHoverActive?: boolean;
	isShowPrice?: boolean;
}
