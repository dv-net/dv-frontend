<script setup lang="ts">
	import LoaderSpinner from "@shared/components/ui/loaderSpinner/LoaderSpinner.vue";
</script>

<template>
	<div class="preparing">
		<loader-spinner class="preparing__loader" width="36px" />
		<p class="preparing__text">{{ $t("Preparing wallets") }}...</p>
	</div>
</template>

<style scoped lang="scss">
	.preparing {
		@extend .center;
		flex-direction: column;
		gap: 16px;
		padding: 24px;
		min-height: 112px;

		&__loader {
			color: $main-subtitle-color;
		}

		&__text {
			color: $main-subtitle-color;
			font-size: 14px;
			font-weight: 400;
			line-height: 140%;
			text-align: center;
		}
	}
</style>
