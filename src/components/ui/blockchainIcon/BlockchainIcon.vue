<script setup lang="ts">
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import { type Component, computed, shallowRef, watch } from "vue";
	import { getBlockchainIcon } from "./blockchainIconLoaders";

	const {
		width = "24px",
		height = "24px",
		type
	} = defineProps<{
		type?: BlockchainType;
		width?: string;
		height?: string;
	}>();

	const iconToShow = shallowRef<Component | null>(null);
	let loadId = 0;

	const iconStyle = computed(() => ({
		width,
		height,
		minWidth: width,
		minHeight: height,
		maxWidth: width,
		maxHeight: height
	}));

	watch(
		() => type,
		async (blockchainType) => {
			const currentLoadId = ++loadId;
			const component = await getBlockchainIcon(blockchainType);
			if (currentLoadId === loadId) {
				iconToShow.value = component;
			}
		},
		{ immediate: true }
	);
</script>

<template>
	<component
		v-if="iconToShow"
		class="flex-shrink-0"
		:is="iconToShow"
		:style="iconStyle"
	/>
	<span v-else class="flex-shrink-0" :style="iconStyle" aria-hidden="true" />
</template>
