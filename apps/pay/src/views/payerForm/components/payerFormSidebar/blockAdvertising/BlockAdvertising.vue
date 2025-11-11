<script setup lang="ts">
	import { UiLink } from "@dv.net/ui-kit";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import { LottieAnimation } from "lottie-web-vue";
	import { onMounted, ref, shallowRef } from "vue";
	import { isDesktopDevice } from "@shared/utils/helpers/media.ts";

	const shieldAnimRef = ref();
	const isHovering = ref<boolean>(false);
	const isPlaying = ref<boolean>(false);
	const shieldAnim = shallowRef<unknown>(null);

	const handleMouseEnter = () => {
		if (!shieldAnim.value) return;
		isHovering.value = true;
		if (!isPlaying.value) {
			shieldAnimRef.value?.goToAndPlay?.(0);
			isPlaying.value = true;
		}
	};

	const handleMouseLeave = () => {
		if (!shieldAnim.value) return;
		isHovering.value = false;
	};

	const handleComplete = () => {
		if (isHovering.value) {
			shieldAnimRef.value?.goToAndPlay?.(0);
			isPlaying.value = true;
		} else {
			isPlaying.value = false;
		}
	};

	const goToLanding = () => {
		window.open("https://dv.net/", "_blank");
	};

	onMounted(async () => {
		try {
			const module = await import("@pay/assets/animations/shield.json");
			shieldAnim.value = module.default;
		} catch (error) {
			console.error(error);
		}
	});
</script>

<template>
	<wrapper-block
		class="wrapper-block"
		@click="goToLanding"
		@mouseenter="handleMouseEnter"
		@mouseleave="handleMouseLeave"
	>
		<div class="advertising">
			<div class="content">
				<div class="content__inner">
					<h2 class="global-title-h2">{{ $t("You pay via DV.net") }}</h2>
					<p>{{ $t("Accept cryptocurrency on your website without paying intermediaries") }}</p>
				</div>
				<lottie-animation
					v-if="isDesktopDevice() && shieldAnim"
					ref="shieldAnimRef"
					class="content__animation"
					:animation-data="shieldAnim"
					:auto-play="false"
					:loop="false"
					@complete="handleComplete"
				/>
				<img v-else class="content__animation" src="/static/shield.png" alt="shield" loading="lazy" />
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
				box-shadow:
					0 4px 12px 1px rgba(171, 176, 187, 0.06),
					0 4px 24px 1px rgba(171, 176, 187, 0.24);
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
			position: relative;
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
				@include mediamax(1180) {
					max-width: 290px;
				}
				@include mediamax(1024) {
					max-width: 324px;
				}
				@include mediamax(480) {
					font-size: 14px;
					font-weight: 500;
					line-height: 16px;
					max-width: 250px;
				}
			}
			&__animation {
				position: absolute;
				top: -22px;
				right: -24px;
				display: flex;
				flex-shrink: 0;
				align-self: baseline;
				width: 120px;
				@include mediamax(1180) {
					width: 100px;
					top: -18px;
				}
				@include mediamax(1024) {
					width: 100px;
					top: -18px;
					right: -18px;
				}
				@include mediamax(480) {
					width: 80px;
					top: -15px;
					right: -15px;
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
