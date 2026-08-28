import type { TAmlPaymentPhase } from "@pay/utils/constants/aml";
import type { IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";

export interface IPendingPaymentSession {
	wallet_id: string;
	transaction: IWalletTransactionResponse;
	aml_phase: TAmlPaymentPhase | null;
}
