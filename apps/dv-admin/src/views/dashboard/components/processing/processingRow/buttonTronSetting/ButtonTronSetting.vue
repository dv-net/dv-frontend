<script setup lang="ts">
	import { UiAnimation, UiTooltip } from "@dv.net/ui-kit";
	import { ref } from "vue";
	import { settings2Animation } from "@dv.net/ui-kit/dist/helpers/animations-list";

	const animationRef = ref<any>("animationRef");
</script>

<template>
	<ui-tooltip
		:title="$t('TRON Processing Settings')"
		:text="
			$t(
				'In the Processing Settings section for TRON, you can change the processing mode as well as view detailed information and resource usage statistics.'
			)
		"
	>
		<router-link :to="{ name: 'dashboard-tron-settings' }">
			<ui-animation
				ref="animationRef"
				:width="26"
				:height="26"
				:icon-component="settings2Animation"
				@mouseover="animationRef && animationRef?.lottie?.play()"
				@mouseleave="animationRef && animationRef?.lottie?.stop()"
			/>
		</router-link>
	</ui-tooltip>
</template>