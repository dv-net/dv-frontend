import type { BlockchainType } from "@shared/utils/types/blockchain";

export const blockchainCurrencyId: Record<string, BlockchainType> = {
	bitcoincash: "BCH.Bitcoincash",
	bsc: "BNB.BNBSmartChain",
	bnbsmartchain: "BNB.BNBSmartChain",
	ethereum: "ETH.Ethereum",
	polygon: "POL.Polygon",
	bitcoin: "BTC.Bitcoin",
	litecoin: "LTC.Litecoin",
	tron: "TRX.Tron",
	dogecoin: "DOGE.Dogecoin",
	arbitrum: "ETH.Arbitrum",
	optimism: "ETH.Optimism",
	linea: "ETH.Linea",
	solana: "SOL.Solana",
	monero: "XMR.Monero"
};

export const DEFAULT_CURRENCY_CONFIRMATION: number = 20;
export const DEFAULT_CURRENCY_DEPOSIT_TIME: number = 2;
export const DEFAULT_CURRENCY_PRECISION: number = 6;

export const DEFAULT_CURRENCIES_INFO: Record<
	BlockchainType,
	{ precision: number; depositTime: number; confirmations: number }
> = {
	"ARB.Arbitrum": { precision: 2, depositTime: 2, confirmations: 20 },
	"DAI.Arbitrum": { precision: 2, depositTime: 2, confirmations: 20 },
	"ETH.Arbitrum": { precision: 6, depositTime: 2, confirmations: 20 },
	"ETH.Optimism": { precision: 6, depositTime: 2, confirmations: 20 },
	"ETH.Linea": { precision: 6, depositTime: 2, confirmations: 20 },
	"USDT.Optimism": { precision: 2, depositTime: 2, confirmations: 20 },
	"USDT.Linea": { precision: 2, depositTime: 2, confirmations: 20 },
	"DAI.Linea": { precision: 2, depositTime: 2, confirmations: 20 },
	"USDC.Linea": { precision: 2, depositTime: 2, confirmations: 20 },
	"USDC.Optimism": { precision: 2, depositTime: 2, confirmations: 20 },
	"DAI.Optimism": { precision: 2, depositTime: 2, confirmations: 20 },
	"USDC.Arbitrum": { precision: 2, depositTime: 2, confirmations: 20 },
	"USDT.Arbitrum": { precision: 2, depositTime: 2, confirmations: 20 },
	"BTC.Bitcoin": { precision: 8, depositTime: 30, confirmations: 1 },
	"BCH.Bitcoincash": { precision: 8, depositTime: 10, confirmations: 1 },
	"BNB.BNBSmartChain": { precision: 6, depositTime: 2, confirmations: 20 },
	"DAI.BNBSmartChain": { precision: 2, depositTime: 2, confirmations: 20 },
	"USDC.BNBSmartChain": { precision: 2, depositTime: 2, confirmations: 20 },
	"USDT.BNBSmartChain": { precision: 2, depositTime: 2, confirmations: 20 },
	"DOGE.Dogecoin": { precision: 8, depositTime: 1, confirmations: 1 },
	"DAI.Ethereum": { precision: 2, depositTime: 2, confirmations: 12 },
	"ETH.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"LTC.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"TON.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"USDC.Ethereum": { precision: 2, depositTime: 2, confirmations: 12 },
	"USDT.Ethereum": { precision: 2, depositTime: 2, confirmations: 12 },
	"LTC.Litecoin": { precision: 8, depositTime: 2, confirmations: 1 },
	"DAI.Polygon": { precision: 2, depositTime: 2, confirmations: 12 },
	"POL.Polygon": { precision: 6, depositTime: 2, confirmations: 12 },
	"USDC.Polygon": { precision: 2, depositTime: 2, confirmations: 12 },
	"USDT.Polygon": { precision: 2, depositTime: 2, confirmations: 12 },
	"TRX.Tron": { precision: 6, depositTime: 1, confirmations: 19 },
	"SOL.Solana": { precision: 6, depositTime: 1, confirmations: 2 },
	"USDT.Tron": { precision: 2, depositTime: 1, confirmations: 19 },
	"XMR.Monero": { precision: 6, depositTime: 10, confirmations: 2 },
	"USDD.Tron": { precision: 2, depositTime: 1, confirmations: 19 },
	"USD1.Tron": { precision: 2, depositTime: 1, confirmations: 19 },
	"USDE.Ethereum": { precision: 2, depositTime: 2, confirmations: 12 },
	"USDD.Ethereum": { precision: 2, depositTime: 2, confirmations: 12 },
	"USD1.Ethereum": { precision: 2, depositTime: 2, confirmations: 12 },
	"ARB.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"CAKE.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"PEPE.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"ENA.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"WLFI.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"WLD.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"PYUSD.Ethereum": { precision: 2, depositTime: 2, confirmations: 12 },
	"XAUT.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"SAND.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"SHIB.Ethereum": { precision: 6, depositTime: 2, confirmations: 12 },
	"USDD.BNBSmartChain": { precision: 2, depositTime: 2, confirmations: 20 },
	"USDE.BNBSmartChain": { precision: 2, depositTime: 2, confirmations: 20 },
	"CAKE.BNBSmartChain": { precision: 6, depositTime: 2, confirmations: 20 },
	"SHIB.BNBSmartChain": { precision: 6, depositTime: 2, confirmations: 20 },
	"USD1.BNBSmartChain": { precision: 2, depositTime: 2, confirmations: 20 },
	"WLFI.BNBSmartChain": { precision: 6, depositTime: 2, confirmations: 20 },
	"SAND.Polygon": { precision: 6, depositTime: 2, confirmations: 12 },
	"PYUSD.Arbitrum": { precision: 2, depositTime: 2, confirmations: 20 },
	"CAKE.Arbitrum": { precision: 6, depositTime: 2, confirmations: 20 }
};

export const blockchainPatterns: any = {
	Bitcoin: {
		addressUrl: import.meta.env.VITE_EXPLORER_BITCOIN_ADDRESS || "https://mempool.space/address/",
		transactionUrl: import.meta.env.VITE_EXPLORER_BITCOIN_TRANSACTION || "https://mempool.space/tx/"
	},
	Bitcoincash: {
		addressUrl: import.meta.env.VITE_EXPLORER_BITCOINCASH_ADDRESS || "https://blockchair.com/bitcoin-cash/address/",
		transactionUrl:
			import.meta.env.VITE_EXPLORER_BITCOINCASH_TRANSACTION || "https://blockchair.com/bitcoin-cash/transaction/"
	},
	Tron: {
		addressUrl: import.meta.env.VITE_EXPLORER_TRON_ADDRESS || "https://tronscan.org/#/address/",
		transactionUrl: import.meta.env.VITE_EXPLORER_TRON_TRANSACTION || "https://tronscan.org/#/transaction/"
	},
	Ethereum: {
		addressUrl: import.meta.env.VITE_EXPLORER_ETHEREUM_ADDRESS || "https://etherscan.io/address/",
		transactionUrl: import.meta.env.VITE_EXPLORER_ETHEREUM_TRANSACTION || "https://etherscan.io/tx/"
	},
	Litecoin: {
		addressUrl: import.meta.env.VITE_EXPLORER_LITECOIN_ADDRESS || "https://litecoinspace.org/address/",
		transactionUrl: import.meta.env.VITE_EXPLORER_LITECOIN_TRANSACTION || "https://litecoinspace.org/tx/"
	},
	BNBSmartChain: {
		addressUrl: import.meta.env.VITE_EXPLORER_BNBSMARTCHAIN_ADDRESS || "https://bscscan.com/address/",
		transactionUrl: import.meta.env.VITE_EXPLORER_BNBSMARTCHAIN_TRANSACTION || "https://bscscan.com/tx/"
	},
	Polygon: {
		addressUrl: import.meta.env.VITE_EXPLORER_POLYGON_ADDRESS || "https://polygonscan.com/address/",
		transactionUrl: import.meta.env.VITE_EXPLORER_POLYGON_TRANSACTION || "https://polygonscan.com/tx/"
	},
	Dogecoin: {
		addressUrl: import.meta.env.VITE_EXPLORER_DOGECOIN_ADDRESS || "https://blockchair.com/dogecoin/address/",
		transactionUrl: import.meta.env.VITE_EXPLORER_DOGECOIN_TRANSACTION || "https://blockchair.com/dogecoin/transaction/"
	},
	Arbitrum: {
		addressUrl: import.meta.env.VITE_EXPLORER_ARBITRUM_ADDRESS || "https://arbiscan.io/address/",
		transactionUrl: import.meta.env.VITE_EXPLORER_ARBITRUM_TRANSACTION || "https://arbiscan.io/tx/"
	},
	Linea: {
		addressUrl: import.meta.env.VITE_EXPLORER_LINEA_ADDRESS || "https://explorer.linea.build/address/",
		transactionUrl: import.meta.env.VITE_EXPLORER_LINEA_TRANSACTION || "https://explorer.linea.build/tx/"
	},
	Optimism: {
		addressUrl: import.meta.env.VITE_EXPLORER_OPTIMISTIC_ADDRESS || "https://optimistic.etherscan.io/address/",
		transactionUrl: import.meta.env.VITE_EXPLORER_OPTIMISTIC_TRANSACTION || "https://optimistic.etherscan.io/tx/"
	}
};
