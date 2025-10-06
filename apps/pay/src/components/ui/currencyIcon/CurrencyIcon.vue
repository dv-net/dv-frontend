<script setup lang="ts">
	import { type Component, computed, markRaw } from "vue";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import IconBitcoin from "@shared/components/icons/blockchains/IconBitcoin.vue";
	import IconEthereum from "@shared/components/icons/blockchains/IconEthereum.vue";
	import IconLitecoin from "@shared/components/icons/blockchains/IconLitecoin.vue";
	import IconBitcoincash from "@shared/components/icons/blockchains/IconBitcoincash.vue";
	import IconBinance from "@shared/components/icons/blockchains/IconBinance.vue";
	import IconPolygon from "@shared/components/icons/blockchains/IconPolygon.vue";
	import IconSOLSolana from "@shared/components/icons/blockchains/IconSOLSolana.vue";
	import IconXMRMonero from "@shared/components/icons/blockchains/IconXMRMonero.vue";
	import IconDOGEDogecoin from "@shared/components/icons/blockchains/IconDOGEDogecoin.vue";
	import IconTRXTron from "@shared/components/icons/blockchains/IconTRXTron.vue";
	import IconUsdt from "@shared/components/icons/blockchains/IconUsdt.vue";
	import IconUsdc from "@shared/components/icons/blockchains/IconUsdc.vue";
	import IconDai from "@shared/components/icons/blockchains/IconDai.vue";
	import IconDefault from "@shared/components/icons/blockchains/iconDefault.vue";
	import IconUsdd from "@shared/components/icons/blockchains/IconUsdd.vue";
	import IconUsde from "@shared/components/icons/blockchains/IconUsde.vue";
	import IconArb from "@shared/components/icons/blockchains/IconArb.vue";
	import IconCake from "@shared/components/icons/blockchains/IconCake.vue";
	import IconShib from "@shared/components/icons/blockchains/IconShib.vue";
	import IconPepe from "@shared/components/icons/blockchains/IconPepe.vue";
	import IconEna from "@shared/components/icons/blockchains/IconEna.vue";
	import IconWlfi from "@shared/components/icons/blockchains/IconWlfi.vue";
	import IconUsd1 from "@shared/components/icons/blockchains/IconUsd1.vue";
	import IconWld from "@shared/components/icons/blockchains/IconWld.vue";
	import IconPyusd from "@shared/components/icons/blockchains/IconPyusd.vue";
	import IconXaut from "@shared/components/icons/blockchains/IconXaut.vue";
	import IconSand from "@shared/components/icons/blockchains/IconSand.vue";

	const {
		width = "24px",
		height = "24px",
		type
	} = defineProps<{
		type?: CurrencyType;
		width?: string;
		height?: string;
	}>();

	const icons: Record<CurrencyType, Component> = {
		USDT: IconUsdt,
		USDC: IconUsdc,
		USDE: IconUsde,
		USDD: IconUsdd,
		USD1: IconUsd1,
		CAKE: IconCake,
		BCH: IconBitcoincash,
		WLD: IconWld,
		XAUT: IconXaut,
		SAND: IconSand,
		PYUSD: IconPyusd,
		PEPE: IconPepe,
		ARB: IconArb,
		WLFI: IconWlfi,
		ENA: IconEna,
		BTC: IconBitcoin,
		LTC: IconLitecoin,
		TRX: IconTRXTron,
		DAI: IconDai,
		ETH: IconEthereum,
		BNB: IconBinance,
		POL: IconPolygon,
		SHIB: IconShib,
		SOL: IconSOLSolana,
		XMR: IconXMRMonero,
		DOGE: IconDOGEDogecoin
	};

	const iconToShow = computed<Component>(() => (type && type in icons ? icons[type] : markRaw(IconDefault)));
</script>

<template>
	<component
		class="flex-shrink-0"
		:is="iconToShow"
		:style="{ width, height, minWidth: width, minHeight: height, maxWidth: width, maxHeight: height }"
	/>
</template>
