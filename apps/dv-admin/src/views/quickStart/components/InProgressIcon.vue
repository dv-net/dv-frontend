<template>
	<div class="in-progress-icon-container">
		<div class="dot" />
	</div>
</template>

<style scoped lang="scss">
	.in-progress-icon-container {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #ecf0f5;
		border-radius: 100%;
		width: 24px;
		height: 24px;

		.dot {
			width: 6px;
			height: 6px;
			background-color: #1968e5;
			border-radius: 100%;
		}
	}
</style>
