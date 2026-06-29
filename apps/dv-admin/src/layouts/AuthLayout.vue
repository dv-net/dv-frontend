<script setup lang="ts"></script>

<template>
	<div class="auth-layout">
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.auth-layout {
		@extend .center;
		background-color: $blue-opacity;
		width: 100vw;
		width: 100dvw;
		height: 100vh;
		height: 100dvh;
	}
</style>
