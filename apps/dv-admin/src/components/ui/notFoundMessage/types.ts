import type { BlockSectionMode } from "@dv-admin/components/ui/BlockSection/types";

export type TypeNotFoundMessageSize = "sm" | "md" | "lg";

export interface IProps {
	text?: string;
	mode?: BlockSectionMode;
	size?: TypeNotFoundMessageSize;
}
