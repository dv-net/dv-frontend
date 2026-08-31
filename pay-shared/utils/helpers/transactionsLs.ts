import type { ITransactionsLsSnapshot, IWalletTxFindResponse } from "@pay-shared/utils/types/transaction";

/** `pay:transactions:{walletId}` — one key per wallet so concurrent payment tabs do not overwrite each other */
export const getTransactionsLsKey = (prefix: string, walletId: string): string => `${prefix}:${walletId}`;

export const readTransactionsSnapshot = (prefix: string, walletId: string): ITransactionsLsSnapshot | null => {
	const key = getTransactionsLsKey(prefix, walletId);
	const raw = localStorage.getItem(key);
	if (!raw) return null;

	try {
		const parsed = JSON.parse(raw) as Partial<ITransactionsLsSnapshot>;
		if (parsed.wallet_id && parsed.wallet_id !== walletId) {
			localStorage.removeItem(key);
			return null;
		}
		return {
			wallet_id: walletId,
			confirmed: parsed.confirmed ?? [],
			unconfirmed: parsed.unconfirmed ?? []
		};
	} catch {
		localStorage.removeItem(key);
		return null;
	}
};

export const writeTransactionsSnapshot = (prefix: string, walletId: string, snapshot: IWalletTxFindResponse): void => {
	const payload: ITransactionsLsSnapshot = {
		wallet_id: walletId,
		confirmed: snapshot.confirmed,
		unconfirmed: snapshot.unconfirmed
	};
	localStorage.removeItem(prefix); // drop legacy un-namespaced key
	localStorage.setItem(getTransactionsLsKey(prefix, walletId), JSON.stringify(payload));
};

export const clearTransactionsSnapshot = (prefix: string, walletId: string): void => {
	localStorage.removeItem(prefix); // drop legacy un-namespaced key
	localStorage.removeItem(getTransactionsLsKey(prefix, walletId));
};
