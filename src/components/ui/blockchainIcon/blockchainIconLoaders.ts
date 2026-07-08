import type { Component } from "vue";
import { markRaw } from "vue";
import type { BlockchainType } from "@shared/utils/types/blockchain";

type IconModule = { default: Component };

export const blockchainIconLoaders: Record<BlockchainType, () => Promise<IconModule>> = {
	"BCH.Bitcoincash": () => import("@shared/components/icons/blockchains/IconBitcoincash.vue"),
	"BTC.Bitcoin": () => import("@shared/components/icons/blockchains/IconBitcoin.vue"),
	"LTC.Litecoin": () => import("@shared/components/icons/blockchains/IconLitecoin.vue"),
	"TRX.Tron": () => import("@shared/components/icons/blockchains/IconTRXTron.vue"),
	"USDT.Tron": () => import("@shared/components/icons/blockchains/IconUSDTTron.vue"),
	"USDD.Tron": () => import("@shared/components/icons/blockchains/IconUsddTron.vue"),
	"USD1.Tron": () => import("@shared/components/icons/blockchains/IconUsd1Tron.vue"),
	"ETH.Ethereum": () => import("@shared/components/icons/blockchains/IconEthereum.vue"),
	"USDC.Ethereum": () => import("@shared/components/icons/blockchains/IconUSDCEthereum.vue"),
	"DAI.Ethereum": () => import("@shared/components/icons/blockchains/IconDAIEthereum.vue"),
	"USDT.Ethereum": () => import("@shared/components/icons/blockchains/IconUSDTEthereum.vue"),
	"USDE.Ethereum": () => import("@shared/components/icons/blockchains/IconUsdeEthereum.vue"),
	"USDD.Ethereum": () => import("@shared/components/icons/blockchains/IconUsddEthereum.vue"),
	"USD1.Ethereum": () => import("@shared/components/icons/blockchains/IconUsd1Ethereum.vue"),
	"SHIB.Ethereum": () => import("@shared/components/icons/blockchains/IconShibEthereum.vue"),
	"SAND.Ethereum": () => import("@shared/components/icons/blockchains/IconSandEthereum.vue"),
	"XAUT.Ethereum": () => import("@shared/components/icons/blockchains/IconXautEthereum.vue"),
	"WLD.Ethereum": () => import("@shared/components/icons/blockchains/IconWldEthereum.vue"),
	"PYUSD.Ethereum": () => import("@shared/components/icons/blockchains/IconPyusdEthereum.vue"),
	"ARB.Ethereum": () => import("@shared/components/icons/blockchains/IconArbEthereum.vue"),
	"PEPE.Ethereum": () => import("@shared/components/icons/blockchains/IconPepeEthereum.vue"),
	"WLFI.Ethereum": () => import("@shared/components/icons/blockchains/IconWlfiEthereum.vue"),
	"CAKE.Ethereum": () => import("@shared/components/icons/blockchains/IconCakeEthereum.vue"),
	"ENA.Ethereum": () => import("@shared/components/icons/blockchains/IconEnaEthereum.vue"),
	"BNB.BNBSmartChain": () => import("@shared/components/icons/blockchains/IconBinance.vue"),
	"USDT.BNBSmartChain": () => import("@shared/components/icons/blockchains/IconUSDTBinance.vue"),
	"USDD.BNBSmartChain": () => import("@shared/components/icons/blockchains/IconUsddBsc.vue"),
	"USDC.BNBSmartChain": () => import("@shared/components/icons/blockchains/IconUSDCBinance.vue"),
	"USDE.BNBSmartChain": () => import("@shared/components/icons/blockchains/IconUsdeBsc.vue"),
	"DAI.BNBSmartChain": () => import("@shared/components/icons/blockchains/IconDAIBinance.vue"),
	"CAKE.BNBSmartChain": () => import("@shared/components/icons/blockchains/IconCakeBsc.vue"),
	"SHIB.BNBSmartChain": () => import("@shared/components/icons/blockchains/IconShibBsc.vue"),
	"WLFI.BNBSmartChain": () => import("@shared/components/icons/blockchains/IconWlfiBsc.vue"),
	"USD1.BNBSmartChain": () => import("@shared/components/icons/blockchains/IconUsd1Bsc.vue"),
	"POL.Polygon": () => import("@shared/components/icons/blockchains/IconPolygon.vue"),
	"USDT.Polygon": () => import("@shared/components/icons/blockchains/IconUSDTPolygon.vue"),
	"USDC.Polygon": () => import("@shared/components/icons/blockchains/IconUSDCPolygon.vue"),
	"DAI.Polygon": () => import("@shared/components/icons/blockchains/IconDAIPolygon.vue"),
	"SAND.Polygon": () => import("@shared/components/icons/blockchains/IconSandPolygon.vue"),
	"ARB.Arbitrum": () => import("@shared/components/icons/blockchains/IconArbArbitrum.vue"),
	"ETH.Arbitrum": () => import("@shared/components/icons/blockchains/IconETHArbitrum.vue"),
	"USDT.Arbitrum": () => import("@shared/components/icons/blockchains/IconUSDTArbitrum.vue"),
	"USDC.Arbitrum": () => import("@shared/components/icons/blockchains/IconUSDCArbitrum.vue"),
	"DAI.Arbitrum": () => import("@shared/components/icons/blockchains/IconDAIArbitrum.vue"),
	"PYUSD.Arbitrum": () => import("@shared/components/icons/blockchains/IconPyusdArbitrum.vue"),
	"CAKE.Arbitrum": () => import("@shared/components/icons/blockchains/IconCakeArbitrum.vue"),
	"ETH.Optimism": () => import("@shared/components/icons/blockchains/IconETHOptimism.vue"),
	"USDT.Optimism": () => import("@shared/components/icons/blockchains/IconUSDTOptimism.vue"),
	"USDC.Optimism": () => import("@shared/components/icons/blockchains/IconUSDCOptimism.vue"),
	"DAI.Optimism": () => import("@shared/components/icons/blockchains/IconDAIOptimism.vue"),
	"ETH.Linea": () => import("@shared/components/icons/blockchains/IconETHLinea.vue"),
	"USDT.Linea": () => import("@shared/components/icons/blockchains/IconUSDTLinea.vue"),
	"USDC.Linea": () => import("@shared/components/icons/blockchains/IconUSDCLinea.vue"),
	"DAI.Linea": () => import("@shared/components/icons/blockchains/IconDAILinea.vue"),
	"SOL.Solana": () => import("@shared/components/icons/blockchains/IconSOLSolana.vue"),
	"XMR.Monero": () => import("@shared/components/icons/blockchains/IconXMRMonero.vue"),
	"DOGE.Dogecoin": () => import("@shared/components/icons/blockchains/IconDOGEDogecoin.vue")
};

export const loadDefaultBlockchainIcon = () => import("@shared/components/icons/blockchains/iconDefault.vue");

const blockchainIconCache = new Map<string, Component>();

export const getBlockchainIcon = async (blockchainType?: BlockchainType): Promise<Component> => {
	const cacheKey = blockchainType && blockchainType in blockchainIconLoaders ? blockchainType : "default";
	const cached = blockchainIconCache.get(cacheKey);
	if (cached) return cached;

	const module =
		cacheKey === "default"
			? await loadDefaultBlockchainIcon()
			: await blockchainIconLoaders[blockchainType as BlockchainType]();

	const component = markRaw(module.default);
	blockchainIconCache.set(cacheKey, component);
	return component;
};
