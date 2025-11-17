import type { ITransactionDashboardItem, IWalletInfoResponse } from "@dv-admin/utils/types/api/apiGo";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";

export interface IProps {
	walletInfo: IWalletInfoResponse | null
	transactionsSearchAddress: ITransactionDashboardItem[]
	transactionsSearchAddressPagination: UItableMeta | null
	transferHistory: ITransactionDashboardItem[]
	transferHistoryPagination: UItableMeta | null
	isLoadingTransactions: boolean
}
