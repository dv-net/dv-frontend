<script setup lang="ts">
	import {
		formatAmountBlockchain,
		formatDollars,
		getCurrentBlockchain,
		getCurrentCoin
	} from "@shared/utils/helpers/general.ts";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";
	import LoaderSpinner from "@pay/components/ui/loaderSpinner/LoaderSpinner.vue";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import NotFound from "@dv-admin/views/search/components/notFound/NotFound.vue";
	import CurrencyIcon from "@pay/components/ui/currencyIcon/CurrencyIcon.vue";
	import BannerInfo from "@pay/views/payerForm/components/steps/bannerInfo/BannerInfo.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import {
		blockchainCurrencyId,
		DEFAULT_CURRENCIES_INFO,
		DEFAULT_CURRENCY_CONFIRMATION,
		DEFAULT_CURRENCY_DEPOSIT_TIME
	} from "@shared/utils/constants/blockchain";
	import { useTimer } from "@shared/utils/composables/useTimer.ts";

	const { formattedTime } = useTimer()
	const { currentTransaction, addresses } = storeToRefs(usePayerFormStore());

	const isMediaMax576 = useMediaQuery("(max-width: 576px)");
	const isMediaMax768 = useMediaQuery("(max-width: 768px)");

	// currentTransaction.value = {
	// 	amount: "155",
	// 	amount_usd: "750",
	// 	created_at: "2025-09-17T12:34:56Z",
	// 	currency_code: "USDT.Tron",
	// 	hash: "0x9f2c3d8b7a6f1e5c4a2b3c9d8e7f6a1b0c9d8e7f6a1b2c3d4e5f6a7b8c9d0e1f",
	// 	type: "deposit"
	// };

	const getLabelBlockchain = (blockchain: "token" | "chain"): string | null => {
		if (!currentTransaction.value) return null;
		if (blockchain === "token") {
			const find = addresses.value.find(
				(item) => getCurrentCoin(currentTransaction.value!.currency_code) === getCurrentCoin(item.currency.id)
			);
			return find?.currency?.currency_label ? `(${find.currency.currency_label})` : null;
		} else if (blockchain === "chain") {
			const find = addresses.value.find((item) => currentTransaction.value!.currency_code === item.currency.id);
			return find?.currency?.token_label ? `(${find.currency.token_label})` : null;
		}
		return null;
	};
</script>

<template>
	<div v-if="currentTransaction" class="screen">
		<wrapper-block>
			<div class="info">
				<div class="info__top">
					<div class="content">
						<loader-spinner :width="isMediaMax768 ? '44px' : '74px'" />
						<div class="content__inner">
							<div class="content__title">{{ $t("Payment found") }}</div>
							<div class="content__text">
								<span>
									{{ $t("Approximate deposit time") }}
									{{
										currentTransaction.currency_code in DEFAULT_CURRENCIES_INFO
											? DEFAULT_CURRENCIES_INFO[currentTransaction.currency_code as BlockchainType].depositTime
											: DEFAULT_CURRENCY_DEPOSIT_TIME
									}}
									{{ $t("staticStrings.min") }}
								</span>
								<span>{{ $t("Passed") }} {{ formattedTime }}</span>
							</div>
							<span class="content__confirmation">
								0/{{
									currentTransaction.currency_code in DEFAULT_CURRENCIES_INFO
										? DEFAULT_CURRENCIES_INFO[currentTransaction.currency_code as BlockchainType].confirmations
										: DEFAULT_CURRENCY_CONFIRMATION
								}}
								{{ $t("confirmations") }}
							</span>
						</div>
					</div>
				</div>
				<div class="info__bottom">
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
						<span class="row__label">{{ $t("Selected currency") }}:</span>
						<div class="row__value row__value--blockchain">
							<currency-icon
								:type="getCurrentCoin(currentTransaction.currency_code) as CurrencyType"
								width="20px"
								height="20px"
							/>
							<span> {{ getCurrentCoin(currentTransaction.currency_code) }} {{ getLabelBlockchain("token") }} </span>
						</div>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Selected chain") }}:</span>
						<div class="row__value row__value--blockchain">
							<blockchain-icon
								:type="blockchainCurrencyId[getCurrentBlockchain(currentTransaction.currency_code).toLowerCase()]"
								width="20px"
								height="20px"
							/>
							<span>
								{{ getCurrentBlockchain(currentTransaction.currency_code) }} {{ getLabelBlockchain("chain") }}
							</span>
						</div>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Commission") }}:</span>
						<span class="row__value">—</span>
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
				padding: 20px 0 16px;
				@include mediamax(768) {
					padding: 10px 0 16px;
				}
				@include mediamax(480) {
					padding: 0 0 16px;
				}
				.content {
					display: flex;
					align-items: center;
					flex-direction: column;
					gap: 24px;
					@include mediamax(768) {
						gap: 16px;
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
						&--blockchain {
							display: flex;
							align-items: center;
							gap: 8px;
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
