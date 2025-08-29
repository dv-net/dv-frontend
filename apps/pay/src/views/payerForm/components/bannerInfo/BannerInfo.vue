<script setup lang="ts">
	import { UiIcon } from "@dv.net/ui-kit";

	defineProps<{ message: string }>();
</script>

<template>
	<div v-if="message" class="banner">
		<ui-icon class="flex-shrink-0" name="info" type="filled" color="#1968E5" />
		<p class="banner__text">{{ message }}</p>
	</div>
</template>

<style scoped lang="scss">
	.banner {
		padding: 12px;
		display: flex;
		align-items: center;
		gap: 8px;
		border-radius: 12px;
		border: 1px solid rgba(25, 104, 229, 0.1);
		background: rgba(25, 104, 229, 0.03);
		&__text {
			color: $main-text-grey-color;
			font-size: 14px;
			font-weight: 400;
			line-height: 140%;
		}
	}
</style>
