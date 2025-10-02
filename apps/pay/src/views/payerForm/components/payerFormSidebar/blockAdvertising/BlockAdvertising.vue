<script setup lang="ts">
	import { UiLink } from "@dv.net/ui-kit";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";

	const goToLanding = () => {
		window.open("https://dv.net/", "_blank");
	}
</script>

<template>
	<wrapper-block class="wrapper-block" @click="goToLanding">
		<div class="advertising">
			<div class="content">
				<div class="content__inner">
					<h2 class="global-title-h2">{{ $t("You pay via DV.net") }}</h2>
					<p>{{ $t("Accept cryptocurrency on your website without paying intermediaries") }}</p>
				</div>
				<img class="content__img" src="/static/shield.png" alt="shield" />
			</div>
			<div class="slogan">
				<p class="slogan__inner">
					<ui-link>DaVinci Merchant</ui-link> -
					{{ $t("the cheapest way to accept cryptocurrency on your site") }}
				</p>
			</div>
		</div>
	</wrapper-block>
</template>

<style scoped lang="scss">
	.wrapper-block {
		border: 1px solid transparent;
		transition: all 0.3s ease-in-out;
		@media (hover: hover) {
			&:hover {
				cursor: pointer;
				border: 1px solid rgba(22, 126, 180, 0.44);
				box-shadow: 0 4px 12px 1px rgba(171, 176, 187, 0.06), 0 4px 24px 1px rgba(171, 176, 187, 0.24);
			}
		}
	}
	.advertising {
		display: flex;
		flex-direction: column;
		gap: 38px;
		flex-grow: 1;
		@include mediamax(480) {
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
