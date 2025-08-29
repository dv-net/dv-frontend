<script setup lang="ts">
	defineProps<{ title: string; isNoTranslation?: boolean }>();
</script>

<template>
	<div class="global-input">
		<div class="global-input__label">
			<p>{{ isNoTranslation ? title : $t(title) }}</p>
			<slot name="subtitle" />
		</div>
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.global-input {
		display: flex;
		flex-direction: column;
		gap: 8px;
		&__label {
			display: flex;
			gap: 4px;
			& > p {
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}
		}
	}
</style>
