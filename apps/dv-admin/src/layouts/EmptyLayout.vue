<script setup lang="ts"></script>

<template>
	<div class="empty-layout">
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.empty-layout {
		flex-grow: 1;
		display: flex;
	}
</style>
