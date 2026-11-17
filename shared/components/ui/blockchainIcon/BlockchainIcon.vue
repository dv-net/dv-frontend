<script setup lang="ts">
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import { getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general";
	import { computed } from "vue";
	import { getBlockchainIconUrl } from "./blockchainIconLoaders";

	const {
		width = "24px",
		height = "24px",
		type
	} = defineProps<{
		type?: BlockchainType;
		width?: string;
		height?: string;
	}>();

	const src = computed(() => getBlockchainIconUrl(type));
	const alt = computed(() => {
		if (!type) return "";
		const coin = getCurrentCoin(type);
		const blockchain = getCurrentBlockchain(type);
		return blockchain ? `${coin} ${blockchain}` : coin;
	});

	const iconStyle = computed(() => ({
		width,
		height,
		minWidth: width,
		minHeight: height,
		maxWidth: width,
		maxHeight: height
	}));
</script>

<template>
	<img class="icon" :src="src" :style="iconStyle" :alt="alt" draggable="false" />
</template>

<style scoped lang="scss">
	.icon {
		display: block;
		flex-shrink: 0;
		object-fit: contain;
	}
</style>
