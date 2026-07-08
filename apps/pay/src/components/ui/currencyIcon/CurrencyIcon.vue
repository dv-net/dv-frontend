<script setup lang="ts">
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import { type Component, computed, shallowRef, watch } from "vue";
	import { getCurrencyIcon } from "./currencyIconLoaders";

	const {
		width = "24px",
		height = "24px",
		type
	} = defineProps<{
		type?: CurrencyType;
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
		async (currencyType) => {
			const currentLoadId = ++loadId;
			const component = await getCurrencyIcon(currencyType);
			if (currentLoadId === loadId) {
				iconToShow.value = component;
			}
		},
		{ immediate: true }
	);
</script>

<template>
	<component v-if="iconToShow" class="flex-shrink-0" :is="iconToShow" :style="iconStyle" />
	<span v-else class="flex-shrink-0" :style="iconStyle" aria-hidden="true" />
</template>
