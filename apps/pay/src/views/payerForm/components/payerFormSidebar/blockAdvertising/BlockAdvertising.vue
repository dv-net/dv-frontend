<script setup lang="ts">
	import { UiLink } from "@dv.net/ui-kit";
</script>

<template>
	<div class="advertising">
		<div class="content">
			<div class="content__inner">
				<h2 class="global-title-h2">{{ $t("You pay via DV.net") }}</h2>
				<p>{{ $t("Accept cryptocurrency on your website without paying intermediaries") }}</p>
			</div>
			<img class="content__img" src="@pay/assets/images/shield.webp" alt="shield" />
		</div>
		<div class="slogan">
			<p class="slogan__inner">
				<ui-link href="https://dv.net/" target="_blank">DaVinci Merchant</ui-link> -
				{{ $t("the cheapest way to accept cryptocurrency on your site") }}
			</p>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.advertising {
		display: flex;
		flex-direction: column;
		border-radius: 16px;
		gap: 38px;
		background-color: $form-background;
		padding: 24px;
		@include mediamax(480) {
			padding: 16px;
			gap: 16px;
		}
		.content {
			display: flex;
			gap: 12px;
			justify-content: space-between;
			&__inner {
				display: flex;
				flex-direction: column;
				gap: 12px;
				color: $main-text-grey-color;
				font-size: 16px;
				font-weight: 400;
				line-height: 140%;
				max-width: 324px;
				width: 100%;
				@include mediamax(480) {
					font-size: 14px;
					font-weight: 500;
					line-height: 16px;
				}
			}
			&__img {
				display: flex;
				flex-shrink: 0;
				align-self: baseline;
				@include mediamax(480) {
					width: 44px;
				}
			}
		}
		.slogan {
			border-radius: 12px;
			border: 1px solid rgba(25, 104, 229, 0.1);
			background-color: rgba(25, 104, 229, 0.02);
			padding: 8px 20px;
			&__inner {
				max-width: 345px;
				width: 100%;
				color: $main-text-grey-color;
				font-size: 14px;
				font-weight: 400;
				line-height: 140%;
			}
		}
	}
</style>
