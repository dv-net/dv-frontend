import type { CurrencyType } from "@shared/utils/types/blockchain";
import { getIconUrl } from "@shared/utils/helpers/iconUrls";

const currencyIconFiles: Record<CurrencyType, string> = {
	BTC: "IconBitcoin.svg",
	BCH: "IconBitcoincash.svg",
	LTC: "IconLitecoin.svg",
	TRX: "IconTRXTron.svg",
	ETH: "IconEthereum.svg",
	USDT: "IconUsdt.svg",
	USDC: "IconUsdc.svg",
	USDE: "IconUsde.svg",
	USDD: "IconUsdd.svg",
	USD1: "IconUsd1.svg",
	DAI: "IconDai.svg",
	BNB: "IconBinance.svg",
	POL: "IconPolygon.svg",
	DOGE: "IconDOGEDogecoin.svg",
	ARB: "IconArb.svg",
	CAKE: "IconCake.svg",
	SHIB: "IconShib.svg",
	PEPE: "IconPepe.svg",
	ENA: "IconEna.svg",
	WLFI: "IconWlfi.svg",
	WLD: "IconWld.svg",
	PYUSD: "IconPyusd.svg",
	XAUT: "IconXaut.svg",
	SAND: "IconSand.svg"
};

const currencyIconUrls = Object.fromEntries(
	Object.entries(currencyIconFiles).map(([type, fileName]) => [type, getIconUrl(fileName)])
) as Record<CurrencyType, string>;

const defaultCurrencyIconUrl = getIconUrl("iconDefault.svg");

export const getCurrencyIconUrl = (currencyType?: CurrencyType): string => {
	if (currencyType && currencyType in currencyIconUrls) {
		return currencyIconUrls[currencyType];
	}
	return defaultCurrencyIconUrl;
};
