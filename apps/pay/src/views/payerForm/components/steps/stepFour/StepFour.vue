<script setup lang="ts">
	import PaymentDetails from "@pay/views/payerForm/components/steps/paymentDetails/PaymentDetails.vue";
	import { UiIcon } from "@dv.net/ui-kit";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import LoaderDollar from "@pay/components/ui/loaderDollar/LoaderDollar.vue";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";

	const { currentTransaction } = storeToRefs(usePayerFormStore());

	const isMediaMax480 = useMediaQuery("(max-width: 480px)");
</script>

<template>
	<div class="screen">
		<payment-details />
		<wrapper-block v-if="currentTransaction">
			<div class="info">
				<div class="info__title">
					<h2 class="global-title-h2">{{ $t("Payment found") }}</h2>
					<ui-icon class="flex-shrink-0" name="check-circle" type="400" color="#1F9649" />
				</div>
				<div class="info__rows">
					<div class="row">
						<span class="row__label">{{ $t("Time of enrollment") }}</span>
						<span class="row__value">~5 {{ $t("minutes") }}</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Commission") }}</span>
						<span class="row__value">—</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Sum") }}</span>
						<span class="row__value">
						{{ formatAmountBlockchain(currentTransaction.amount, currentTransaction.currency_code) }}
						{{ getCurrentCoin(currentTransaction.currency_code) }} ({{ formatDollars(currentTransaction.amount_usd) }})
					</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Hash") }}</span>
						<display-hash
							:is-link="false"
							type="transaction"
							:count-prefix="isMediaMax480 ? 8 : 14"
							:hash="currentTransaction.hash"
							:currency-id="currentTransaction.currency_code"
							color-icon="#A4A5B1"
						/>
					</div>
				</div>
				<div class="info__banner">
					<div class="info__banner-inner">
						<span class="info__banner-title">{{ $t("Wait for the payment to be confirmed by the network") }}</span>
						<span class="info__banner-subtitle">{{ $t("The higher the commission, the faster the process") }}</span>
					</div>
					<loader-dollar />
				</div>
			</div>
		</wrapper-block>
	</div>
</template>

<style scoped lang="scss">
	.screen {
		display: flex;
		flex-direction: column;
		gap: 24px;
		@include mediamax(768) {
			gap: 20px;
		}
		@include mediamax(480) {
			gap: 12px;
		}
		.info {
			display: flex;
			flex-direction: column;
			gap: 24px;
			&__title {
				display: flex;
				align-items: center;
				gap: 8px;
			}
			&__rows {
				display: flex;
				flex-direction: column;
				gap: 12px;
				.row {
					display: flex;
					align-items: center;
					gap: 80px;
					justify-content: space-between;
					font-weight: 400;
					@include mediamax(768) {
						font-size: 14px;
						gap: 54px;
					}
					@include mediamax(480) {
						gap: 12px;
					}
					&__label {
						word-break: break-word;
						color: $main-subtitle-color;
					}
					&__value {
						color: $main-text-grey-color;
						word-break: break-word;
					}
				}
			}
			&__banner {
				display: flex;
				align-items: center;
				gap: 12px;
				justify-content: space-between;
				padding: 12px 14px;
				border-radius: 8px;
				border: 1px solid $main-border-color;
				background-color: #fafcff;
				&-inner {
					display: flex;
					flex-direction: column;
					gap: 8px;
				}
				&-title {
					font-size: 18px;
					@include mediamax(768) {
						font-size: 16px;
					}
					@include mediamax(480) {
						font-size: 14px;
					}
				}
				&-subtitle {
					color: $main-subtitle-color;
					font-size: 14px;
					font-weight: 400;
					@include mediamax(480) {
						font-size: 12px;
					}
				}
			}
		}
	}
</style>
