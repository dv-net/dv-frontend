<script setup lang="ts"></script>

<template>
	<div class="auth-layout">
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.auth-layout {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #f7f9fb;
		width: 100vw;
		width: 100dvw;
		height: 100vh;
		height: 100dvh;
	}
</style>
