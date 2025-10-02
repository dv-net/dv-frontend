import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getApiPayerInfo, getApiStoreTopup, getApiWalletTxFind } from "@pay/services/api/payerForm";
import type {
	IPayerAddressResponse,
	IWalletTransactionResponse,
	IPayerStoreResponse
} from "@pay/utils/types/api/apiGo.ts";
import { useI18n } from "vue-i18n";
import { formatAmountBlockchain, getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
import type { BlockchainType } from "@shared/utils/types/blockchain";
import type { CurrencyType } from "@pay/utils/types/blockchain";

export const usePayerFormStore = defineStore("payerForm", () => {
	const { locale } = useI18n();

	const isLoading = ref<boolean>(false);
	const isPoolingProgress = ref<boolean>(true);
	const currentStep = ref<number>(1);
	const currentCurrency = ref<string | null>(null);
	const currentChain = ref<string | null>(null);
	const payerId = ref<string | null>(null);
	const amount = ref<number | null>(null);
	const rates = ref<Record<string, string> | null>(null);
	const store = ref<IPayerStoreResponse | null>(null);
	const addresses = ref<IPayerAddressResponse[]>([]);
	const arrayCurrencyIds = ref<string[]>([]);
	const transactionsConfirmed = ref<IWalletTransactionResponse[]>([]);
	const transactionsUnconfirmed = ref<IWalletTransactionResponse[]>([]);
	const currentTransaction = ref<IWalletTransactionResponse | null>(null);
	const errorStore = ref<"error" | "store-disabled" | null>(null);
	const stepMap = ref<Record<number, number>>({
		1: 1, 2: 2, 3: 3, 4: 3, 5: 4,
	});
	const timeline = ref([
		{ id: 1, label: "Select currency", isActive: true },
		{ id: 2, label: "select-blockchain.one", isActive: false },
		{ id: 3, label: "Sending a payment", isActive: false },
		{ id: 4, label: "Ready", isActive: false }
	]);

	const isShowAdvertising = computed<boolean>(() => ![4,5].includes(currentStep.value));

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
			if (isStoreForm) {
				if (slug && externalId) await getStoreTopup(slug, externalId, email);
			} else {
				payerId.value = payerIdQuery || null;
				if (payerId.value) await getPayerInfo(payerId.value);
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const getWalletTxFind = async (id: string) => {
		try {
			const data = await getApiWalletTxFind(id);
			if (data.confirmed) transactionsConfirmed.value = data.confirmed;
			if (data.unconfirmed) transactionsUnconfirmed.value = data.unconfirmed;
			const transactionsLs = localStorage.getItem("transactions");
			if (!transactionsLs) {
				return localStorage.setItem("transactions", JSON.stringify(data));
			}
			// Wait for transaction to appear in Unconfirmed
			if (currentStep.value === 3) {
				const newTransactions = checkForNewTransactions(transactionsLs);
				if (newTransactions.length) {
					currentTransaction.value = newTransactions[0];
					return (currentStep.value = 4);
				}
			}
			// Wait for transaction to appear in Confirmed (this means payment has passed)
			if (currentStep.value === 4) {
				const find = transactionsConfirmed.value.find((item) => item.hash === currentTransaction.value?.hash);
				if (find) {
					// Payment has passed, remove polling getWalletTxFind
					isPoolingProgress.value = false;
					localStorage.removeItem("transactions");
					return (currentStep.value = 5);
				}
			}
		} catch (error: any) {
			throw error;
		}
	};

	const currentAddress = computed<string | null>(() => {
		if (!currentChain.value || !currentCurrency.value) return null;
		const currencyId: string = `${currentCurrency.value}.${currentChain.value}`;
		const findAddress = addresses.value.find((item) => item.currency.id === currencyId);
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
		return Array.from(unique.values());
	});

	const getAmountRate = (currency: CurrencyType): string => {
		if (!amount.value || !rates.value || !currency) return "—";
		const find = Object.entries(rates.value).find((item) => item[0].includes(currency));
		if (!find) return "—";
		const result: number = amount.value / parseFloat(find[1]);
		return formatAmountBlockchain(result, find[0]);
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

	const checkForNewTransactions = (transactionsLs: string) => {
		const { unconfirmed } = JSON.parse(transactionsLs);
		return transactionsUnconfirmed.value.filter(
			(newTx) =>
				newTx.currency_code === `${currentCurrency.value}.${currentChain.value}` &&
				!unconfirmed.some((oldTx: IWalletTransactionResponse) => oldTx.hash === newTx.hash)
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
		currentAddress,
		filteredBlockchains,
		isShowAdvertising,
		stepMap,
		getAmountRate,
		getPayerInfo,
		getWalletTxFind,
		getStoreTopup,
		checkValidationCurrencyAndChain,
		getStartInfo
	};
});
