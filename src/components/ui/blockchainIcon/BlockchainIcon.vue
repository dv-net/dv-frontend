<script setup lang="ts">
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import { type Component, computed, markRaw } from "vue";
	import IconBitcoin from "@shared/components/icons/blockchains/IconBitcoin.vue";
	import IconEthereum from "@shared/components/icons/blockchains/IconEthereum.vue";
	import IconUSDTTron from "@shared/components/icons/blockchains/IconUSDTTron.vue";
	import IconUSDCEthereum from "@shared/components/icons/blockchains/IconUSDCEthereum.vue";
	import IconUSDTEthereum from "@shared/components/icons/blockchains/IconUSDTEthereum.vue";
	import IconLTCEthereum from "@shared/components/icons/blockchains/IconLTCEthereum.vue";
	import IconTRXTron from "@shared/components/icons/blockchains/IconTRXTron.vue";
	import IconTONEthereum from "@shared/components/icons/blockchains/IconTONEthereum.vue";
	import IconLitecoin from "@shared/components/icons/blockchains/IconLitecoin.vue";
	import IconBitcoincash from "@shared/components/icons/blockchains/IconBitcoincash.vue";
	import IconDAIEthereum from "@shared/components/icons/blockchains/IconDAIEthereum.vue";
	import IconBinance from "@shared/components/icons/blockchains/IconBinance.vue";
	import IconUSDTBinance from "@shared/components/icons/blockchains/IconUSDTBinance.vue";
	import IconUSDCBinance from "@shared/components/icons/blockchains/IconUSDCBinance.vue";
	import IconDAIBinance from "@shared/components/icons/blockchains/IconDAIBinance.vue";
	import IconPolygon from "@shared/components/icons/blockchains/IconPolygon.vue";
	import IconUSDTPolygon from "@shared/components/icons/blockchains/IconUSDTPolygon.vue";
	import IconUSDCPolygon from "@shared/components/icons/blockchains/IconUSDCPolygon.vue";
	import IconDAIPolygon from "@shared/components/icons/blockchains/IconDAIPolygon.vue";
	import IconETHLinea from "@shared/components/icons/blockchains/IconETHLinea.vue";
	import IconUSDTLinea from "@shared/components/icons/blockchains/IconUSDTLinea.vue";
	import IconUSDCLinea from "@shared/components/icons/blockchains/IconUSDCLinea.vue";
	import IconETHOptimism from "@shared/components/icons/blockchains/IconETHOptimism.vue";
	import IconUSDTOptimism from "@shared/components/icons/blockchains/IconUSDTOptimism.vue";
	import IconUSDCOptimism from "@shared/components/icons/blockchains/IconUSDCOptimism.vue";
	import IconETHArbitrum from "@shared/components/icons/blockchains/IconETHArbitrum.vue";
	import IconUSDTArbitrum from "@shared/components/icons/blockchains/IconUSDTArbitrum.vue";
	import IconUSDCArbitrum from "@shared/components/icons/blockchains/IconUSDCArbitrum.vue";
	import IconSOLSolana from "@shared/components/icons/blockchains/IconSOLSolana.vue";
	import IconXMRMonero from "@shared/components/icons/blockchains/IconXMRMonero.vue";
	import IconDOGEDogecoin from "@shared/components/icons/blockchains/IconDOGEDogecoin.vue";
	import IconDAILinea from "@shared/components/icons/blockchains/IconDAILinea.vue";
	import IconDAIOptimism from "@shared/components/icons/blockchains/IconDAIOptimism.vue";
	import IconDAIArbitrum from "@shared/components/icons/blockchains/IconDAIArbitrum.vue";
	import IconDefault from "@shared/components/icons/blockchains/iconDefault.vue";

	const {
		width = "24px",
		height = "24px",
		type
	} = defineProps<{
		type: BlockchainType;
		width?: string;
		height?: string;
	}>();

	const icons: Record<BlockchainType, Component> = {
		"BCH.Bitcoincash": markRaw(IconBitcoincash),
		"BTC.Bitcoin": markRaw(IconBitcoin),
		"LTC.Litecoin": markRaw(IconLitecoin),
		"TRX.Tron": markRaw(IconTRXTron),
		"USDT.Tron": markRaw(IconUSDTTron),
		"ETH.Ethereum": markRaw(IconEthereum),
		"USDC.Ethereum": markRaw(IconUSDCEthereum),
		"DAI.Ethereum": markRaw(IconDAIEthereum),
		"USDT.Ethereum": markRaw(IconUSDTEthereum),
		"LTC.Ethereum": markRaw(IconLTCEthereum),
		"TON.Ethereum": markRaw(IconTONEthereum),
		"BNB.BNBSmartChain": markRaw(IconBinance),
		"USDT.BNBSmartChain": markRaw(IconUSDTBinance),
		"USDC.BNBSmartChain": markRaw(IconUSDCBinance),
		"DAI.BNBSmartChain": markRaw(IconDAIBinance),
		"POL.Polygon": markRaw(IconPolygon),
		"USDT.Polygon": markRaw(IconUSDTPolygon),
		"USDC.Polygon": markRaw(IconUSDCPolygon),
		"DAI.Polygon": markRaw(IconDAIPolygon),
		"ETH.Arbitrum": markRaw(IconETHArbitrum),
		"USDT.Arbitrum": markRaw(IconUSDTArbitrum),
		"USDC.Arbitrum": markRaw(IconUSDCArbitrum),
		"DAI.Arbitrum": markRaw(IconDAIArbitrum),
		"ETH.Optimism": markRaw(IconETHOptimism),
		"USDT.Optimism": markRaw(IconUSDTOptimism),
		"USDC.Optimism": markRaw(IconUSDCOptimism),
		"DAI.Optimism": markRaw(IconDAIOptimism),
		"ETH.Linea": markRaw(IconETHLinea),
		"USDT.Linea": markRaw(IconUSDTLinea),
		"USDC.Linea": markRaw(IconUSDCLinea),
		"DAI.Linea": markRaw(IconDAILinea),
		"SOL.Solana": markRaw(IconSOLSolana),
		"XMR.Monero": markRaw(IconXMRMonero),
		"DOGE.Dogecoin": markRaw(IconDOGEDogecoin)
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
