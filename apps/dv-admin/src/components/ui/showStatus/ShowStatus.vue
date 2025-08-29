<script setup lang="ts">
	withDefaults(defineProps<{ text: string; mode?: string; wFull?: boolean }>(), {
		mode: "accent"
	});
</script>

<template>
	<div class="label" :class="[mode, { 'w-full': wFull }]">
		{{ text }}
	</div>
</template>

<style scoped lang="scss">
	.label {
		@extend .center;
		width: max-content;
		padding: 4px 12px;
		border-radius: 4px;
		border: 1px solid $blue;
		color: $blue;
		font-size: 12px;
		font-weight: 500;
		line-height: 16px;
		text-align: center;
		word-break: break-word;
		&.w-full {
			@extend .w-full;
		}
		&.accent {
			color: $blue;
			border: 1px solid $blue;
		}
		&.warning {
			color: #ff9e00;
			border: 1px solid #ff9e00;
		}
		&.positive {
			color: #1f9649;
			border: 1px solid #1f9649;
		}
		&.negative {
			color: #dd4c1e;
			border: 1px solid #dd4c1e;
		}
		&.neutral {
			color: #070707;
			border: 1px solid $grey-light;
		}
	}
</style>
