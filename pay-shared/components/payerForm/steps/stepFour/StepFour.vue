<script setup lang="ts">
	import WrapperBlock from "@pay-shared/components/payerForm/wrapperBlock/WrapperBlock.vue";
	import NotFound from "@pay-shared/components/payerForm/notFound/NotFound.vue";
	import BannerInfo from "@pay-shared/components/payerForm/bannerInfo/BannerInfo.vue";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import {
		DEFAULT_CURRENCIES_INFO,
		DEFAULT_CURRENCY_CONFIRMATION,
		DEFAULT_CURRENCY_DEPOSIT_TIME
	} from "@shared/utils/constants/blockchain";
	import { LottieAnimation } from "lottie-web-vue";
	import { computed, defineAsyncComponent, shallowRef } from "vue";
	import TransactionBlockInfo from "@pay-shared/components/payerForm/transactionBlockInfo/TransactionBlockInfo.vue";
	import { useTimer } from "@pay-shared/utils/composables/useTimer.ts";
	import type { IPayerAddressResponse } from "@pay-shared/utils/types/payer";
	import type { IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";

	type LottieAnimationData = Record<string, unknown>;

	const {
		currentTransaction = null,
		addresses,
		payerId = null,
		formattedFiatAmount
	} = defineProps<{
		currentTransaction?: IWalletTransactionResponse | null;
		addresses: IPayerAddressResponse[];
		payerId?: string | null;
		formattedFiatAmount: string;
	}>();

	const { formattedTime, counter } = useTimer(currentTransaction?.created_at);

	const loaderWaitingConfirmation = shallowRef<LottieAnimationData | null>(null);
	void import("@pay-shared/assets/animations/loaderWaitingConfirmation.json").then((module) => {
		loaderWaitingConfirmation.value = module.default;
	});

	const AdvertisingBlock = defineAsyncComponent(
		() => import("@pay-shared/components/payerForm/advertisingBlock/AdvertisingBlock.vue")
	);

	const confirmations = computed<number>(() => {
		if (!currentTransaction) return 0;
		return currentTransaction.currency_code in DEFAULT_CURRENCIES_INFO
			? DEFAULT_CURRENCIES_INFO[currentTransaction.currency_code as BlockchainType].confirmations
			: DEFAULT_CURRENCY_CONFIRMATION;
	});

	const depositTime = computed<number>(() => {
		if (!currentTransaction) return 0;
		return currentTransaction.currency_code in DEFAULT_CURRENCIES_INFO
			? DEFAULT_CURRENCIES_INFO[currentTransaction.currency_code as BlockchainType].depositTime
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
						<lottie-animation
							v-if="loaderWaitingConfirmation"
							class="content__loader"
							:animation-data="loaderWaitingConfirmation"
							:loop="true"
						/>
						<div class="content__inner">
							<div class="content__title">{{ $t("Payment found") }}</div>
							<div class="content__text">
								<span>
									{{ $t("Approximate deposit time") }} {{ depositTime }}
									{{ $i18n.locale === "ru" ? "мин" : "min" }}
								</span>
								<span>{{ $t("Passed") }} {{ formattedTime }}</span>
							</div>
							<span class="content__confirmation">
								{{ confirmed }}/{{ confirmations }} {{ $t("confirmations") }}
							</span>
						</div>
					</div>
					<advertising-block class="info__advertising-block" />
				</div>
				<transaction-block-info
					:current-transaction="currentTransaction"
					:addresses="addresses"
					:payer-id="payerId"
					:formatted-fiat-amount="formattedFiatAmount"
				/>
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
				@extend .center;
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
						color: $main-text-link-and-price-color;
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
