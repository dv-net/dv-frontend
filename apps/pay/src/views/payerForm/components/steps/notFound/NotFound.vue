<template>
	<div class="not-found">{{ $t("Not found") }}</div>
</template>

<style scoped lang="scss">
	.not-found {
		@extend .center;
		padding: 12px 24px;
		border-radius: 8px;
		border: 1px solid $main-border-color;
		min-height: 112px;
	}
</style>
