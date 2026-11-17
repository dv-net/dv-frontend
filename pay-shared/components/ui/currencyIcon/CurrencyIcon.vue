<script setup lang="ts">
	import type { CurrencyType } from "@shared/utils/types/blockchain";
	import { computed } from "vue";
	import { getCurrencyIconUrl } from "./currencyIconLoaders";

	const {
		width = "24px",
		height = "24px",
		type
	} = defineProps<{
		type?: CurrencyType;
		width?: string;
		height?: string;
	}>();

	const src = computed(() => getCurrencyIconUrl(type));
	const alt = computed(() => type ?? "");

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
