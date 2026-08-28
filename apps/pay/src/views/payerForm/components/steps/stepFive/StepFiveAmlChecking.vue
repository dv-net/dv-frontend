<script setup lang="ts">
	import WrapperBlock from "@pay-shared/components/payerForm/wrapperBlock/WrapperBlock.vue";
	import BannerInfo from "@pay-shared/components/payerForm/bannerInfo/BannerInfo.vue";
	import TransactionBlockInfo from "@pay-shared/components/payerForm/transactionBlockInfo/TransactionBlockInfo.vue";
	import { LottieAnimation } from "lottie-web-vue";
	import { shallowRef } from "vue";
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

	const loaderWaitingConfirmation = shallowRef<LottieAnimationData | null>(null);
	void import("@pay-shared/assets/animations/loaderWaitingConfirmation.json").then((module) => {
		loaderWaitingConfirmation.value = module.default;
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
							<div class="content__title">{{ $t("AML verification in progress") }}</div>
							<p class="content__text">
								{{ $t("We are verifying your payment. This may take a few minutes") }}
							</p>
						</div>
					</div>
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
				@extend .center;
				padding: 0 0 44px;
				@include mediamax(480) {
					padding: 0 0 24px;
				}
				.content {
					display: flex;
					align-items: center;
					flex-direction: column;
					gap: 16px;
					&__loader {
						width: 100px;
						@include mediamax(576) {
							width: 80px;
						}
					}
					&__inner {
						display: flex;
						flex-direction: column;
						gap: 8px;
						align-items: center;
					}
					&__title {
						text-align: center;
						font-size: 20px;
						font-weight: 600;
						line-height: 24px;
						color: $main-text-link-and-price-color;
						@include mediamax(768) {
							font-size: 18px;
						}
					}
					&__text {
						margin: 0;
						max-width: 420px;
						text-align: center;
						color: $main-text-grey-color;
						font-size: 16px;
						font-weight: 400;
						line-height: 20px;
						@include mediamax(480) {
							font-size: 14px;
						}
					}
				}
			}
		}
	}
</style>
