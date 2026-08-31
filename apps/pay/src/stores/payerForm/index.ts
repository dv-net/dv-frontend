import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
	getApiPayerInfo,
	getApiStoreTopup,
	getApiWalletAmlCheck,
	getApiWalletBlockedTransactions,
	getApiWalletTxFind
} from "@pay/utils/services/payerForm.ts";
import type { IPayerAddressResponse, IPayerStoreResponse } from "@pay-shared/utils/types/payer";
import type { ITransactionsLsSnapshot, IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";
import { useI18n } from "vue-i18n";
import {
	changeChainBsc,
	formatAmountBlockchain,
	getCurrentBlockchain,
	getCurrentCoin
} from "@shared/utils/helpers/general.ts";
import { isLessThan1Hour } from "@pay-shared/utils/helpers/dateParse";
import type { BlockchainType } from "@shared/utils/types/blockchain";
import type { CurrencyType } from "@shared/utils/types/blockchain";
import { SORT_CHAIN } from "@pay-shared/utils/constants/blockchain";
import { loaderShutdown } from "@pay-shared/utils/helpers/general";
import type { ILatestTransaction } from "@pay-shared/components/payerForm/blockLatestTransactions/types";
import type { IPayerFormTimelineItem } from "@pay-shared/utils/types/payerForm";
import type { IBlockedTransactionItem } from "@pay/utils/types/aml";
import { TRANSACTIONS_LS_PREFIX } from "@pay/utils/constants/payerForm";
import {
	clearTransactionsSnapshot,
	readTransactionsSnapshot,
	writeTransactionsSnapshot
} from "@pay-shared/utils/helpers/transactionsLs";
import {
	clearPendingPaymentSession,
	readPendingPaymentSession,
	savePendingPaymentSession
} from "@pay/utils/helpers/pendingPaymentSession";
import {
	AML_CHECK_STATUS,
	AML_NULL_POLLS_BEFORE_SKIP,
	AML_PAYMENT_PHASE,
	AML_POLL_INTERVAL_MS,
	type TAmlPaymentPhase
} from "@pay/utils/constants/aml";

export const usePayerFormStore = defineStore("payerForm", () => {
	const { locale } = useI18n();

	const isLoading = ref<boolean>(false);
	const isPoolingProgress = ref<boolean>(true);
	const currentStep = ref<number>(1);
	const currentCurrency = ref<string | null>(null);
	const currentChain = ref<string | null>(null);
	const payerId = ref<string | null>(null);
	const payerEmail = ref<string | null>(null);
	const amlPaymentPhase = ref<TAmlPaymentPhase | null>(null);
	const amount = ref<number | null>(null);
	const rates = ref<Record<string, string> | null>(null);
	const store = ref<IPayerStoreResponse | null>(null);
	const addresses = ref<IPayerAddressResponse[]>([]);
	const arrayCurrencyIds = ref<string[]>([]);
	const transactionsConfirmed = ref<IWalletTransactionResponse[]>([]);
	const transactionsUnconfirmed = ref<IWalletTransactionResponse[]>([]);
	const blockedTransactions = ref<IBlockedTransactionItem[]>([]);
	const currentTransaction = ref<IWalletTransactionResponse | null>(null);
	const errorStore = ref<"error" | "store-disabled" | null>(null);
	const moneyCameAudioRef = ref<HTMLAudioElement | null>(null);
	const paymentFoundAudioRef = ref<HTMLAudioElement | null>(null);
	const stepMap = ref<Record<number, number>>({ 1: 1, 2: 2, 3: 3, 4: 3, 5: 4 });
	const timeline = ref<IPayerFormTimelineItem[]>([
		{
			id: 1,
			label: "Select currency",
			isActive: true,
			callback: () => ([4, 5].includes(currentStep.value) ? false : (currentStep.value = 1))
		},
		{
			id: 2,
			label: "select-blockchain.one",
			isActive: false,
			callback: () =>
				filteredBlockchains.value.length > 1 && ![4, 5].includes(currentStep.value) ? (currentStep.value = 2) : false
		},
		{ id: 3, label: "Sending a payment", isActive: false },
		{ id: 4, label: "Ready", isActive: false }
	]);

	const isShowAdvertising = computed<boolean>(() => ![3, 4, 5].includes(currentStep.value));
	const isShowBlockLatestTransactions = computed<boolean>(() => {
		return !errorStore.value && ![3, 4, 5].includes(currentStep.value) && Boolean(transactionsConfirmed.value.length);
	});

	const sidebarTransactions = computed<ILatestTransaction[]>(() => {
		const blockedByHash = new Map(blockedTransactions.value.map((item) => [item.tx_hash, item.blocked_transaction_id]));

		return transactionsConfirmed.value.map((transaction) => ({
			...transaction,
			blocked_transaction_id: blockedByHash.get(transaction.hash)
		}));
	});

	const loadBlockedTransactions = async () => {
		if (!payerId.value) {
			blockedTransactions.value = [];
			return;
		}

		try {
			blockedTransactions.value = await getApiWalletBlockedTransactions(payerId.value);
		} catch {
			blockedTransactions.value = [];
		}
	};

	const getPayerInfo = async (id: string) => {
		try {
			const data = await getApiPayerInfo(id, locale.value);
			if (data.store) store.value = data.store;
			if (data.rates) rates.value = data.rates;
			if (data.addresses) {
				addresses.value = data.addresses;
				arrayCurrencyIds.value = addresses.value.map((item) => item.currency.id).filter(Boolean);
			}
		} catch (error: any) {
			getError(error.status);
			throw error;
		}
	};

	const getStoreTopup = async (slug: string, external_id: string, email?: string) => {
		try {
			const data = await getApiStoreTopup(slug, external_id, locale.value, email);
			if (data.store) store.value = data.store;
			if (data.rates) rates.value = data.rates;
			if (data.wallet_id) payerId.value = data.wallet_id;
			if (data.addresses) {
				addresses.value = data.addresses;
				arrayCurrencyIds.value = addresses.value.map((item) => item.currency.id).filter(Boolean);
			}
		} catch (error: any) {
			getError(error.status);
			throw error;
		}
	};

	const getStartInfo = async (
		isStoreForm: boolean,
		slug?: string,
		externalId?: string,
		payerIdQuery?: string,
		email?: string
	) => {
		try {
			isLoading.value = true;
			payerEmail.value = email?.trim() || null;
			if (isStoreForm) {
				if (slug && externalId) await getStoreTopup(slug, externalId, email);
			} else {
				payerId.value = payerIdQuery || null;
				if (payerId.value) await getPayerInfo(payerId.value);
			}
			await loadBlockedTransactions();
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
			loaderShutdown();
		}
	};

	let amlPollTimeout: ReturnType<typeof setTimeout> | null = null;
	let amlPollCancelled = false;

	const clearAmlPolling = () => {
		amlPollCancelled = true;
		if (amlPollTimeout) {
			clearTimeout(amlPollTimeout);
			amlPollTimeout = null;
		}
	};

	const sleep = (ms: number) =>
		new Promise<void>((resolve) => {
			amlPollTimeout = setTimeout(resolve, ms);
		});

	const isTransactionBlocked = async (walletId: string, txHash: string): Promise<boolean> => {
		const blocked = await getApiWalletBlockedTransactions(walletId);
		return blocked.some((item) => item.tx_hash === txHash);
	};

	const persistAmlPhase = (phase: TAmlPaymentPhase) => {
		amlPaymentPhase.value = phase;
		if (!payerId.value || !currentTransaction.value) return;

		if (phase === AML_PAYMENT_PHASE.checking) {
			savePendingPaymentSession(payerId.value, currentTransaction.value, phase);
		} else {
			clearPendingPaymentSession();
		}
	};

	const startAmlPollingForCurrentTx = () => {
		const walletId = payerId.value;
		const txHash = currentTransaction.value?.hash;
		if (!walletId || !txHash) {
			persistAmlPhase(AML_PAYMENT_PHASE.passed);
			moneyCameAudioRef.value?.play();
			return;
		}
		clearAmlPolling();
		amlPollCancelled = false;
		persistAmlPhase(AML_PAYMENT_PHASE.checking);
		void resolveAmlPaymentPhase(walletId, txHash);
	};

	const resolveAmlPaymentPhase = async (walletId: string, txHash: string) => {
		persistAmlPhase(AML_PAYMENT_PHASE.checking);
		let nullPollCount = 0;

		while (!amlPollCancelled) {
			try {
				const check = await getApiWalletAmlCheck(walletId, txHash);

				if (!check) {
					nullPollCount += 1;
					if (nullPollCount >= AML_NULL_POLLS_BEFORE_SKIP) {
						persistAmlPhase(AML_PAYMENT_PHASE.passed);
						moneyCameAudioRef.value?.play();
						return;
					}
					await sleep(AML_POLL_INTERVAL_MS);
					continue;
				}

				nullPollCount = 0;

				if (check.in_progress || check.status === AML_CHECK_STATUS.pending) {
					persistAmlPhase(AML_PAYMENT_PHASE.checking);
					await sleep(AML_POLL_INTERVAL_MS);
					continue;
				}

				if (check.status === AML_CHECK_STATUS.failed) {
					persistAmlPhase(AML_PAYMENT_PHASE.failed);
					return;
				}

				const blocked = await isTransactionBlocked(walletId, txHash);
				if (blocked) await loadBlockedTransactions();
				persistAmlPhase(blocked ? AML_PAYMENT_PHASE.blocked : AML_PAYMENT_PHASE.passed);
				if (!blocked) moneyCameAudioRef.value?.play();
				return;
			} catch {
				await sleep(AML_POLL_INTERVAL_MS);
			}
		}
	};

	const applyPendingTransaction = (transaction: IWalletTransactionResponse) => {
		currentTransaction.value = transaction;
		currentCurrency.value = getCurrentCoin(transaction.currency_code);
		currentChain.value = getCurrentBlockchain(transaction.currency_code);
	};

	const restorePendingPaymentSession = async (): Promise<boolean> => {
		const session = readPendingPaymentSession();
		if (!session || !payerId.value) return false;
		if (session.wallet_id !== payerId.value) {
			clearPendingPaymentSession();
			return false;
		}

		if (session.aml_phase !== AML_PAYMENT_PHASE.checking) {
			clearPendingPaymentSession();
			return false;
		}

		const walletId = payerId.value;
		const txHash = session.transaction.hash;

		try {
			const check = await getApiWalletAmlCheck(walletId, txHash);

			if (check && !check.in_progress && check.status !== AML_CHECK_STATUS.pending) {
				clearPendingPaymentSession();
				return false;
			}
		} catch {
			clearPendingPaymentSession();
			return false;
		}

		applyPendingTransaction(session.transaction);
		isPoolingProgress.value = false;
		currentStep.value = 5;
		startAmlPollingForCurrentTx();
		return true;
	};

	const finishWithSuccess = (tx?: IWalletTransactionResponse | null) => {
		if (currentStep.value === 5) return;
		if (tx) currentTransaction.value = tx;
		isPoolingProgress.value = false;
		if (payerId.value) clearTransactionsSnapshot(TRANSACTIONS_LS_PREFIX, payerId.value);
		currentStep.value = 5;

		if (tx && payerId.value) {
			savePendingPaymentSession(payerId.value, tx, AML_PAYMENT_PHASE.checking);
			startAmlPollingForCurrentTx();
			return;
		}

		amlPaymentPhase.value = AML_PAYMENT_PHASE.passed;
		moneyCameAudioRef.value?.play();
	};

	const getWalletTxFind = async (id: string) => {
		try {
			const data = await getApiWalletTxFind(id);
			if (data.confirmed) {
				transactionsConfirmed.value = data.confirmed.slice(0, 9).map((transaction) => ({
					...transaction,
					is_less_than_1_hour: isLessThan1Hour(transaction.created_at, new Date().toISOString())
				}));
			}
			if (data.unconfirmed) transactionsUnconfirmed.value = data.unconfirmed;

			const transactionsLs = readTransactionsSnapshot(TRANSACTIONS_LS_PREFIX, id);
			if (!transactionsLs) {
				writeTransactionsSnapshot(TRANSACTIONS_LS_PREFIX, id, {
					confirmed: transactionsConfirmed.value,
					unconfirmed: transactionsUnconfirmed.value
				});
				return;
			}
			// Step 3: new unconfirmed → step 4; new confirmed (skipped unconfirmed) → step 5
			if (currentStep.value === 3) {
				const newUnconfirmed = checkForNewUnconfirmedTransactions(transactionsLs);
				if (newUnconfirmed.length) {
					currentTransaction.value = newUnconfirmed[0];
					currentStep.value = 4;
					paymentFoundAudioRef.value?.play();
					return;
				}
				const newConfirmed = checkForNewConfirmedTransactions(transactionsLs);
				if (newConfirmed.length) {
					finishWithSuccess(newConfirmed[0]);
					return;
				}
			}
			// Step 4: tracked tx moved to confirmed → success receipt
			if (currentStep.value === 4) {
				const find = transactionsConfirmed.value.find((item) => item.hash === currentTransaction.value?.hash);
				if (find) {
					finishWithSuccess(find);
					return;
				}
			}
		} catch (error: any) {
			throw error;
		} finally {
			void loadBlockedTransactions();
		}
	};

	const currentCurrencyChainId = computed<string | null>(() => {
		if (!currentCurrency.value || !currentChain.value) return null;
		return `${currentCurrency.value}.${currentChain.value}`;
	});

	const currentAddress = computed<string | null>(() => {
		if (!currentCurrencyChainId.value) return null;
		const findAddress = addresses.value.find((item) => item.currency.id === currentCurrencyChainId.value);
		return findAddress ? findAddress.address : null;
	});

	const filteredBlockchains = computed<IPayerAddressResponse[]>(() => {
		if (!currentCurrency.value) return [];
		const filteredCurrency: IPayerAddressResponse[] = addresses.value.filter(
			(item) => currentCurrency.value === getCurrentCoin(item.currency.id)
		);
		const unique = new Map<BlockchainType, IPayerAddressResponse>();
		filteredCurrency.forEach((item) => {
			if (!unique.has(item.currency.id)) unique.set(item.currency.id, item);
		});
		return Array.from(unique.values()).sort((a, b) => {
			const aChain = getCurrentBlockchain(a.currency.id);
			const bChain = getCurrentBlockchain(b.currency.id);
			const ia = SORT_CHAIN.indexOf(aChain);
			const ib = SORT_CHAIN.indexOf(bChain);
			const ra = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
			const rb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
			return ra === rb ? aChain.localeCompare(bChain) : ra - rb;
		});
	});

	const filteredCurrencies = computed<IPayerAddressResponse[]>(() => {
		const unique = new Map<CurrencyType, IPayerAddressResponse>();
		addresses.value.forEach((item) => {
			const coin = getCurrentCoin(item.currency.id) as CurrencyType;
			if (!unique.has(coin)) {
				const blockchains = addresses.value
					.filter((el) => getCurrentCoin(el.currency.id) === coin)
					.map((c) => changeChainBsc(getCurrentBlockchain(c.currency.id)))
					.filter(Boolean) as string[];
				const sortedBlockchains = [...new Set(blockchains)].sort((a, b) => {
					const ia = SORT_CHAIN.indexOf(a);
					const ib = SORT_CHAIN.indexOf(b);
					const ra = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
					const rb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
					return ra === rb ? a.localeCompare(b) : ra - rb;
				});
				unique.set(coin, {
					...item,
					currency: {
						...item.currency,
						blockchains: sortedBlockchains.map((item) => ({ blockchain: item, isActive: false }))
					}
				});
			}
		});
		return Array.from(unique.values());
	});

	const getAmountRate = (currency: CurrencyType): string => {
		if (!amount.value || !rates.value || !currency) return "0";
		const find = Object.entries(rates.value).find((item) => item[0].includes(currency));
		if (!find) return "0";
		const result: number = amount.value / parseFloat(find[1]);
		return formatAmountBlockchain(result, { currencyId: find[0], errorValue: "0" });
	};

	const checkValidationCurrencyAndChain = (
		token?: string | null,
		chain?: string | null,
		currencyId?: string | null
	): boolean => {
		if (currencyId) return arrayCurrencyIds.value.includes(currencyId);
		if (token && chain) return arrayCurrencyIds.value.includes(`${token}.${chain}`);
		if (token) return arrayCurrencyIds.value.some((item) => getCurrentCoin(item) === token);
		if (chain) return arrayCurrencyIds.value.some((item) => getCurrentBlockchain(item) === chain);
		return false;
	};

	const checkForNewUnconfirmedTransactions = (
		transactionsLs: ITransactionsLsSnapshot
	): IWalletTransactionResponse[] => {
		if (!currentCurrencyChainId.value) return [];
		return transactionsUnconfirmed.value.filter(
			(newTx) =>
				Boolean(newTx.hash) &&
				newTx.currency_code === currentCurrencyChainId.value &&
				!transactionsLs.unconfirmed.some((oldTx) => oldTx.hash === newTx.hash)
		);
	};

	const checkForNewConfirmedTransactions = (transactionsLs: ITransactionsLsSnapshot): IWalletTransactionResponse[] => {
		if (!currentCurrencyChainId.value) return [];
		return transactionsConfirmed.value.filter(
			(newTx) =>
				Boolean(newTx.hash) &&
				newTx.currency_code === currentCurrencyChainId.value &&
				!transactionsLs.confirmed.some((oldTx) => oldTx.hash === newTx.hash)
		);
	};

	const getError = (code: number) => {
		errorStore.value = code === 410 ? "store-disabled" : "error";
		timeline.value.forEach((item) => (item.isActive = false));
	};

	return {
		isLoading,
		currentChain,
		currentCurrency,
		currentStep,
		amount,
		payerId,
		payerEmail,
		amlPaymentPhase,
		timeline,
		isPoolingProgress,
		rates,
		store,
		addresses,
		transactionsConfirmed,
		transactionsUnconfirmed,
		blockedTransactions,
		sidebarTransactions,
		arrayCurrencyIds,
		currentTransaction,
		errorStore,
		currentCurrencyChainId,
		currentAddress,
		filteredBlockchains,
		isShowAdvertising,
		isShowBlockLatestTransactions,
		stepMap,
		filteredCurrencies,
		moneyCameAudioRef,
		paymentFoundAudioRef,

		getAmountRate,
		getPayerInfo,
		getWalletTxFind,
		getStoreTopup,
		checkValidationCurrencyAndChain,
		getStartInfo,
		clearAmlPolling,
		restorePendingPaymentSession,
		loadBlockedTransactions
	};
});
