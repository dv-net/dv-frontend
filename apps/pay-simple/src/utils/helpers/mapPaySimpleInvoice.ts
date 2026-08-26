import type { BlockchainType } from "@shared/utils/types/blockchain";
import type {
	IPaySimpleInvoiceResponse,
	IPaySimplePaymentDetails
} from "@pay-simple/utils/types/paySimple";
import type {
	IPayerAddressResponse,
	IPayerResponse,
	IPayerStoreResponse
} from "@pay-shared/utils/types/payer";
import type { IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";
import { getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general";
import { TRON_CONTRACTS } from "@pay-shared/utils/constants/connectWallet/tron";
import { DEFAULT_CURRENCIES_INFO, DEFAULT_CURRENCY_PRECISION } from "@shared/utils/constants/blockchain";

const EVM_CHAINS = new Set(["Ethereum", "BNBSmartChain", "Polygon", "Arbitrum"]);
const BITCOIN_LIKE_CHAINS = new Set(["Bitcoin", "Litecoin", "Bitcoincash", "Dogecoin"]);

const NATIVE_BY_CHAIN: Record<string, string> = {
	Bitcoin: "BTC",
	Bitcoincash: "BCH",
	Litecoin: "LTC",
	Tron: "TRX",
	Ethereum: "ETH",
	BNBSmartChain: "BNB",
	Polygon: "POL",
	Arbitrum: "ETH",
	Dogecoin: "DOGE"
};

const toCurrencyId = (walletCurrency: string): string => {
	if (walletCurrency.includes(".")) return walletCurrency;
	return walletCurrency;
};

export const mapPaySimpleInvoiceToPayerResponse = (data: IPaySimpleInvoiceResponse): IPayerResponse => {
	const rates: Record<string, string> = {};
	const addresses: IPayerAddressResponse[] = [...data.wallets]
		.sort((a, b) => {
			const aSort = a.sort_order ?? Number.MAX_SAFE_INTEGER;
			const bSort = b.sort_order ?? Number.MAX_SAFE_INTEGER;
			return aSort - bSort;
		})
		.map((wallet) => {
		const currencyId = toCurrencyId(wallet.currency);
		const coin = getCurrentCoin(currencyId) || currencyId;
		const chain = getCurrentBlockchain(currencyId) || "";
		const isNative =
			typeof wallet.is_native === "boolean"
				? wallet.is_native
				: Boolean(chain && NATIVE_BY_CHAIN[chain] === coin);

		rates[currencyId] = wallet.rate;

		const precision =
			currencyId in DEFAULT_CURRENCIES_INFO
				? DEFAULT_CURRENCIES_INFO[currencyId as BlockchainType].precision
				: DEFAULT_CURRENCY_PRECISION;

		return {
			address: wallet.address,
			currency: {
				id: currencyId as BlockchainType,
				code: coin,
				name: coin,
				// pay API uses lowercase (tron/ethereum) — blockchainCurrencyId keys match that
				blockchain: chain.toLowerCase(),
				precision,
				is_bitcoin_like: BITCOIN_LIKE_CHAINS.has(chain),
				is_evm_like: EVM_CHAINS.has(chain),
				currency_label: wallet.currency_label ?? null,
				token_label: wallet.token_label ?? null,
				contract_address:
					wallet.contract_address || (chain === "Tron" ? TRON_CONTRACTS[coin] || "" : ""),
				is_native: isNative,
				sort_order: wallet.sort_order ?? null
			}
		};
	});

	const store: IPayerStoreResponse = {
		id: data.invoice.external_id,
		name: data.shop.name,
		currency_id: data.invoice.currency,
		status: true,
		minimal_payment: "0",
		site_url: data.shop.url ?? undefined,
		success_url: data.invoice.success_redirect_url ?? undefined,
		return_url: data.invoice.failure_redirect_url ?? undefined
	};

	return { addresses, rates, store };
};

/** Map light-backend payment details → pay form transaction shape. */
export const mapPaySimplePaymentToTransaction = (
	payment: IPaySimplePaymentDetails,
	createdAt?: string
): IWalletTransactionResponse => ({
	amount: payment.amount,
	amount_usd: payment.fiat_amount,
	fiat_currency: payment.fiat_currency,
	created_at: createdAt || new Date().toISOString(),
	currency_code: payment.currency_code,
	hash: payment.hash,
	type: "deposit",
	currency_name: payment.currency_name,
	currency_label: payment.currency_label || payment.currency_name,
	blockchain: payment.blockchain,
	contract_address: payment.contract_address || "",
	is_native: payment.is_native,
	token_label: payment.token_label
});
