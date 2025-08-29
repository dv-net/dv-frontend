import type { showedHistoryTableType } from "@dv-admin/utils/types/api/apiGo.ts";
import type { ENUM_TRANSACTIONS_TYPES } from "@dv-admin/utils/constants/history";
export interface IProps {
	showedTable: showedHistoryTableType;
	changeFilter: () => Promise<void>;
	changeTabs: (tabValue: ENUM_TRANSACTIONS_TYPES, isOnMounted: boolean) => Promise<void>;
}
