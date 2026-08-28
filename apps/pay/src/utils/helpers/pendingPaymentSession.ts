import type { TAmlPaymentPhase } from "@pay/utils/constants/aml";
import { PENDING_PAYMENT_LS_KEY } from "@pay/utils/constants/payerForm";
import type { IPendingPaymentSession } from "@pay/utils/types/payerForm";
import type { IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";

export const savePendingPaymentSession = (
	walletId: string,
	transaction: IWalletTransactionResponse,
	amlPhase: TAmlPaymentPhase | null
): void => {
	const session: IPendingPaymentSession = {
		wallet_id: walletId,
		transaction,
		aml_phase: amlPhase
	};
	localStorage.setItem(PENDING_PAYMENT_LS_KEY, JSON.stringify(session));
};

export const readPendingPaymentSession = (): IPendingPaymentSession | null => {
	const raw = localStorage.getItem(PENDING_PAYMENT_LS_KEY);
	if (!raw) return null;

	try {
		const session = JSON.parse(raw) as IPendingPaymentSession;
		if (!session.wallet_id || !session.transaction?.hash) {
			localStorage.removeItem(PENDING_PAYMENT_LS_KEY);
			return null;
		}
		return session;
	} catch {
		localStorage.removeItem(PENDING_PAYMENT_LS_KEY);
		return null;
	}
};

export const clearPendingPaymentSession = (): void => {
	localStorage.removeItem(PENDING_PAYMENT_LS_KEY);
};
