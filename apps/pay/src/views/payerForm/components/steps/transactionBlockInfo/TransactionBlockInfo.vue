<script setup lang="ts">
	import {
		formatAmountBlockchain,
		formatDollars,
		getCurrentBlockchain,
		getCurrentCoin,
		truncateHash
	} from "@shared/utils/helpers/general.ts";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import CurrencyIcon from "@pay/components/ui/currencyIcon/CurrencyIcon.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";
	import { storeToRefs } from "pinia";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { UiCopyText } from "@dv.net/ui-kit";

	const { currentTransaction, addresses, payerId } = storeToRefs(usePayerFormStore());

	const isMediaMax576 = useMediaQuery("(max-width: 576px)");

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
	<div v-if="currentTransaction" class="transaction">
		<div class="row">
			<span class="row__label">{{ $t("Payment ID") }}:</span>
			<div v-if="payerId" class="row__value row__value--payer-id">
				<span>{{ truncateHash(payerId, isMediaMax576 ? 12 : 1000) }}</span>
				<ui-copy-text :copied-text="payerId" color-icon="#A4A5B1" :size-icon="isMediaMax576 ? 'sm' : 'md'" />
			</div>
			<span v-else>—</span>
		</div>
		<div class="row">
			<span class="row__label">{{ $t("Sum") }}:</span>
			<span class="row__value">
				{{ formatAmountBlockchain(currentTransaction.amount, currentTransaction.currency_code) }}
				{{ getCurrentCoin(currentTransaction.currency_code) }} ({{ formatDollars(currentTransaction.amount_usd) }})
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
				<span>{{ getCurrentBlockchain(currentTransaction.currency_code) }} {{ getLabelBlockchain("chain") }}</span>
			</div>
		</div>
		<!--					<div class="row">-->
		<!--						<span class="row__label">{{ $t("Commission") }}:</span>-->
		<!--						<span class="row__value">—</span>-->
		<!--					</div>-->
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
</template>

<style scoped lang="scss">
	.transaction {
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
</style>
