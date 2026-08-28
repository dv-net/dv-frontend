import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getApiInvoice, getApiInvoiceStatus } from "@pay-simple/utils/services/payerForm.ts";
import type { IPayerAddressResponse, IPayerStoreResponse } from "@pay-shared/utils/types/payer";
import type { IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";
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
import type { IPayerFormTimelineItem } from "@pay-shared/utils/types/payerForm";
import {
	mapPaySimpleInvoiceToPayerResponse,
	mapPaySimplePaymentToTransaction
} from "@pay-simple/utils/helpers/mapPaySimpleInvoice";
import type { IPaySimpleInvoice, InvoiceStatus } from "@pay-simple/utils/types/paySimple";
import { isInvoiceFinalStatus, isInvoiceSuccessStatus } from "@pay-simple/utils/types/paySimple";
import { TRANSACTIONS_LS_KEY } from "@pay-simple/utils/constants/payerForm";

export const usePayerFormStore = defineStore("payerForm", () => {
	const isLoading = ref<boolean>(false);
	const isPreparingWallets = ref<boolean>(false);
	const isPoolingProgress = ref<boolean>(true);
	const currentStep = ref<number>(1);
	const currentCurrency = ref<string | null>(null);
	const currentChain = ref<string | null>(null);
	const payerId = ref<string | null>(null);
	const invoiceUuid = ref<string | null>(null);
	const amount = ref<number | null>(null);
	const rates = ref<Record<string, string> | null>(null);
	const store = ref<IPayerStoreResponse | null>(null);
	const invoice = ref<IPaySimpleInvoice | null>(null);
	const addresses = ref<IPayerAddressResponse[]>([]);
	const arrayCurrencyIds = ref<string[]>([]);
	const transactionsConfirmed = ref<IWalletTransactionResponse[]>([]);
	const transactionsUnconfirmed = ref<IWalletTransactionResponse[]>([]);
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

	const invoiceCurrency = computed<string>(() => invoice.value?.currency || store.value?.currency_id || "USD");

	const isShowAdvertising = computed<boolean>(() => ![3, 4, 5].includes(currentStep.value));
	const isShowBlockLatestTransactions = computed<boolean>(() => {
		return !errorStore.value && ![3, 4, 5].includes(currentStep.value) && Boolean(transactionsConfirmed.value.length);
	});

	const applyPayerData = (mapped: ReturnType<typeof mapPaySimpleInvoiceToPayerResponse>, invoiceData: IPaySimpleInvoice) => {
		store.value = mapped.store;
		rates.value = mapped.rates;
		addresses.value = mapped.addresses;
		arrayCurrencyIds.value = mapped.addresses.map((item) => item.currency.id).filter(Boolean);
		invoice.value = invoiceData;
		amount.value = invoiceData.amount;
	};

	const getInvoiceInfo = async (uuid: string) => {
		try {
			const data = await getApiInvoice(uuid);
			applyPayerData(mapPaySimpleInvoiceToPayerResponse(data), data.invoice);
			return data.invoice;
		} catch (error: any) {
			getError(error?.response?.status ?? error?.status);
			throw error;
		}
	};

	const getStartInfo = async (uuid?: string) => {
		try {
			isLoading.value = true;
			invoiceUuid.value = uuid || null;
			payerId.value = uuid || null;
			if (invoiceUuid.value) await getInvoiceInfo(invoiceUuid.value);
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
			isPreparingWallets.value = !errorStore.value && addresses.value.length === 0;
			loaderShutdown();
		}
	};

	/** Re-fetches the invoice (and wallets) without the initial loading skeleton. */
	const pollWalletsInfo = async (): Promise<boolean> => {
		try {
			if (invoiceUuid.value) await getInvoiceInfo(invoiceUuid.value);
			if (addresses.value.length > 0) {
				isPreparingWallets.value = false;
				return true;
			}
			return false;
		} catch (error: any) {
			isPreparingWallets.value = false;
			throw error;
		}
	};

	const syncInvoiceStatus = (status: InvoiceStatus) => {
		if (!invoice.value) return;
		invoice.value = { ...invoice.value, status };
	};

	const finishWithFailure = () => {
		isPoolingProgress.value = false;
		errorStore.value = "error";
		timeline.value.forEach((item) => (item.isActive = false));
		if (invoice.value?.failure_redirect_url) {
			window.location.href = invoice.value.failure_redirect_url;
		}
	};

	const finishWithSuccess = (tx?: IWalletTransactionResponse | null, options?: { redirect?: boolean }) => {
		if (currentStep.value === 5) return;
		if (tx) currentTransaction.value = tx;
		isPoolingProgress.value = false;
		localStorage.removeItem(TRANSACTIONS_LS_KEY);
		currentStep.value = 5;
		moneyCameAudioRef.value?.play();
		if (options?.redirect && invoice.value?.success_redirect_url) {
			window.location.href = invoice.value.success_redirect_url;
		}
	};

	/**
	 * Polls `/public/invoices/{uuid}/status`.
	 * Step 3 → new unconfirmed → 4 → confirmed → 5.
	 * If payment appears only in confirmed (skipped unconfirmed) → jump to 5 from step 3.
	 * After refresh, step 5 is restored only for fully paid dynamic invoices (paid/overpaid).
	 */
	const getInvoiceStatusPoll = async (uuid: string) => {
		try {
			const data = await getApiInvoiceStatus(uuid);
			syncInvoiceStatus(data.invoice.status);

			const createdAt = invoice.value?.created_at;
			transactionsConfirmed.value = data.confirmed.slice(0, 9).map((payment) => {
				const mapped = mapPaySimplePaymentToTransaction(payment, createdAt);
				return {
					...mapped,
					is_less_than_1_hour: isLessThan1Hour(mapped.created_at, new Date().toISOString())
				};
			});
			transactionsUnconfirmed.value = data.unconfirmed.map((payment) =>
				mapPaySimplePaymentToTransaction(payment, createdAt)
			);

			if (data.invoice.status === "cancelled" || data.invoice.status === "expired") {
				finishWithFailure();
				return;
			}

			// Fully paid dynamic invoice — keep user on success step even after refresh
			if (isInvoiceSuccessStatus(data.invoice.status)) {
				finishWithSuccess(transactionsConfirmed.value[0] || currentTransaction.value, { redirect: true });
				return;
			}

			const transactionsLs = localStorage.getItem(TRANSACTIONS_LS_KEY);
			if (!transactionsLs) {
				localStorage.setItem(
					TRANSACTIONS_LS_KEY,
					JSON.stringify({
						confirmed: transactionsConfirmed.value,
						unconfirmed: transactionsUnconfirmed.value
					})
				);
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
					finishWithSuccess(newConfirmed[0], { redirect: isInvoiceSuccessStatus(data.invoice.status) });
					return;
				}
			}

			// Step 4: tracked tx moved to confirmed → success receipt
			if (currentStep.value === 4) {
				const find = transactionsConfirmed.value.find((item) => item.hash === currentTransaction.value?.hash);
				if (find) {
					finishWithSuccess(find, { redirect: isInvoiceSuccessStatus(data.invoice.status) });
					return;
				}
				if (isInvoiceFinalStatus(data.invoice.status)) {
					isPoolingProgress.value = false;
				}
			}
		} catch (error: any) {
			throw error;
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
		return Array.from(unique.values()).sort((a, b) => {
			const aSort = a.currency.sort_order ?? Number.MAX_SAFE_INTEGER;
			const bSort = b.currency.sort_order ?? Number.MAX_SAFE_INTEGER;
			return aSort - bSort;
		});
	});

	const getAmountRate = (currency: CurrencyType): string => {
		if (!amount.value || !rates.value || !currency) return "0";
		// Exact id first, then coin part only (BNB ≠ USDC.BNBSmartChain)
		const entries = Object.entries(rates.value);
		const find =
			entries.find(([key]) => key === currency) ||
			entries.find(([key]) => getCurrentCoin(key) === currency);
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

	const checkForNewUnconfirmedTransactions = (transactionsLs: string): IWalletTransactionResponse[] => {
		const { unconfirmed } = JSON.parse(transactionsLs);
		if (!currentCurrencyChainId.value) return [];
		return transactionsUnconfirmed.value.filter(
			(newTx) =>
				newTx.currency_code === currentCurrencyChainId.value &&
				!unconfirmed.some((oldTx: IWalletTransactionResponse) => oldTx.hash === newTx.hash)
		);
	};

	const checkForNewConfirmedTransactions = (transactionsLs: string): IWalletTransactionResponse[] => {
		const { confirmed } = JSON.parse(transactionsLs);
		if (!currentCurrencyChainId.value) return [];
		return transactionsConfirmed.value.filter(
			(newTx) =>
				newTx.currency_code === currentCurrencyChainId.value &&
				!confirmed.some((oldTx: IWalletTransactionResponse) => oldTx.hash === newTx.hash)
		);
	};

	const getError = (code?: number) => {
		errorStore.value = code === 410 ? "store-disabled" : "error";
		timeline.value.forEach((item) => (item.isActive = false));
	};

	return {
		isLoading,
		isPreparingWallets,
		currentChain,
		currentCurrency,
		currentStep,
		amount,
		payerId,
		invoiceUuid,
		invoice,
		invoiceCurrency,
		timeline,
		isPoolingProgress,
		rates,
		store,
		addresses,
		transactionsConfirmed,
		transactionsUnconfirmed,
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
		getInvoiceInfo,
		getInvoiceStatusPoll,
		checkValidationCurrencyAndChain,
		getStartInfo,
		pollWalletsInfo
	};
});
