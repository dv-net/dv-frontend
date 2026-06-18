<template>
	<div class="block">
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.block {
		padding: 24px;
		border-radius: 16px;
		background-color: $form-background;
		@media (max-width: 1024px) {
			padding: 20px;
		}
		@media (max-width: 480px) {
			padding: 16px;
		}
	}
</style>
