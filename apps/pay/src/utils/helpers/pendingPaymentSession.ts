import type { TAmlPaymentPhase } from "@pay/utils/constants/aml";
import { PAYMENT_LS_TTL_MS, PENDING_PAYMENT_LS_PREFIX } from "@pay/utils/constants/payerForm";
import type { IPendingPaymentSession } from "@pay/utils/types/payerForm";
import type { IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";

/** `pay:pending-payment:{walletId}` — one key per wallet so sessions of different wallets do not evict each other */
const getPendingPaymentLsKey = (walletId: string): string => `${PENDING_PAYMENT_LS_PREFIX}:${walletId}`;

export const savePendingPaymentSession = (
	walletId: string,
	transaction: IWalletTransactionResponse,
	amlPhase: TAmlPaymentPhase | null
): void => {
	const session: IPendingPaymentSession = {
		wallet_id: walletId,
		transaction,
		aml_phase: amlPhase,
		saved_at: Date.now()
	};
	localStorage.setItem(getPendingPaymentLsKey(walletId), JSON.stringify(session));
};

export const readPendingPaymentSession = (walletId: string): IPendingPaymentSession | null => {
	const key = getPendingPaymentLsKey(walletId);
	const raw = localStorage.getItem(key);
	if (!raw) return null;

	try {
		const session = JSON.parse(raw) as IPendingPaymentSession;
		const isExpired = !session.saved_at || Date.now() - session.saved_at > PAYMENT_LS_TTL_MS;
		if (session.wallet_id !== walletId || !session.transaction?.hash || isExpired) {
			localStorage.removeItem(key);
			return null;
		}
		return session;
	} catch {
		localStorage.removeItem(key);
		return null;
	}
};

export const clearPendingPaymentSession = (walletId: string): void => {
	localStorage.removeItem(getPendingPaymentLsKey(walletId));
};
