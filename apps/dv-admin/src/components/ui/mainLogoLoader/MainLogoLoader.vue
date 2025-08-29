<script setup lang="ts">
	import mainLoader from "@dv-admin/assets/animations/mainLoader.json";
	import { LottieAnimation } from "lottie-web-vue";
</script>

<template>
	<div class="animation">
		<lottie-animation :animation-data="mainLoader" :loop="true" />
	</div>
</template>
<style lang="scss" scoped>
	.animation {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		background-color: $white;
		@extend .center;
	}
</style>
