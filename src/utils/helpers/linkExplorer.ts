import { getCurrentBlockchain } from "@shared/utils/helpers/general";
import { blockchainPatterns } from "@shared/utils/constants/blockchain";

export const getLinkExplorer = (currencyId: string, type: "address" | "transaction", hash: string): string => {
	if (!currencyId) return "";
	const blockchain: string = getCurrentBlockchain(currencyId);
	switch (type) {
		case "address":
			return blockchain in blockchainPatterns ? blockchainPatterns[blockchain].addressUrl + hash : "";
		case "transaction":
			return blockchain in blockchainPatterns ? blockchainPatterns[blockchain].transactionUrl + hash : "";
		default:
			return "";
	}
};

export const getLinkSearch = (type: "address" | "transaction", hash: string): string => {
	if (!hash || !type) return "";
	switch (type) {
		case "address":
			return `/search/wallets/${hash}`;
		case "transaction":
			return `/search/transaction/${hash}`;
		default:
			return "";
	}
};
