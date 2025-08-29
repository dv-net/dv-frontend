import type { ExchangeSlugType } from "@dv-admin/utils/types/api/apiGo";
import { markRaw, type Component } from "vue";
import IconOkx from "@dv-admin/components/icons/exchanges/connect/IconOkx.vue";
import IconBinance from "@dv-admin/components/icons/exchanges/connect/IconBinance.vue";
import IconHtx from "@dv-admin/components/icons/exchanges/connect/IconHtx.vue";
import IconBitget from "@dv-admin/components/icons/exchanges/connect/IconBitget.vue";
import IconKucoin from "@dv-admin/components/icons/exchanges/connect/IconKucoin.vue";
import IconGate from "@dv-admin/components/icons/exchanges/connect/IconGate.vue";
import IconMexc from "@dv-admin/components/icons/exchanges/connect/IconMexc.vue";
import IconBinanceSmall from "@dv-admin/components/icons/exchanges/IconBinance.vue";
import IconHtxSmall from "@dv-admin/components/icons/exchanges/IconHtx.vue";
import IconOkxSmall from "@dv-admin/components/icons/exchanges/IconOkx.vue";
import IconBitgetSmall from "@dv-admin/components/icons/exchanges/IconBitget.vue";
import IconGateSmall from "@dv-admin/components/icons/exchanges/IconGate.vue";
import IconMexcSmall from "@dv-admin/components/icons/exchanges/IconMexc.vue";
import IconKucoinSmall from "@dv-admin/components/icons/exchanges/IconKucoin.vue";
import IconBybit from "@dv-admin/components/icons/exchanges/connect/IconBybit.vue";
import IconBybitSmall from "@dv-admin/components/icons/exchanges/IconBybit.vue";

export const exchangeLogo: Record<ExchangeSlugType, Component> = {
	okx: markRaw(IconOkx),
	binance: markRaw(IconBinance),
	htx: markRaw(IconHtx),
	bitget: markRaw(IconBitget),
	kucoin: markRaw(IconKucoin),
	gate: markRaw(IconGate),
	mexc: markRaw(IconMexc),
	bybit: markRaw(IconBybit)
};

export const exchangeLogoSmall: Record<ExchangeSlugType, Component> = {
	okx: markRaw(IconOkxSmall),
	binance: markRaw(IconBinanceSmall),
	htx: markRaw(IconHtxSmall),
	bitget: markRaw(IconBitgetSmall),
	kucoin: markRaw(IconKucoinSmall),
	gate: markRaw(IconGateSmall),
	mexc: markRaw(IconMexcSmall),
	bybit: markRaw(IconBybitSmall)
};

export const EXCHANGE_SETTING_LABELS: Record<string, string> = {
	api_key: "API-key",
	secret_key: "Secret key",
	pass_phrase: "Passphrase",
	access_key: "Access key"
};

export const EXCHANGE_HELP_TOOLTIPS: Record<string, { title: string; text: string }> = {
	api_key: { title: "API-key", text: "This is the API key from your crypto exchange, check it is correct" },
	secret_key: {
		title: "Secret key",
		text: "This is your crypto exchange's private key. We use it to sign requests - this lets the crypto exchange know that requests are being sent on your behalf"
	},
	pass_phrase: { title: "Passphrase", text: "This is a passphrase from your crypto exchange, check it is correct" },
	access_key: { title: "Access key", text: "This is the access key from your crypto exchange, check it is correct" }
};
