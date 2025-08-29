import type { ISettingsItem } from "@dv-admin/utils/types/general";

export interface IProps {
	setting: ISettingsItem;
	params?: string;
	isShowContent?: boolean;
}
