<script setup lang="ts">
	import { UiCopyText, UiIcon, UiLink } from "@dv.net/ui-kit";
	import {
		formatAmountBlockchain,
		formatDollars,
		getCurrentCoin,
		truncateHash
	} from "@shared/utils/helpers/general.ts";
	import { storeToRefs } from "pinia";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";
	import NotFound from "@dv-admin/views/search/components/notFound/NotFound.vue";
	import CurrencyIcon from "@pay/components/ui/currencyIcon/CurrencyIcon.vue";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import BannerInfo from "@pay/views/payerForm/components/steps/bannerInfo/BannerInfo.vue";

	const { currentTransaction, payerId, store } = storeToRefs(usePayerFormStore());

	const isMediaMax576 = useMediaQuery("(max-width: 576px)");
	const isMediaMax768 = useMediaQuery("(max-width: 768px)");

	// currentTransaction.value = {
	// 	amount: "155",
	// 	amount_usd: "750",
	// 	created_at: "2025-09-17T12:34:56Z",
	// 	currency_code: "BTC.Bitcoin",
	// 	hash: "0x9f2c3d8b7a6f1e5c4a2b3c9d8e7f6a1b0c9d8e7f6a1b2c3d4e5f6a7b8c9d0e1f",
	// 	type: "deposit"
	// }
</script>

<template>
	<div v-if="currentTransaction" class="screen">
		<wrapper-block>
			<div class="info">
				<div class="info__top">
					<div class="content">
						<img class="content__img" src="/static/done.png" alt="done" loading="lazy" />
						<div class="content__inner">
							<div class="content__title">{{ $t("Payment received successfully") }}!</div>
							<div class="content__amount">
								<currency-icon :type="getCurrentCoin(currentTransaction.currency_code) as CurrencyType" />
								<span>{{ currentTransaction.amount }}</span>
								<span>{{ getCurrentCoin(currentTransaction.currency_code) }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="info__bottom">
					<div class="row">
						<span class="row__label">{{ $t("Payment ID") }}:</span>
						<div v-if="payerId" class="row__value row__value--payer-id">
							<span>{{ truncateHash(payerId, isMediaMax576 ? 12 : 1000) }}</span>
							<ui-copy-text :copied-text="payerId" color-icon="#A4A5B1" :size-icon="isMediaMax576 ? 'sm' : 'md'" />
						</div>
						<span v-else>—</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Site") }}:</span>
						<ui-link
							v-if="store?.name && (store?.success_url || store.site_url)"
							:href="store?.success_url || store.site_url"
							target="_blank"
							:size="isMediaMax768 ? 'lg' : 'xl'"
							class="row__value flex flex-y-center gap-8"
						>
							<span>{{ store.name }}</span>
							<ui-icon name="new-windows" type="400" :size="isMediaMax576 ? 'sm' : 'md'" />
						</ui-link>
						<span class="row__value" v-else>—</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Time of enrollment") }}:</span>
						<span class="row__value">~5 {{ $t("minutes") }}</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Commission") }}:</span>
						<span class="row__value">—</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Sum") }}:</span>
						<span class="row__value">
							{{ formatAmountBlockchain(currentTransaction.amount, currentTransaction.currency_code) }}
							{{ getCurrentCoin(currentTransaction.currency_code) }} ({{
								formatDollars(currentTransaction.amount_usd)
							}})
						</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Hash") }}:</span>
						<display-hash
							:is-link="false"
							type="transaction"
							:count-prefix="isMediaMax576 ? 12 : 1000"
							:hash="currentTransaction.hash"
							:currency-id="currentTransaction.currency_code"
							color-icon="#A4A5B1"
							:size-icon="isMediaMax576 ? 'sm' : 'md'"
						/>
					</div>
				</div>
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
				padding: 20px 0 44px;
				@include mediamax(768) {
					padding: 10px 0 44px;
				}
				@include mediamax(480) {
					padding: 0 0 24px;
				}
				.content {
					display: flex;
					align-items: center;
					flex-direction: column;
					gap: 24px;
					min-height: 190px;
					@include mediamax(768) {
						gap: 16px;
						min-height: 156px;
					}
					@include mediamax(480) {
						min-height: unset;
					}
					&__img {
						width: 102px;
						height: 102px;
						flex-shrink: 0;
						@include mediamax(768) {
							width: 80px;
							height: 80px;
						}
						@include mediamax(480) {
							width: 54px;
							height: 54px;
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
					}
				}
			}
			&__bottom {
				display: flex;
				flex-direction: column;
				gap: 20px;
				padding: 24px;
				border-radius: 12px;
				border: 1px solid $main-border-color;
				@include mediamax(768) {
					padding: 16px;
					gap: 14px;
				}
				.row {
					display: flex;
					align-items: center;
					gap: 80px;
					justify-content: space-between;
					font-weight: 400;
					color: $main-text-grey-color;
					font-size: 16px;
					@include mediamax(768) {
						gap: 54px;
					}
					@include mediamax(480) {
						gap: 34px;
					}
					&__label {
						flex-shrink: 0;
						@include mediamax(768) {
							font-size: 14px;
						}
						@include mediamax(576) {
							font-size: 12px;
						}
					}
					&__value {
						word-break: break-word;
						@include mediamax(768) {
							font-size: 14px;
						}
						@include mediamax(576) {
							font-size: 12px;
						}
						&--payer-id {
							display: flex;
							align-items: center;
							gap: 8px;
							& > span {
								text-align: right;
							}
						}
					}
					&:deep(.ui-link) {
						word-break: break-word;
						display: flex;
						text-align: right;
						@include mediamax(768) {
							font-size: 14px;
						}
						@include mediamax(576) {
							font-size: 12px;
						}
					}
				}
			}
		}
	}
</style>
