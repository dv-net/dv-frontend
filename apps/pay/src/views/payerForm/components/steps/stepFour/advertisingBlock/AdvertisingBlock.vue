<script setup lang="ts">
	import mainLoader from "@pay/assets/animations/mainLoader.json";
	import { LottieAnimation } from "lottie-web-vue";
	import { computed, onMounted, onUnmounted, ref, watch } from "vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery";

	const isMediaMin1181 = useMediaQuery("(min-width: 1181px)");

	const advertisingMessageKeys: string[] = [
		"No our fees, everything stays on your server",
		"All wallets are stored on your side",
		"Open Source — all source code is public"
	];
	const activeAdvertisingIndex = ref<number>(0);
	const activeAdvertisingText = computed<string>(() => advertisingMessageKeys[activeAdvertisingIndex.value]);
	const isFirstRender = ref<boolean>(true);

	let advertisingIntervalId: ReturnType<typeof setInterval> | undefined;

	watch(activeAdvertisingIndex, () => {
		if (isFirstRender.value) {
			isFirstRender.value = false;
		}
	});

	onMounted(() => {
		if (!isMediaMin1181.value) return;
		advertisingIntervalId = setInterval(() => {
			activeAdvertisingIndex.value = (activeAdvertisingIndex.value + 1) % advertisingMessageKeys.length;
		}, 3000);
	});

	onUnmounted(() => {
		if (advertisingIntervalId) {
			clearInterval(advertisingIntervalId);
		}
	});
</script>

<template>
	<div v-if="isMediaMin1181" class="advertising">
		<div class="advertising__logo">
			<lottie-animation :animation-data="mainLoader" :loop="true" />
		</div>
		<p class="advertising__text">
			{{
				$t(
					"While you wait for your payment, check out our amazing merchant for accepting cryptocurrency on your website for free"
				)
			}}
		</p>
		<span :key="activeAdvertisingIndex" :class="{ advertising__tag: true, 'advertising__tag--first': isFirstRender }">
			{{ $t(activeAdvertisingText) }}
		</span>
	</div>
</template>

<style scoped lang="scss">
	.advertising {
		width: 357px;
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		&__logo {
			width: 110px;
			height: 32px;
			@extend .center;
			overflow: hidden;
			animation: slideInFromLeft 0.6s ease-out;
			& > svg {
				width: 110px;
			}
		}
		&__text {
			height: 126px;
			padding: 12px 27px;
			color: #6b6d80;
			text-align: center;
			font-size: 16px;
			font-weight: 400;
			line-height: 34px;
			border-radius: 12px;
			background-color: #f0f1f9;
			margin: 17px 0 12px;
			overflow: hidden;
			word-break: break-word;
			animation: slideInFromLeft 0.3s ease-out 0.2s both;
		}
		&__tag {
			display: block;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			width: 100%;
			color: #1f9649;
			text-align: center;
			font-size: 16px;
			font-weight: 400;
			line-height: 34px;
			@extend .center;
			padding: 4px 12px;
			gap: 10px;
			border-radius: 12px;
			background-color: rgba(31, 150, 73, 0.12);
			animation: slideInFromBottom 0.3s ease-out both;
			&--first {
				animation: slideInFromBottom 0.3s ease-out 0.4s both;
			}
		}
	}
	@keyframes slideInFromLeft {
		0% {
			opacity: 0;
			transform: translateX(-80px);
		}
		70% {
			opacity: 1;
			transform: translateX(8px);
		}
		100% {
			transform: translateX(0);
		}
	}

	@keyframes slideInFromBottom {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
