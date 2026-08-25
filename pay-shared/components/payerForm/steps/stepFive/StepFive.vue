<script setup lang="ts">
	import { formatAmountBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import WrapperBlock from "@pay-shared/components/payerForm/wrapperBlock/WrapperBlock.vue";
	import NotFound from "@pay-shared/components/payerForm/notFound/NotFound.vue";
	import CurrencyIcon from "@pay-shared/components/ui/currencyIcon/CurrencyIcon.vue";
	import type { CurrencyType } from "@shared/utils/types/blockchain";
	import BannerInfo from "@pay-shared/components/payerForm/bannerInfo/BannerInfo.vue";
	import TransactionBlockInfo from "@pay-shared/components/payerForm/transactionBlockInfo/TransactionBlockInfo.vue";
	import loaderSuccessfulPayment from "@pay-shared/assets/animations/loaderSuccessfulPayment.json";
	import { LottieAnimation } from "lottie-web-vue";
	import type { IPayerAddressResponse } from "@pay-shared/utils/types/payer";
	import type { IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";

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
								<span>{{
									formatAmountBlockchain(currentTransaction.amount, {
										currencyId: currentTransaction.currency_code,
										thousandSeparator: ","
									})
								}}</span>
								<span>{{ getCurrentCoin(currentTransaction.currency_code) }}</span>
								<span class="content__amount-usd">({{ formattedFiatAmount }})</span>
							</div>
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
				@extend .center;
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
