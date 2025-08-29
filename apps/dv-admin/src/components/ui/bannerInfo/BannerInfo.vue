<script setup lang="ts">
	import { UiIcon } from "@dv.net/ui-kit";

	defineProps<{ isShow: boolean; text: string }>();
</script>

<template>
	<div v-if="isShow && text" class="banner">
		<ui-icon type="filled" name="check-circle" color="#1F9649" />
		<p class="banner__text">{{ text }}</p>
	</div>
</template>

<style scoped lang="scss">
	.banner {
		display: flex;
		gap: 4px;
		border-radius: 12px;
		border: 1px solid #1f9649;
		background-color: #e6faed;
		padding: 16px;
		&__text {
			color: $black;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
	}
</style>
