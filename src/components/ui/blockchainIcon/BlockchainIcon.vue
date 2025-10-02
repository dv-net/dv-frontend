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
	import IconUsddEthereum from "@shared/components/icons/blockchains/IconUsddEthereum.vue";
	import IconUsddTron from "@shared/components/icons/blockchains/IconUsddTron.vue";
	import IconUsddBsc from "@shared/components/icons/blockchains/IconUsddBsc.vue";
	import IconUsdeEthereum from "@shared/components/icons/blockchains/IconUsdeEthereum.vue";
	import IconUsdeBsc from "@shared/components/icons/blockchains/IconUsdeBsc.vue";
	import IconArbEthereum from "@shared/components/icons/blockchains/IconArbEthereum.vue";
	import IconCakeEthereum from "@shared/components/icons/blockchains/IconCakeEthereum.vue";
	import IconCakeBsc from "@shared/components/icons/blockchains/IconCakeBsc.vue";
	import IconCakeArbitrum from "@shared/components/icons/blockchains/IconCakeArbitrum.vue";
	import IconShibEthereum from "@shared/components/icons/blockchains/IconShibEthereum.vue";
	import IconShibBsc from "@shared/components/icons/blockchains/IconShibBsc.vue";
	import IconPepeEthereum from "@shared/components/icons/blockchains/IconPepeEthereum.vue";
	import IconEnaEthereum from "@shared/components/icons/blockchains/IconEnaEthereum.vue";
	import IconWlfiEthereum from "@shared/components/icons/blockchains/IconWlfiEthereum.vue";
	import IconWlfiBsc from "@shared/components/icons/blockchains/IconWlfiBsc.vue";
	import IconUsd1Ethereum from "@shared/components/icons/blockchains/IconUsd1Ethereum.vue";
	import IconUsd1Bsc from "@shared/components/icons/blockchains/IconUsd1Bsc.vue";
	import IconUsd1Tron from "@shared/components/icons/blockchains/IconUsd1Tron.vue";
	import IconWldEthereum from "@shared/components/icons/blockchains/IconWldEthereum.vue";
	import IconPyusdEthereum from "@shared/components/icons/blockchains/IconPyusdEthereum.vue";
	import IconPyusdArbitrum from "@shared/components/icons/blockchains/IconPyusdArbitrum.vue";
	import IconXautEthereum from "@shared/components/icons/blockchains/IconXautEthereum.vue";
	import IconSandEthereum from "@shared/components/icons/blockchains/IconSandEthereum.vue";
	import IconSandPolygon from "@shared/components/icons/blockchains/IconSandPolygon.vue";
	import IconArbArbitrum from "@shared/components/icons/blockchains/IconArbArbitrum.vue";

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
		"USDD.Tron": markRaw(IconUsddTron),
		"USD1.Tron": markRaw(IconUsd1Tron),
		"ETH.Ethereum": markRaw(IconEthereum),
		"USDC.Ethereum": markRaw(IconUSDCEthereum),
		"DAI.Ethereum": markRaw(IconDAIEthereum),
		"USDT.Ethereum": markRaw(IconUSDTEthereum),
		"USDE.Ethereum": markRaw(IconUsdeEthereum),
		"USDD.Ethereum": markRaw(IconUsddEthereum),
		"USD1.Ethereum": markRaw(IconUsd1Ethereum),
		"SHIB.Ethereum": markRaw(IconShibEthereum),
		"SAND.Ethereum": markRaw(IconSandEthereum),
		"XAUT.Ethereum": markRaw(IconXautEthereum),
		"WLD.Ethereum": markRaw(IconWldEthereum),
		"PYUSD.Ethereum": markRaw(IconPyusdEthereum),
		"ARB.Ethereum": markRaw(IconArbEthereum),
		"LTC.Ethereum": markRaw(IconLTCEthereum),
		"PEPE.Ethereum": markRaw(IconPepeEthereum),
		"WLFI.Ethereum": markRaw(IconWlfiEthereum),
		"TON.Ethereum": markRaw(IconTONEthereum),
		"CAKE.Ethereum": markRaw(IconCakeEthereum),
		"ENA.Ethereum": markRaw(IconEnaEthereum),
		"BNB.BNBSmartChain": markRaw(IconBinance),
		"USDT.BNBSmartChain": markRaw(IconUSDTBinance),
		"USDD.BNBSmartChain": markRaw(IconUsddBsc),
		"USDC.BNBSmartChain": markRaw(IconUSDCBinance),
		"USDE.BNBSmartChain": markRaw(IconUsdeBsc),
		"DAI.BNBSmartChain": markRaw(IconDAIBinance),
		"CAKE.BNBSmartChain": markRaw(IconCakeBsc),
		"SHIB.BNBSmartChain": markRaw(IconShibBsc),
		"WLFI.BNBSmartChain": markRaw(IconWlfiBsc),
		"USD1.BNBSmartChain": markRaw(IconUsd1Bsc),
		"POL.Polygon": markRaw(IconPolygon),
		"USDT.Polygon": markRaw(IconUSDTPolygon),
		"USDC.Polygon": markRaw(IconUSDCPolygon),
		"DAI.Polygon": markRaw(IconDAIPolygon),
		"SAND.Polygon": markRaw(IconSandPolygon),
		"ARB.Arbitrum": markRaw(IconArbArbitrum),
		"ETH.Arbitrum": markRaw(IconETHArbitrum),
		"USDT.Arbitrum": markRaw(IconUSDTArbitrum),
		"USDC.Arbitrum": markRaw(IconUSDCArbitrum),
		"DAI.Arbitrum": markRaw(IconDAIArbitrum),
		"PYUSD.Arbitrum": markRaw(IconPyusdArbitrum),
		"CAKE.Arbitrum": markRaw(IconCakeArbitrum),
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
