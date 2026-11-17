import type { BlockchainType } from "@shared/utils/types/blockchain";
import { getIconUrl } from "@shared/utils/helpers/iconUrls";

const blockchainIconFiles: Record<BlockchainType, string> = {
	"BCH.Bitcoincash": "IconBitcoincash.svg",
	"BTC.Bitcoin": "IconBitcoin.svg",
	"LTC.Litecoin": "IconLitecoin.svg",
	"TRX.Tron": "IconTRXTron.svg",
	"USDT.Tron": "IconUSDTTron.svg",
	"USDD.Tron": "IconUsddTron.svg",
	"USD1.Tron": "IconUsd1Tron.svg",
	"ETH.Ethereum": "IconEthereum.svg",
	"USDC.Ethereum": "IconUSDCEthereum.svg",
	"DAI.Ethereum": "IconDAIEthereum.svg",
	"USDT.Ethereum": "IconUSDTEthereum.svg",
	"USDE.Ethereum": "IconUsdeEthereum.svg",
	"USDD.Ethereum": "IconUsddEthereum.svg",
	"USD1.Ethereum": "IconUsd1Ethereum.svg",
	"SHIB.Ethereum": "IconShibEthereum.svg",
	"SAND.Ethereum": "IconSandEthereum.svg",
	"XAUT.Ethereum": "IconXautEthereum.svg",
	"WLD.Ethereum": "IconWldEthereum.svg",
	"PYUSD.Ethereum": "IconPyusdEthereum.svg",
	"ARB.Ethereum": "IconArbEthereum.svg",
	"PEPE.Ethereum": "IconPepeEthereum.svg",
	"WLFI.Ethereum": "IconWlfiEthereum.svg",
	"CAKE.Ethereum": "IconCakeEthereum.svg",
	"ENA.Ethereum": "IconEnaEthereum.svg",
	"BNB.BNBSmartChain": "IconBinance.svg",
	"USDT.BNBSmartChain": "IconUSDTBinance.svg",
	"USDD.BNBSmartChain": "IconUsddBsc.svg",
	"USDC.BNBSmartChain": "IconUSDCBinance.svg",
	"USDE.BNBSmartChain": "IconUsdeBsc.svg",
	"DAI.BNBSmartChain": "IconDAIBinance.svg",
	"CAKE.BNBSmartChain": "IconCakeBsc.svg",
	"SHIB.BNBSmartChain": "IconShibBsc.svg",
	"WLFI.BNBSmartChain": "IconWlfiBsc.svg",
	"USD1.BNBSmartChain": "IconUsd1Bsc.svg",
	"POL.Polygon": "IconPolygon.svg",
	"USDT.Polygon": "IconUSDTPolygon.svg",
	"USDC.Polygon": "IconUSDCPolygon.svg",
	"DAI.Polygon": "IconDAIPolygon.svg",
	"SAND.Polygon": "IconSandPolygon.svg",
	"ARB.Arbitrum": "IconArbArbitrum.svg",
	"ETH.Arbitrum": "IconETHArbitrum.svg",
	"USDT.Arbitrum": "IconUSDTArbitrum.svg",
	"USDC.Arbitrum": "IconUSDCArbitrum.svg",
	"DAI.Arbitrum": "IconDAIArbitrum.svg",
	"PYUSD.Arbitrum": "IconPyusdArbitrum.svg",
	"CAKE.Arbitrum": "IconCakeArbitrum.svg",
	"DOGE.Dogecoin": "IconDOGEDogecoin.svg"
};

const blockchainIconUrls = Object.fromEntries(
	Object.entries(blockchainIconFiles).map(([type, fileName]) => [type, getIconUrl(fileName)])
) as Record<BlockchainType, string>;

const defaultBlockchainIconUrl = getIconUrl("iconDefault.svg");

export const getBlockchainIconUrl = (blockchainType?: BlockchainType): string => {
	if (blockchainType && blockchainType in blockchainIconUrls) {
		return blockchainIconUrls[blockchainType];
	}
	return defaultBlockchainIconUrl;
};
