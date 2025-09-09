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

	const { currentTransaction, payerId, store } = storeToRefs(usePayerFormStore());
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
							<span>{{ truncateHash(payerId, 15) }}</span>
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
							size="xl"
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
						{{ getCurrentCoin(currentTransaction.currency_code) }} ({{ formatDollars(currentTransaction.amount_usd) }})
					</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Hash") }}</span>
						<display-hash
							:is-link="false"
							type="transaction"
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
					&__label {
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
				flex-direction: column;
				gap: 8px;
				padding: 12px 14px;
				border-radius: 8px;
				border: 1px solid $main-border-color;
				background-color: #fafcff;
				&-title {
					font-size: 18px;
					&:deep(.ui-link) {
						font-size: 18px;
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
