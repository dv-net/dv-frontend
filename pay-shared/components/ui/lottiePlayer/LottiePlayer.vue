<script lang="ts">
	import { defineAsyncComponent } from "vue";
	import { loadLottiePlayer } from "@pay-shared/utils/helpers/lottie";

	/** Module scope: once resolved, every instance renders the player synchronously */
	const LottieAnimation = defineAsyncComponent(loadLottiePlayer);
</script>

<script setup lang="ts">
	import { shallowRef, watch } from "vue";
	import {
		getLoadedLottieAnimation,
		loadLottieAnimation,
		type LottieAnimationData,
		type LottieAnimationName
	} from "@pay-shared/utils/helpers/lottie";

	const { name, loop = true } = defineProps<{ name: LottieAnimationName; loop?: boolean }>();

	const animationData = shallowRef<LottieAnimationData | null>(getLoadedLottieAnimation(name));
	let requestId = 0;

	watch(
		() => name,
		async (value) => {
			const id = ++requestId;
			animationData.value = getLoadedLottieAnimation(value);
			if (animationData.value) return;
			try {
				const data = await loadLottieAnimation(value);
				if (id === requestId) animationData.value = data;
			} catch (error) {
				console.error(error);
			}
		},
		{ immediate: true }
	);
</script>

<template>
	<div class="lottie-player">
		<lottie-animation
			v-if="animationData"
			:key="name"
			class="lottie-player__animation"
			:animation-data="animationData"
			:loop="loop"
		/>
	</div>
</template>

<style scoped lang="scss">
	.lottie-player {
		&__animation {
			width: 100%;
			height: 100%;
			:deep(svg) {
				display: block;
			}
		}
	}
</style>
