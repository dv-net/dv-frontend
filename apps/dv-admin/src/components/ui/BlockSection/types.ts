export type BlockSectionRadius = "none" | "sm" | "md" | "lg";
export type BlockSectionPadding = "none" | "sm" | "md" | "lg" | "l" | "xl" | "xxl";
export type BlockSectionMode =
	| "transparent"
	| "white"
	| "grey"
	| "grey-border"
	| "white-border-green"
	| "white-border-red";

export interface IProps {
	mode?: BlockSectionMode;
	radius?: BlockSectionRadius;
	padding?: BlockSectionPadding;
	title?: string;
	height?: string;
	infoTitle?: string;
	infoText?: string;
	popperClass?: string;
	isLoading?: boolean;
}
