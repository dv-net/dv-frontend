import type { UiIconSize } from "@dv.net/ui-kit/dist/components/UiIcon/types";
import type { UiLinkSize, UiLinkMode } from "@dv.net/ui-kit/dist/components/UiLink/types";

export interface IProps {
	type: "transaction" | "address";
	hash: string;
	currencyId?: string;
	isLink?: boolean;
	modeLink?: UiLinkMode;
	isShowIconCopy?: boolean;
	isShowHash?: boolean;
	countPrefix?: number;
	countSuffix?: number;
	colorIcon?: string;
	sizeIcon?: UiIconSize;
	sizeHash?: UiLinkSize;
}
