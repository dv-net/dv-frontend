<template>
	<div class="empty-layout">
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.empty-layout {
		flex-grow: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: $main-background;
	}
</style>
