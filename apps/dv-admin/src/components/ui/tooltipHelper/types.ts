import type { UiIconSize, UiIconType } from "@dv.net/ui-kit/dist/components/UiIcon/types";

export interface IProps {
	title?: string;
	text?: string;
	iconColor?: string;
	iconSize?: UiIconSize;
	iconType?: UiIconType;
	popperClass?: string;
	timeout?: number;
}
