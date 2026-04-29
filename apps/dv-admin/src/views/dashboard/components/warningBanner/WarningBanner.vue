<script setup lang="ts">
	import { UiButton, UiIcon } from "@dv.net/ui-kit";

	defineProps<{
		text: string;
		buttonText?: string;
		buttonLoading?: boolean;
	}>();

	const emits = defineEmits(["buttonClick"]);
</script>

<template>
	<div class="warning-banner">
		<ui-icon name="error" type="400" color="#dd4c1e" />
		<p class="warning-banner__text">{{ text }}</p>
		<ui-button
			v-if="buttonText"
			class="flex-shrink-0"
			mode="neutral"
			size="sm"
			:loading="buttonLoading"
			@click="emits('buttonClick')"
		>
			{{ buttonText }}
		</ui-button>
	</div>
</template>

<style scoped lang="scss">
	.warning-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		border-radius: 8px;
		border: 1px solid #dd4c1e;
		background-color: #fcede8;
		padding: 12px;
		&__text {
			color: $black;
			font-size: 14px;
			font-weight: 500;
			line-height: 15px;
			flex: 1;
		}
	}
</style>
