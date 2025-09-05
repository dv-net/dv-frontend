import type { CurrencyType } from "@pay/utils/types/blockchain";

export interface IProps {
	currency: CurrencyType;
	currencyLabel?: string | null;
	mode?: "grey" | "white";
	height?: number;
	selected?: boolean;
	isHoverActive?: boolean;
	isShowPrice?: boolean;
}
