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

	const {
		width = "24px",
		height = "24px",
		type
	} = defineProps<{
		type: CurrencyType;
		width?: string;
		height?: string;
	}>();

	const icons: Record<CurrencyType, Component> = {
		BCH: IconBitcoincash,
		BTC: IconBitcoin,
		LTC: IconLitecoin,
		TRX: IconTRXTron,
		USDT: IconUsdt,
		USDC: IconUsdc,
		DAI: IconDai,
		ETH: IconEthereum,
		BNB: IconBinance,
		POL: IconPolygon,
		SOL: IconSOLSolana,
		XMR: IconXMRMonero,
		DOGE: IconDOGEDogecoin
	};

	const iconToShow = computed<Component>(() => icons[type] || markRaw(IconDefault));
</script>

<template>
	<component
		class="flex-shrink-0"
		:is="iconToShow"
		:style="{ width, height, minWidth: width, minHeight: height, maxWidth: width, maxHeight: height }"
	/>
</template>
