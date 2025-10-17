<script setup lang="ts">
	import { formatDollars, getCurrentCoin, formatAmountBlockchain } from "@shared/utils/helpers/general.ts";
	import { storeToRefs } from "pinia";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import NotFound from "@pay/views/payerForm/components/steps/notFound/NotFound.vue";
	import CurrencyIcon from "@pay/components/ui/currencyIcon/CurrencyIcon.vue";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import BannerInfo from "@pay/views/payerForm/components/steps/bannerInfo/BannerInfo.vue";
	import TransactionBlockInfo from "@pay/views/payerForm/components/steps/transactionBlockInfo/TransactionBlockInfo.vue";
	import loaderSuccessfulPayment from "@pay/assets/animations/loaderSuccessfulPayment.json";
	import { LottieAnimation } from "lottie-web-vue";

	const { currentTransaction } = storeToRefs(usePayerFormStore());

	// currentTransaction.value = {
	// 	amount: "123436454.0099123456",
	// 	amount_usd: "542",
	// 	created_at: "2025-09-17T12:34:56Z",
	// 	currency_code: "BTC.Bitcoin",
	// 	hash: "0x9f2c3d8b7a6f1e5c4a2b3c9d8e7f6a1b0c9d8e7f6a1b2c3d4e5f6a7b8c9d0e1f",
	// 	type: "deposit"
	// };
</script>

<template>
	<div v-if="currentTransaction" class="screen">
		<wrapper-block>
			<div class="info">
				<div class="info__top">
					<div class="content">
						<lottie-animation class="content__loader" :animation-data="loaderSuccessfulPayment" />
						<div class="content__inner">
							<div class="content__title">{{ $t("Payment received successfully") }}!</div>
							<div class="content__amount">
								<currency-icon :type="getCurrentCoin(currentTransaction.currency_code) as CurrencyType" />
								<span>{{ formatAmountBlockchain(currentTransaction.amount, currentTransaction.currency_code, undefined, "—", true) }}</span>
								<span>{{ getCurrentCoin(currentTransaction.currency_code) }}</span>
								<span class="content__amount-usd">({{ formatDollars(currentTransaction.amount_usd, "$", "—", 2) }})</span>
							</div>
						</div>
					</div>
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
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 0 0 44px;
				@include mediamax(480) {
					padding: 0 0 24px;
				}
				.content {
					display: flex;
					align-items: center;
					flex-direction: column;
					&__loader {
						width: 150px;
						@include mediamax(576) {
							width: 100px;
						}
					}
					&__inner {
						display: flex;
						flex-direction: column;
						gap: 8px;
					}
					&__title {
						text-align: center;
						font-size: 20px;
						font-weight: 600;
						line-height: 24px;
						@include mediamax(768) {
							font-size: 18px;
						}
					}
					&__amount {
						@extend .center;
						gap: 6px;
						font-size: 28px;
						font-weight: 600;
						line-height: 32px;
						@include mediamax(768) {
							font-size: 24px;
						}
						&-usd {
							color: $main-text-grey-color;
							font-weight: 400;
							font-size: 20px;
							@include mediamax(768) {
								font-size: 16px;
							}
						}
					}
				}
			}
		}
	}
</style>
