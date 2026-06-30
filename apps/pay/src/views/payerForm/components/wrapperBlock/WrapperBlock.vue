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
		@include mediamax(1024) {
			padding: 20px;
		}
		@include mediamax(480) {
			padding: 16px;
		}
	}
</style>
