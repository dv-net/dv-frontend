import type { ITransactionDashboardItem, IWalletInfoResponse } from "@dv-admin/utils/types/api/apiGo";

export interface IProps {
	walletInfo: IWalletInfoResponse | null;
	transactionsSearchAddress: ITransactionDashboardItem[];
	transferHistory: ITransactionDashboardItem[];
	isLoadingTransactions: boolean;
}
