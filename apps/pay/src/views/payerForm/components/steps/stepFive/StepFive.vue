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

	const { currentTransaction, payerId, store } = storeToRefs(usePayerFormStore());

	const isMediaMax576 = useMediaQuery("(max-width: 576px)");
	const isMediaMax768 = useMediaQuery("(max-width: 768px)");
</script>

<template>
	<div class="screen">
		<wrapper-block v-if="currentTransaction">
			<div class="info">
				<div class="info__title">
					<h2>{{ $t("Payment successfully approved") }}</h2>
					<ui-icon class="flex-shrink-0" name="check-circle" type="400" />
				</div>
				<div class="info__rows">
					<div class="row">
						<span class="row__label">{{ $t("Payment ID") }}</span>
						<div v-if="payerId" class="row__value flex flex-y-center gap-8">
							<span>{{ truncateHash(payerId, isMediaMax576 ? 6 : 14) }}</span>
							<ui-copy-text :copied-text="payerId" color-icon="#A4A5B1" />
						</div>
						<span v-else>—</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Site") }}</span>
						<ui-link
							v-if="store?.name && (store?.success_url || store.site_url)"
							:href="store?.success_url || store.site_url"
							target="_blank"
							:size="isMediaMax768 ? 'lg' : 'xl'"
							class="row__value flex flex-y-center gap-8"
						>
							<span>{{ store.name }}</span>
							<ui-icon name="new-windows" type="400" />
						</ui-link>
						<span class="row__value" v-else>—</span>
					</div>
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
							{{ getCurrentCoin(currentTransaction.currency_code) }} ({{
								formatDollars(currentTransaction.amount_usd)
							}})
						</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Hash") }}</span>
						<display-hash
							:is-link="false"
							type="transaction"
							:count-prefix="isMediaMax576 ? 6 : 14"
							:hash="currentTransaction.hash"
							:currency-id="currentTransaction.currency_code"
							color-icon="#A4A5B1"
						/>
					</div>
				</div>
				<div class="info__banner">
					<div class="info__banner-title">
						<ui-link href="https://dv.net/" target="_blank">DV.net</ui-link> — DaVinci Merchant
					</div>
					<span class="info__banner-subtitle">{{ $t("Receiving and sending cryptocurrency") }}</span>
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
				color: #1f9649;
				font-size: 20px;
				font-weight: 600;
				@include mediamax(768) {
					font-size: 16px;
				}
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
						gap: 54px;
					}
					@include mediamax(480) {
						gap: 12px;
					}
					&__label {
						color: $main-subtitle-color;
						word-break: break-word;
						@include mediamax(768) {
							font-size: 14px;
						}
					}
					&__value {
						color: $main-text-grey-color;
						word-break: break-word;
						@include mediamax(768) {
							font-size: 14px;
						}
					}
				}
			}
			&__banner {
				display: flex;
				flex-direction: column;
				gap: 8px;
				padding: 12px 14px;
				border-radius: 8px;
				border: 1px solid $main-border-color;
				background-color: #fafcff;
				&-title {
					font-size: 18px;
					@include mediamax(768) {
						font-size: 16px;
					}
					&:deep(.ui-link) {
						font-size: 18px;
						@include mediamax(768) {
							font-size: 16px;
						}
					}
				}
				&-subtitle {
					color: $main-subtitle-color;
					font-size: 14px;
					font-weight: 400;
				}
			}
		}
	}
</style>
