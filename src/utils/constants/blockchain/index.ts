import type { BlockchainType } from "@shared/utils/types/blockchain";

export const blockchainCurrencyId: Record<string, BlockchainType> = {
	bitcoincash: "BCH.Bitcoincash",
	bsc: "BNB.BNBSmartChain",
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

export const PRECISION_CURRENCIES: Record<BlockchainType, number> = {
	"DAI.Arbitrum": 2,
	"ETH.Arbitrum": 6,
	"ETH.Optimism": 6,
	"ETH.Linea": 6,
	"USDT.Optimism": 2,
	"USDT.Linea": 2,
	"DAI.Linea": 2,
	"USDC.Linea": 2,
	"USDC.Optimism": 2,
	"DAI.Optimism": 2,
	"USDC.Arbitrum": 2,
	"USDT.Arbitrum": 2,
	"BTC.Bitcoin": 8,
	"BCH.Bitcoincash": 8,
	"BNB.BNBSmartChain": 6,
	"DAI.BNBSmartChain": 2,
	"USDC.BNBSmartChain": 2,
	"USDT.BNBSmartChain": 2,
	"DOGE.Dogecoin": 8,
	"DAI.Ethereum": 2,
	"ETH.Ethereum": 6,
	"LTC.Ethereum": 6,
	"TON.Ethereum": 6,
	"USDC.Ethereum": 2,
	"USDT.Ethereum": 2,
	"LTC.Litecoin": 8,
	"DAI.Polygon": 2,
	"POL.Polygon": 6,
	"USDC.Polygon": 2,
	"USDT.Polygon": 2,
	"TRX.Tron": 6,
	"SOL.Solana": 6,
	"USDT.Tron": 2,
	"XMR.Monero": 6
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
