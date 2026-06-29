<script setup lang="ts">
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import NotFound from "@pay/views/payerForm/components/steps/notFound/NotFound.vue";
	import BannerInfo from "@pay/views/payerForm/components/steps/bannerInfo/BannerInfo.vue";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import {
		DEFAULT_CURRENCIES_INFO,
		DEFAULT_CURRENCY_CONFIRMATION,
		DEFAULT_CURRENCY_DEPOSIT_TIME
	} from "@shared/utils/constants/blockchain";
	import loaderWaitingConfirmation from "@pay/assets/animations/loaderWaitingConfirmation.json";
	import { LottieAnimation } from "lottie-web-vue";
	import { computed, defineAsyncComponent } from "vue";
	import TransactionBlockInfo from "@pay/views/payerForm/components/steps/transactionBlockInfo/TransactionBlockInfo.vue";
	import { useTimer } from "@pay/utils/composables/useTimer.ts";

	const { currentTransaction } = storeToRefs(usePayerFormStore());
	const { formattedTime, counter } = useTimer(currentTransaction.value?.created_at);

	// currentTransaction.value = {
	// 	amount: "155",
	// 	amount_usd: "750",
	// 	created_at: "2025-09-17T12:34:56Z",
	// 	currency_code: "USDT.Tron",
	// 	hash: "0x9f2c3d8b7a6f1e5c4a2b3c9d8e7f6a1b0c9d8e7f6a1b2c3d4e5f6a7b8c9d0e1f",
	// 	type: "deposit"
	// };

	const AdvertisingBlock = defineAsyncComponent(
		() => import("@pay/views/payerForm/components/steps/stepFour/advertisingBlock/AdvertisingBlock.vue")
	);

	const confirmations = computed<number>(() => {
		if (!currentTransaction.value) return 0;
		return currentTransaction.value.currency_code in DEFAULT_CURRENCIES_INFO
			? DEFAULT_CURRENCIES_INFO[currentTransaction.value.currency_code as BlockchainType].confirmations
			: DEFAULT_CURRENCY_CONFIRMATION;
	});

	const depositTime = computed<number>(() => {
		if (!currentTransaction.value) return 0;
		return currentTransaction.value.currency_code in DEFAULT_CURRENCIES_INFO
			? DEFAULT_CURRENCIES_INFO[currentTransaction.value.currency_code as BlockchainType].depositTime
			: DEFAULT_CURRENCY_DEPOSIT_TIME;
	});

	const confirmed = computed<number>(() => {
		return Math.min(Math.floor((counter.value / (depositTime.value * 60)) * confirmations.value), confirmations.value);
	});
</script>

<template>
	<div v-if="currentTransaction" class="screen">
		<wrapper-block>
			<div class="info">
				<div class="info__top">
					<div class="content">
						<lottie-animation class="content__loader" :animation-data="loaderWaitingConfirmation" :loop="true" />
						<div class="content__inner">
							<div class="content__title">{{ $t("Payment found") }}</div>
							<div class="content__text">
								<span> {{ $t("Approximate deposit time") }} {{ depositTime }} {{ $t("staticStrings.min") }} </span>
								<span>{{ $t("Passed") }} {{ formattedTime }}</span>
							</div>
							<span class="content__confirmation"> {{ confirmed }}/{{ confirmations }} {{ $t("confirmations") }} </span>
						</div>
					</div>
					<advertising-block class="info__advertising-block" />
				</div>
				<transaction-block-info />
			</div>
		</wrapper-block>
		<banner-info />
	</div>
	<wrapper-block v-else>
		<not-found />
	</wrapper-block>
</template>

<style scoped lang="scss">
	.screen {
		display: flex;
		flex-direction: column;
		gap: 20px;
		@include mediamax(1024) {
			gap: 16px;
		}
		@include mediamax(768) {
			gap: 12px;
		}
		@include mediamax(480) {
			gap: 16px;
		}
		.info {
			display: flex;
			flex-direction: column;
			&__top {
				position: relative;
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 0 0 16px;
				@include mediamax(1180) {
					justify-content: unset;
					flex-direction: column;
				}
				.content {
					display: flex;
					align-items: center;
					flex-direction: column;
					gap: 24px;
					@include mediamax(1180) {
						order: 2;
					}
					@include mediamax(768) {
						gap: 16px;
					}
					&__loader {
						width: 100px;
						@include mediamax(576) {
							width: 80px;
						}
					}
					&__inner {
						display: flex;
						flex-direction: column;
					}
					&__title {
						text-align: center;
						font-size: 20px;
						font-weight: 600;
						line-height: 24px;
						color: #6acd8d;
						@include mediamax(768) {
							font-size: 18px;
						}
					}
					&__text {
						display: flex;
						flex-direction: column;
						gap: 2px;
						align-items: center;
						margin: 2px 0 12px;
						color: $main-text-grey-color;
						font-size: 16px;
						font-weight: 400;
						line-height: 20px;
						@include mediamax(480) {
							font-size: 14px;
						}
					}
					&__confirmation {
						text-align: center;
						color: #1968e5;
						font-size: 20px;
						font-weight: 500;
						@include mediamax(768) {
							font-size: 18px;
						}
						@include mediamax(480) {
							font-size: 16px;
						}
					}
				}
			}
			&__advertising-block {
				position: absolute;
				top: 0;
				right: 0;
				@include mediamax(1180) {
					position: unset;
					order: 1;
				}
			}
		}
	}
</style>
