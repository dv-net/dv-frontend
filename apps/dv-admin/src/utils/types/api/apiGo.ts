import type { BlockchainType } from "@shared/utils/types/blockchain";
import { USER_ROLES } from "@dv-admin/utils/constants/user";
import type { ENUM_SEARCH_TYPES } from "@dv-admin/utils/constants/search";

export interface IPagination {
	page: number;
	total: number;
	page_size: number;
	last_page: number;
	current_page?: number;
	per_page?: number;
}

export interface IDefaultObj {
	[key: string]: string;
}

export interface ISignInRequest {
	email: string;
	password: string;
	remember_me?: boolean;
}

export interface ISignUpRequest {
	email: string;
	password: string;
	password_confirmation: string;
	"cf-turnstile-response": string;
	location?: string;
	language?: string;
}

export interface IUserResponse {
	id: string;
	email: string;
	email_verified_at: string | null;
	location: string;
	language: string;
	processing_owner_id: string;
	rate_scale: string;
	rate_source: string;
	created_at: string | null;
	updated_at: string | null;
	roles: USER_ROLES[];
}

export interface IChangePasswordRequest {
	password_old: string;
	password_new: string;
	password_confirmation: string;
}

export interface IUser2FaResponse {
	is_confirmed: boolean;
	secret: string;
}

export interface IOwnerDataResponse {
	is_authorized: boolean;
	balance: string | null;
	owner_id: string;
	telegram: string | null;
}

export interface IUser2FaRequest {
	otp: string;
}

export interface IUserChangeEmailRequest {
	code: string;
	new_email: string;
	new_email_confirmation: string;
}

export interface IUserTgLinkResponse {
	link: string;
	code: string;
}

export interface IStoreRequest {
	name: string;
	site: string | null;
}

export interface IStoreResponse {
	id: string;
	user_id: string;
	name: string;
	site: string | null;
	currency_id: string;
	rate_source: string;
	public_payment_form_enabled: boolean;
	return_url: string | null;
	success_url: string | null;
	rate_scale: number | null;
	status: boolean;
	minimal_payment: number;
	created_at: string;
	updated_at: string | null;
	deleted_at: string | null;
}

export interface IStoreApiKeyResponse {
	id: string;
	enabled: boolean;
	key: string;
	store_id: string;
	updated_at: string | null;
	created_at: string | null;
}

export interface IWhitelistsPatchRequest {
	ip: string | null;
}

export interface IWhitelistsResponse {
	ip: string;
}

export interface IStoreGeneralSettingsList {
	name: string;
	is_editable: boolean;
	two_factor_verification_required: boolean;
	available_values: string[];
}
export interface IStoreSettingsResponse extends IStoreGeneralSettingsList {
	value: string;
}
export interface IStoreSettingsList extends IStoreGeneralSettingsList {
	value: boolean;
}

export interface IStoreWebhooksResponse {
	id?: string;
	label: string;
	description: string;
	history?: IStoreHistoryWebhooks;
	url: string;
	enabled: boolean;
	events: string[];
	tooltip: string;
}

export interface IStoreWebhookTestRequest {
	event_type: string;
	wh_id: string;
}

export interface IStoreWebhookTestResponse {
	request_body: string;
	response_body: string;
	response_status: string;
	response_code: number;
}

export interface IDictionaryCurrency {
	id: BlockchainType;
	code: string;
	name: string;
	blockchain: string;
	precision: number;
	is_bitcoin_like: boolean;
	is_evm_like: boolean;
}

export interface IDictionary {
	available_currencies: IDictionaryCurrency[];
	available_rate_sources: string[];
	backend_version_hash: string;
	backend_version_tag: string;
	processing_version_hash: string;
	processing_version_tag: string;
	backend_address: string;
	available_aml_providers: string[];
	general_settings: {
		name: string;
		value: string;
	}[];
}

export interface ISystemVersions {
	new_backend_version?: {
		name: string;
		available_version: string;
		installed_version: string;
		need_for_update: boolean;
	};
	new_processing_version?: {
		name: string;
		available_version: string;
		installed_version: string;
		need_for_update: boolean;
	};
}

export interface IDictionaryItemTimezones {
	value: string;
	label: string;
}

export interface ICurrencyRequest {
	currency_ids: string[];
}

export interface ICurrencyStore {
	currency_id: BlockchainType;
	code: string;
	name: string;
	enabled: boolean;
}

export interface IExternalWalletRequest {
	amount: number | null;
	email: string | null;
	store_id: string | null;
	store_external_id: string | null;
	currency: string | null;
}

export interface IWalletSeedsResponse {
	mnemonic?: string;
	pass_phrase?: string;
}

export interface IWalletKeysResponse {
	keys?: any;
}

export interface IStoreHistoryWebhooks {
	id: string;
	created_at: string;
	url: string;
	transaction_id?: string;
	request: string;
	response: string;
	is_success: boolean;
	status_code: number;
	wh_type?: string;
	store_id?: string;
}

export interface IStoreHistoryWebhooksResponse {
	items: IStoreHistoryWebhooks[];
	next_page_exists: boolean;
}

export interface IStoreHistoryWebhooksRequest {
	store_uuids?: string[];
	page: number;
	page_size: number;
	next_page_exists?: boolean;
}

export interface ISystemInfoResponse {
	initialized: boolean;
	root_user_exists: boolean;
	registration_state: "enabled" | "disabled";
	app_profile: "demo" | "prod" | "dev"; // dev - debug mode
	is_captcha_enabled: boolean;
	site_key: string;
}

export interface ISettingData {
	general: ISettingsResponse[];
	processing: ISettingsResponse[];
	mailer: ISettingsResponse[];
}

export interface IProcessingDataClientRequest {
	host: string;
	callback_domain: string;
	merchant_domain: string;
	merchant_pay_form_domain: string;
}

export interface IProcessingDataClientResponse {
	base_url: string;
	processing_client_id: string;
	processing_client_key: string;
}

export interface IHotWalletsRequest {
	amount: number | null;
	currency_id: string | null;
	page: number;
	page_size: number;
	store_ids: string[];
	balance_fiat_from: number | null;
	balance_fiat_to: number | null;
	is_sort_by_balance: boolean | null;
	address: string | null;
}

export interface IHotWalletsItem {
	id: string;
	address: string;
	amount: string;
	amount_usd: string;
	blockchain: string;
	wallet_id: string;
	currency_id: BlockchainType;
	dirty: boolean;
	isSelected: boolean;
}

export interface IHotWalletsPagination {
	last_page: number;
	page: number;
	page_size: number;
	total: number;
}

export interface IHotWalletsResponse {
	items: IHotWalletsItem[];
	pagination: IHotWalletsPagination;
}

export interface IWalletSummaryResponse {
	balance: string;
	balance_usd: string;
	count: number;
	count_with_balance: number;
	currency: IDictionaryCurrency;
}

export interface ITransactionDashboardItem {
	id: string;
	user_id: string;
	store_id: string;
	receipt_id: string;
	wallet_id: string;
	currency_id: string;
	blockchain: string;
	tx_hash: string;
	bc_uniq_key: string;
	type: string;
	from_address: string;
	to_address: string;
	amount: string;
	amount_usd: string;
	user_email: string;
	untrusted_email: string;
	fee: string;
	withdrawal_is_manual: boolean;
	network_created_at: string;
	updated_at: string | null;
	created_at: string | null;
	created_at_index: number;
	currency: IDictionaryCurrency;
}

export interface ITransactionRequest {
	page: number;
	page_size: number;
	type: string | null;
	currencies?: string | null;
	date?: string;
	blockchain?: string;
	wallet_address?: string;
	min_amount_usd?: string | null;
	date_from?: string | null;
	date_to?: string | null;
	resolution?: string | null;
	sort_by?: string | null;
	sort_direction?: string | null;
}

export type showedHistoryTableType = "transactions" | "exchange" | "withdrawal";

export interface ITransactionDashboardResponse {
	items: ITransactionDashboardItem[];
	pagination: IPagination;
}

export interface ITransactionStatsResponse {
	date: string;
	currency_id: string;
	amount_usd: string;
}

export interface IWithdrawalAddressItemResponse {
	address: string;
	updated_at: string | null;
	created_at: string | null;
	deleted_at: string | null;
	name: string | null;
	id: string;
	withdrawal_wallet_id: string;
}

export interface IWithdrawalRulesResponse {
	addressees: IWithdrawalAddressItemResponse[];
	currency: IDictionaryCurrency;
	low_balance_rules: {
		manual_address: string | null;
		mode: string;
	};
	id: string;
	interval: string;
	ruleSelect?: string;
	native_balance: string;
	usd_balance: string | null;
	rate: string;
	status: string;
}

export interface IWithdrawalRulesRequest {
	interval: string;
	min_balance: number | null;
	min_balance_usd: number | null;
	status: string;
	low_balance_rules?: {
		manual_address: string | null;
		mode: string;
	};
}

export interface IWithdrawalRules {
	amount: number | null;
	lowBalanceRule: string;
	lowBalanceAddress: string | null;
}

export interface IWithdrawalAddressItemRequest {
	address: string;
	name: string | null;
}

export interface IWithdrawalAddressRequest {
	addresses: IWithdrawalAddressItemRequest[];
	totp: string;
}

export interface ITransferPrefetchResponse {
	from_addresses: string[];
	to_addresses: string[];
	amount: string;
	amount_usd: string;
	currency: IDictionaryCurrency;
	type: string;
}

export interface ITransferItem {
	id: string;
	number: number;
	user_id: string;
	kind: string;
	currency_id: BlockchainType;
	status: string;
	step: string;
	from_addresses: string[];
	to_addresses: string[];
	amount: string;
	tx_hash?: string;
	amount_usd: string;
	message: string | null;
	created_at: string | null;
	updated_at: string | null;
}

export interface ITransferResponse {
	items: ITransferItem[];
	pagination: IPagination;
}

export interface ITransferRequest {
	stages: string[];
	page?: number;
	page_size?: number;
}

export interface IAdminUsersItemResponse {
	banned: boolean;
	email: string;
	user_id: string;
	roles: string[];
	created_at: string;
}

export interface IAdminUsersResponse {
	items: IAdminUsersItemResponse[];
	pagination: IPagination;
}

export interface IProcessingWalletsResponse {
	address: string;
	additional_data?: any;
	assets: IProcessingWalletsAssets[];
	balance: {
		native_token: string;
		native_token_usd: string;
	};
	blockchain: string;
	currency: IDictionaryCurrency;
}

export type IProcessingWalletsAssets = {
	currency_id: string;
	amount: string;
	amount_usd: string;
	identity: string;
};

export type IWithdrawalFromProcessingRequest = {
	address_to: string;
	amount: number | null;
	currency_id: string;
	totp: string;
	request_id: string;
};

export type IDepositSummaryDetailsCurrencyResponse = {
	[key in BlockchainType]: {
		tx_count: number;
		sum_usd: string;
	};
};

export interface IDepositSummaryResponse {
	details_by_currency: IDepositSummaryDetailsCurrencyResponse;
	date: string;
	sum_usd: string;
	transactions_count: number;
	type: string;
}

export interface IDepositSummaryRequest {
	date_from?: string | null;
	date_to?: string | null;
	currency_ids?: string[];
	store_uuids?: string[];
	resolution?: string;
}

export interface ITronResourceExpensesRequest {
	date_from: string | null;
	date_to: string | null;
	resolution: string;
}

export interface ITronResourceExpensesResponse {
	[key: string]: {
		staked_bandwidth: string;
		staked_energy: string;
		delegated_energy: string;
		delegated_bandwidth: string;
		available_bandwidth: string;
		available_energy: string;
		transfer_count: number;
		total_trx_fee: string;
		total_bandwidth_used: string;
		total_energy_used: string;
	};
}

export interface IOneTransactionWalletResponse {
	id: string;
	store_external_id: string;
	wallet_created_at: string;
	wallet_store_id: string;
	wallet_updated_at: string | null;
}

export interface IOneTransactionWebhookHistoryResponse {
	created_at: string;
	request: string;
	response: string;
	is_success: boolean;
	url: string;
	status_code: number;
	id: string;
	wh_type?: string;
	store_id?: string;
}

export interface IOneTransactionResponse {
	amount: string;
	amount_usd: string;
	bc_uniq_key: string;
	blockchain: BlockchainType;
	created_at: string;
	currency_id: string;
	fee: string;
	from_address: string;
	id: string;
	is_confirmed: boolean;
	network_created_at: string;
	receipt_id: string | null;
	store_id: string;
	to_address: string;
	tx_hash: string;
	type: string;
	updated_at: string | null;
	user_id: string;
	wallet: IOneTransactionWalletResponse | null;
	webhook_history: IOneTransactionWebhookHistoryResponse[];
	withdrawal_is_manual: boolean;
}

export interface IReceiptOneTransactionResponse {
	id: string;
	currency_id: BlockchainType;
	amount: string;
	status: string;
	store_id: string;
	created_at: string;
	updated_at: string;
	wallet_id: string;
}

export interface IWalletInfoBlockchainAssetResponse {
	currency: BlockchainType;
	amount: string;
	amount_usd: string;
	tx_count: string;
	total_deposit: string;
}

export interface IWalletInfoBlockchainResponse {
	blockchain: string;
	assets: IWalletInfoBlockchainAssetResponse[];
}

export interface IWalletInfoResponse {
	wallet_id: string;
	store_external_id: string;
	email: string | null;
	address: string;
	store_name: string;
	store_id: string;
	total_tx: string;
	wallet_created_at: string;
	logs: {
		updated_at: string | null;
		created_at: string | null;
		text: string;
		text_variables: {
			address: string;
			ip: string;
		};
	}[];
	blockchains: IWalletInfoBlockchainResponse[];
}

export interface ISearchDataResponse {
	search_type: ENUM_SEARCH_TYPES;
	data: IWalletInfoResponse[] | IOneTransactionResponse;
}

export interface IExchangeListKeysResponse {
	name: string;
	value: string | null;
	valueEnteredUser: string | null;
}

export type ExchangeSlugType = "binance" | "okx" | "htx" | "bitget" | "kucoin" | "mexc" | "gate" | "bybit";

export interface IExchangeList {
	exchange: string;
	exchange_connected_at: string;
	slug: ExchangeSlugType;
	keys: IExchangeListKeysResponse[];
}

export interface IExchangeListResponse {
	current_exchange: string | null;
	swap_state: string;
	withdrawal_state: string;
	exchanges: IExchangeList[];
}

export interface IExchangeDepositAddressesResponse {
	address: string;
	address_type: string;
	chain: string;
	currency: BlockchainType;
	min_deposit_amount: string;
}

export interface IExchangeTestRequest {
	credentials: {
		key?: string;
		secret?: string;
		passphrase?: string;
	};
	slug: string;
}

export type IUsersSettings =
	| "quick_start_guide_status"
	| "transfer_type"
	| "transfers_status"
	| "withdraw_from_processing";

export interface ISettingsResponse {
	name: IUsersSettings | string;
	value: string;
	is_editable: boolean;
	available_values: string[] | null;
	two_factor_verification_required: boolean;
}

export interface ISettingsRequest {
	name: IUsersSettings | string;
	value?: string;
	otp?: string | null;
}

export interface ICurrenciesRateResponse {
	from: string;
	source: string;
	to: string;
	value: string;
	value_scale: string;
	updated_at: string | null;
}

export interface ICurrenciesRateSource {
	source: string;
	from: string;
	to: string;
	value: string;
	updated_at: string | null;
}

export interface IBalancesCurrentExchangeItem {
	amount: string;
	amount_usd: string;
	currency: string;
}

export interface IBalancesCurrentExchange {
	total_usd: string;
	balances: IBalancesCurrentExchangeItem[];
}

export interface IMonitorsResponse {
	id: number;
	created_at: string;
	slug: string;
	title: string;
}

export interface ILogsResponse {
	level: string;
	message: string;
	time: string;
}

export interface IMonitorsMessagesResponse {
	created_at: string;
	message: string;
	status: string;
}

export interface IMonitorsCurrentTypeListResponse {
	created_at: string;
	failure: boolean;
	process_id: string;
	messages: IMonitorsMessagesResponse[];
}

export interface IExchangePairsResponse {
	base_symbol: string;
	display_name: string;
	quote_symbol: string;
	symbol: string;
	type: string;
}

export interface IDepositAddressesItemResponse {
	address: string;
	currency: BlockchainType;
	chain: string;
	address_type: string;
	min_deposit_amount: string;
	is_used?: boolean;
}

export interface IDepositAddressesResponse {
	slug: string;
	name: string;
	addresses: IDepositAddressesItemResponse[];
}

export interface IResetPasswordRequest {
	code: number | null;
	email?: string;
	password: string;
	password_confirmation: string;
}

export interface IExchangeChainsResponse {
	chain: string;
	currency_id: string;
	ticker: string;
	ticker_label: string;
	chain_label: string;
}

export interface IWithdrawalSettingRequest {
	address: string;
	ticker: string;
	chain: string;
	currency_id: string;
	min_amount: string;
}

export interface IWithdrawalSettingResponse {
	address: string;
	chain: string;
	created_at: string;
	currency_id: string;
	id: string;
	min_amount: string;
	enabled: boolean;
}

export interface IExchangeWithdrawalItemResponse {
	address: string;
	amount_native: string;
	amount_usd: string;
	status: string;
	tx_id: string | null;
	fail_reason: string | null;
	currency_id: string;
	id: string;
	min_amount: string;
	slug: string;
	created_at: string;
}

export interface IExchangeWithdrawalResponse {
	items: IExchangeWithdrawalItemResponse[];
	pagination: IPagination;
}

export interface IExchangeWithdrawalRequest {
	page: number;
	page_size: number;
	slug?: string;
	date_to?: string | null;
	date_from?: string | null;
}

export interface IExchangeOrderItemResponse {
	amount: string;
	amount_usd: string | null;
	client_order_id: string | null;
	created_at: string;
	exchange_id: string;
	exchange_order_id: string | null;
	fail_reason: string;
	id: string;
	order_created_at: string;
	side: string;
	status: string;
	symbol: string;
	updated_at: string | null;
	user_id: string;
}

export interface IExchangeOrderResponse {
	items: IExchangeOrderItemResponse[];
	pagination: IPagination;
}

export interface IExchangeReportRequest {
	format: "csv" | "xlsx";
	slug?: string;
}

export interface IExchangeOrderRequest {
	page: number;
	page_size: number;
	slug?: string;
	date_to?: string | null;
	date_from?: string | null;
}

export interface IExchangeWithdrawalRulesResponse {
	chain: string;
	currency: string;
	fee: string;
	max_withdraw_amount: string;
	min_deposit_amount: string;
	min_withdraw_amount: string;
	num_of_confirmations: string;
	withdraw_fee_type: string;
	withdraw_precision: string;
	withdraw_quota_per_day: string;
}

export interface IAddressesConverterResponse {
	address: string;
	legacy: string;
}

export interface IExchangeCalculationCommissions {
	min_amount: string;
	min_amount_usd: number;
	fee: string;
	fee_usd: number;
	currency: string;
}

export interface INotificationsListResponse {
	category: string;
	email_enabled: boolean;
	id: string;
	name: string;
	tg_enabled: boolean;
}

export interface IAmlKeysResponse {
	name: string;
	value: string;
}

export interface IAmlCurrenciesResponse {
	id: string;
	code: string;
	precision: number;
	name: string;
	blockchain: string;
	is_bitcoin_like: boolean;
	is_evm_like: boolean;
}

export interface IAmlScoreTransactionRequest {
	currency_id: string | null;
	direction: string | null;
	output_address: string | null;
	provider_slug: string;
	tx_id: string | null;
}

export interface IAmlHistoryItemResponse {
	id: string;
	user_id: string;
	service_id: string;
	external_id: string;
	status: string;
	service_slug: string;
	score: string;
	risk_level: string;
	created_at: string;
	updated_at: string;
	request_history: {
		id: string;
		aml_check_id: string;
		request_payload: string;
		service_response: string;
		error_msg: string | null;
		attempt_number: number;
		created_at: string;
		updated_at: string | null;
	}[];
}

export interface IAmlHistoryResponse {
	items: IAmlHistoryItemResponse[];
	pagination: IPagination;
}

export interface IAmlHistoryFilterRequest {
	page: number;
}

export interface INotificationsItemResponse {
	id: string;
	destination: string;
	message_text: string;
	sender: string;
	updated_at: string;
	created_at: string;
	type: string;
	channel: string;
	sent_at: string | null;
}

export interface INotificationsResponse {
	items: INotificationsItemResponse[];
	pagination: IPagination;
}

export interface INotificationsRequest {
	page: number;
	types: string | null;
	destinations: string | null;
	channels: string | null;
}

export interface INotificationsTypesResponse {
	label: string;
	value: string;
}

export interface IWithdrawMultipleRequest {
	currency_id: string;
	withdrawal_wallet_id?: string;
	wallet_address_id?: string[];
	exclude_wallet_addresses_ids?: string[];
}

export interface IWalletKeysHotRequest {
	file_type: "json" | "csv";
	totp: string;
	exclude_wallet_address_ids?: string[];
	wallet_address_ids?: string[];
}

export interface IRegularAddressesResponse {
	id: string;
	address: string;
	currency_id: BlockchainType;
	name: string | null;
	tag: string | null;
	blockchain: string;
	submitted_at: string;
	withdrawal_rule_exists: boolean;
}

export interface IUniversalGroupsAddressesResponse {
	address: string;
	name: string | null;
	tag: string | null;
	blockchain: string;
	is_universal: boolean;
	currencies: {
		currency_id: BlockchainType;
		id: string;
		withdrawal_rule_exists: boolean;
	}[];
	submitted_at: string;
	currency_count: number;
}

export interface IEvmGroupsAddressesResponse {
	address: string;
	name: string | null;
	tag: string | null;
	blockchains: string[];
	is_evm: boolean;
	currencies: {
		currency_id: BlockchainType;
		id: string;
		withdrawal_rule_exists: boolean;
	}[];
	submitted_at: string;
	currency_count: number;
}

export interface IAddressBookResponse {
	addresses: IRegularAddressesResponse[];
	universal_groups: IUniversalGroupsAddressesResponse[];
	evm_groups: IEvmGroupsAddressesResponse[];
}

export interface IAddressBookRequest {
	address: string;
	create_withdrawal_rule: boolean;
	totp: string;
	blockchain?: string;
	currency_id?: string;
	is_evm?: boolean;
	is_universal?: boolean;
	name?: string;
	tag?: string;
}

export interface IDeleteAddressBookRequest {
	address?: string;
	totp: string;
	id?: string;
	blockchain?: string;
	is_evm?: boolean;
	is_universal?: boolean;
}
