<template>
	<span class="loader"></span>
</template>

<style scoped lang="scss">
	.loader {
		transform: translateZ(1px);
	}
	.loader:after {
		content: "$";
		display: inline-block;
		width: 36px; /* 48px → 75% */
		height: 36px; /* 48px → 75% */
		border-radius: 50%;
		text-align: center;
		line-height: 30px; /* 40px → 75% */
		font-size: 24px; /* 32px → 75% */
		font-weight: bold;
		background: #ffd700;
		color: #daa520;
		border: 3px double; /* 4px → 75% */
		box-sizing: border-box;
		box-shadow: 1.5px 1.5px 1.5px 0.75px rgba(0, 0, 0, 0.1); /* all shadows also ×0.75 */
		animation: coin-flip 4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
	}
	@keyframes coin-flip {
		0%,
		100% {
			animation-timing-function: cubic-bezier(0.5, 0, 1, 0.5);
		}
		0% {
			transform: rotateY(0deg);
		}
		50% {
			transform: rotateY(1800deg);
			animation-timing-function: cubic-bezier(0, 0.5, 0.5, 1);
		}
		100% {
			transform: rotateY(3600deg);
		}
	}
</style>
