<script setup lang="ts">
	import { LottieAnimation } from "lottie-web-vue";
	import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
	import mainLoader from "@pay/assets/animations/mainLoader.json";
	import { useI18n } from "vue-i18n";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";

	const { locale } = useI18n();
	const isMediaMax480 = useMediaQuery("(max-width: 480px)");

	const advertisingTextRef = ref<HTMLParagraphElement | null>(null);
	const lineHeightAdvertisingText = ref<number>(34);
	const activeAdvertisingIndex = ref<number>(0);
	const isFirstRender = ref<boolean>(true);
	let advertisingIntervalId: ReturnType<typeof setInterval> | undefined;
	const advertisingMessageKeys: string[] = [
		"No our fees, everything stays on your server",
		"All wallets are stored on your side",
		"Open Source — all source code is public"
	];

	const activeAdvertisingText = computed<string>(() => advertisingMessageKeys[activeAdvertisingIndex.value]);

	const getLineHeightAdvertisingText = async (): Promise<number> => {
		await nextTick();
		if (isMediaMax480.value) return 16;
		if (!advertisingTextRef.value) return 34;
		const scrollHeight = advertisingTextRef.value.scrollHeight;
		const clientHeight = advertisingTextRef.value.clientHeight;
		if (scrollHeight > clientHeight) return 20;
		return 34;
	};

	watch(activeAdvertisingIndex, () => {
		if (isFirstRender.value) isFirstRender.value = false;
	});

	watch(locale, async (newValue) => {
		if (newValue) {
			lineHeightAdvertisingText.value = await getLineHeightAdvertisingText();
		}
	});

	onMounted(async () => {
		lineHeightAdvertisingText.value = await getLineHeightAdvertisingText();
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
	<div class="advertising">
		<a class="advertising__logo" :href="`https://dv.net/${locale}`" target="_blank">
			<lottie-animation :animation-data="mainLoader" :loop="true" />
		</a>
		<p ref="advertisingTextRef" class="advertising__text" :style="`line-height: ${lineHeightAdvertisingText}px`">
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
		display: flex;
		flex-direction: column;
		align-items: center;
		@include mediamax(480) {
			width: 100%;
		}
		&__logo {
			width: 130px;
			@extend .center;
			overflow: hidden;
			animation: slideInFromLeft 0.6s ease-out;
			transition: transform 0.1s ease-in-out;
			@media (hover: hover) {
				&:hover {
					transform: scale(1.01);
					cursor: pointer;
				}
			}
			& > svg {
				width: 110px;
			}
		}
		&__text {
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
			overflow-y: auto;
			height: 126px;
			padding: 12px 27px;
			color: #6b6d80;
			font-size: 16px;
			font-weight: 400;
			line-height: 34px;
			border-radius: 12px;
			background-color: #f0f1f9;
			margin: 5px 0 12px;
			word-break: break-word;
			animation: slideInFromLeft 0.3s ease-out 0.2s both;
			@include mediamax(480) {
				font-size: 12px;
				padding: 12px;
				height: unset;
				margin: 5px 0 8px;
				line-height: 16px;
			}
		}
		&__tag {
			display: block;
			white-space: nowrap;
			overflow-x: auto;
			width: 100%;
			color: #1f9649;
			text-align: center;
			font-size: 16px;
			font-weight: 400;
			line-height: 34px;
			padding: 4px 12px;
			gap: 10px;
			border-radius: 12px;
			background-color: rgba(31, 150, 73, 0.12);
			animation: slideInFromBottom 0.3s ease-out both;
			@include mediamax(480) {
				font-size: 12px;
				line-height: 16px;
				white-space: unset;
				overflow-x: unset;
				word-break: break-word;
			}
			&::-webkit-scrollbar {
				height: 4px !important;
			}
			&::-webkit-scrollbar-track {
				margin: 0 15px !important;
			}
			&::-webkit-scrollbar-thumb {
				background-color: #1f9649 !important;
			}
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
