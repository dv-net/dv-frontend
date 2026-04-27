export interface INavLinks {
	id: number;
	iconName: string;
	link: string;
	text: string;
}

export interface IPayerFormTimelineItem {
	id: number;
	label: string;
	isActive: boolean;
	callback?: () => number | false;
}

// TODO: Delete later
// interface IPayerFormStore {
// 	isLoading: Ref<boolean>;
// 	currentChain: Ref<string | null>;
// 	currentCurrency: Ref<string | null>;
// 	currentStep: Ref<number>;
// 	amount: Ref<number | null>;
// 	payerId: Ref<string | null>;
// 	timeline: Ref<IPayerFormTimelineItem[]>;
// 	isPoolingProgress: Ref<boolean>;
// 	rates: Ref<Record<string, string> | null>;
// 	store: Ref<IPayerStoreResponse | null>;
// 	addresses: Ref<IPayerAddressResponse[]>;
// 	transactionsConfirmed: Ref<IWalletTransactionResponse[]>;
// 	transactionsUnconfirmed: Ref<IWalletTransactionResponse[]>;
// 	arrayCurrencyIds: Ref<string[]>;
// 	currentTransaction: Ref<IWalletTransactionResponse | null>;
// 	errorStore: Ref<"error" | "store-disabled" | null>;
// 	currentAddress: ComputedRef<string | null>;
// 	filteredBlockchains: ComputedRef<IPayerAddressResponse[]>;
// 	isShowAdvertising: ComputedRef<boolean>;
// 	isShowBlockLatestTransactions: ComputedRef<boolean>;
// 	stepMap: Ref<Record<number, number>>;
// 	filteredCurrencies: ComputedRef<IPayerAddressResponse[]>;
// 	moneyCameAudioRef: Ref<any>;
// 	paymentFoundAudioRef: Ref<any>;
// 	getAmountRate: (currency: CurrencyType) => string;
// 	getPayerInfo: (id: string) => Promise<void>;
// 	getWalletTxFind: (id: string) => Promise<void>;
// 	getStoreTopup: (slug: string, external_id: string, email?: string) => Promise<void>;
// 	checkValidationCurrencyAndChain: (
// 		token?: string | null,
// 		chain?: string | null,
// 		currencyId?: string | null
// 	) => boolean;
// 	getStartInfo: (
// 		isStoreForm: boolean,
// 		slug?: string,
// 		externalId?: string,
// 		payerIdQuery?: string,
// 		email?: string
// 	) => Promise<void>;
// }
