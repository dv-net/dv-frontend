<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit";
	import WrapperBlock from "@pay-shared/components/payerForm/wrapperBlock/WrapperBlock.vue";
	import BannerInfo from "@pay-shared/components/payerForm/bannerInfo/BannerInfo.vue";
	import TransactionBlockInfo from "@pay-shared/components/payerForm/transactionBlockInfo/TransactionBlockInfo.vue";
	import { buildRefundEntryPartialRoute } from "@pay/utils/helpers/refundEntry";
	import { computed } from "vue";
	import { useRouter } from "vue-router";
	import type { RouteLocationRaw } from "vue-router";
	import type { IPayerAddressResponse } from "@pay-shared/utils/types/payer";
	import type { IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";

	const {
		currentTransaction = null,
		addresses,
		payerId = null,
		storeId = null,
		formattedFiatAmount
	} = defineProps<{
		currentTransaction?: IWalletTransactionResponse | null;
		addresses: IPayerAddressResponse[];
		payerId?: string | null;
		storeId?: string | null;
		formattedFiatAmount: string;
	}>();

	const router = useRouter();

	const refundRoute = computed((): RouteLocationRaw | null => {
		if (!payerId || !storeId) return null;
		return buildRefundEntryPartialRoute({
			wallet_id: payerId,
			store_id: storeId
		});
	});

	const goToRefund = () => {
		if (!refundRoute.value) return;
		void router.push(refundRoute.value);
	};
</script>

<template>
	<div v-if="currentTransaction" class="screen">
		<wrapper-block>
			<div class="info">
				<div class="info__top">
					<div class="content">
						<div class="content__icon" aria-hidden="true">!</div>
						<div class="content__inner">
							<div class="content__title">{{ $t("Your payment did not pass AML verification") }}</div>
							<p class="content__text">
								{{ $t("AML failed contact support or refund") }}
							</p>
							<ui-button
								v-if="refundRoute"
								class="content__action"
								size="lg"
								mode="neutral"
								left-icon-name="account-balance-wallet"
								@click="goToRefund"
							>
								{{ $t("Request a refund") }}
							</ui-button>
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
					&__icon {
						@extend .center;
						width: 64px;
						height: 64px;
						border-radius: 50%;
						background: #fff0f0;
						color: #e53935;
						font-size: 32px;
						font-weight: 700;
						line-height: 1;
					}
					&__inner {
						display: flex;
						flex-direction: column;
						gap: 12px;
						align-items: center;
					}
					&__title {
						text-align: center;
						font-size: 20px;
						font-weight: 600;
						line-height: 24px;
						color: #e53935;
						@include mediamax(768) {
							font-size: 18px;
						}
					}
					&__text {
						margin: 0;
						max-width: 460px;
						text-align: center;
						color: $main-text-grey-color;
						font-size: 16px;
						font-weight: 400;
						line-height: 20px;
						@include mediamax(480) {
							font-size: 14px;
						}
					}
					&__action {
						width: 100%;
						max-width: 320px;
					}
				}
			}
		}
	}
</style>
