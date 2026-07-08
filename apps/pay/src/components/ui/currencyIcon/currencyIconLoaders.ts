import type { Component } from "vue";
import { markRaw } from "vue";
import type { CurrencyType } from "@pay/utils/types/blockchain";
import { loadDefaultBlockchainIcon } from "@shared/components/ui/blockchainIcon/blockchainIconLoaders";

type IconModule = { default: Component };

export const currencyIconLoaders: Record<CurrencyType, () => Promise<IconModule>> = {
	BTC: () => import("@shared/components/icons/blockchains/IconBitcoin.vue"),
	BCH: () => import("@shared/components/icons/blockchains/IconBitcoincash.vue"),
	LTC: () => import("@shared/components/icons/blockchains/IconLitecoin.vue"),
	TRX: () => import("@shared/components/icons/blockchains/IconTRXTron.vue"),
	ETH: () => import("@shared/components/icons/blockchains/IconEthereum.vue"),
	USDT: () => import("@shared/components/icons/blockchains/IconUsdt.vue"),
	USDC: () => import("@shared/components/icons/blockchains/IconUsdc.vue"),
	USDE: () => import("@shared/components/icons/blockchains/IconUsde.vue"),
	USDD: () => import("@shared/components/icons/blockchains/IconUsdd.vue"),
	USD1: () => import("@shared/components/icons/blockchains/IconUsd1.vue"),
	DAI: () => import("@shared/components/icons/blockchains/IconDai.vue"),
	BNB: () => import("@shared/components/icons/blockchains/IconBinance.vue"),
	POL: () => import("@shared/components/icons/blockchains/IconPolygon.vue"),
	SOL: () => import("@shared/components/icons/blockchains/IconSOLSolana.vue"),
	XMR: () => import("@shared/components/icons/blockchains/IconXMRMonero.vue"),
	DOGE: () => import("@shared/components/icons/blockchains/IconDOGEDogecoin.vue"),
	ARB: () => import("@shared/components/icons/blockchains/IconArb.vue"),
	CAKE: () => import("@shared/components/icons/blockchains/IconCake.vue"),
	SHIB: () => import("@shared/components/icons/blockchains/IconShib.vue"),
	PEPE: () => import("@shared/components/icons/blockchains/IconPepe.vue"),
	ENA: () => import("@shared/components/icons/blockchains/IconEna.vue"),
	WLFI: () => import("@shared/components/icons/blockchains/IconWlfi.vue"),
	WLD: () => import("@shared/components/icons/blockchains/IconWld.vue"),
	PYUSD: () => import("@shared/components/icons/blockchains/IconPyusd.vue"),
	XAUT: () => import("@shared/components/icons/blockchains/IconXaut.vue"),
	SAND: () => import("@shared/components/icons/blockchains/IconSand.vue")
};

export { loadDefaultBlockchainIcon as loadDefaultCurrencyIcon };

const currencyIconCache = new Map<string, Component>();

export const getCurrencyIcon = async (currencyType?: CurrencyType): Promise<Component> => {
	const cacheKey = currencyType && currencyType in currencyIconLoaders ? currencyType : "default";
	const cached = currencyIconCache.get(cacheKey);
	if (cached) return cached;

	const module =
		cacheKey === "default"
			? await loadDefaultBlockchainIcon()
			: await currencyIconLoaders[currencyType as CurrencyType]();

	const component = markRaw(module.default);
	currencyIconCache.set(cacheKey, component);
	return component;
};
