<script setup lang="ts">
	import { UiIcon, UiLink } from "@dv.net/ui-kit";
	import { computed } from "vue";
	import {
		changeChainBsc,
		formatAmountBlockchain,
		getCurrentBlockchain,
		getCurrentCoin
	} from "@shared/utils/helpers/general.ts";
	import { getSafeUrl } from "@shared/utils/helpers/url";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";
	import type { IPayerAddressResponse, IPayerStoreResponse } from "@pay-shared/utils/types/payer";
	import type { IWalletTransactionResponse } from "@pay-shared/utils/types/transaction";

	const {
		currentTransaction,
		addresses,
		store = null,
		formattedFiatAmount
	} = defineProps<{
		currentTransaction: IWalletTransactionResponse;
		addresses: IPayerAddressResponse[];
		store?: IPayerStoreResponse | null;
		formattedFiatAmount: string;
	}>();

	const isMediaMax576 = useMediaQuery("(max-width: 576px)");
	const safeSiteUrl = computed(() => getSafeUrl(store?.site_url));

	const present = (value?: string | null) => value?.trim() || "";

	const assetLabel = computed(() => {
		const currency = addresses.find((item) => item.currency.id === currentTransaction.currency_code)?.currency;
		const currencyLabel = present(currentTransaction.currency_label) || present(currency?.currency_label);
		const tokenLabel = present(currentTransaction.token_label) || present(currency?.token_label);
		const coin = getCurrentCoin(currentTransaction.currency_code);
		const chain = changeChainBsc(getCurrentBlockchain(currentTransaction.currency_code));
		const title = [coin, currencyLabel].filter(Boolean).join(" ");
		const network = [chain, tokenLabel].filter(Boolean).join(" ");
		return network ? `${title} (${network})` : title;
	});
</script>

<template>
	<div class="transaction">
		<div v-if="safeSiteUrl" class="row">
			<span class="row__label">{{ $t("Site") }}:</span>
			<ui-link :href="safeSiteUrl" target="_blank" :size="isMediaMax576 ? 'md' : 'lg'" class="row__site">
				<span>{{ store?.name || safeSiteUrl }}</span>
				<ui-icon name="new-windows" type="400" :size="isMediaMax576 ? 'sm' : 'md'" />
			</ui-link>
		</div>
		<div class="row">
			<span class="row__label">{{ $t("Sum") }}:</span>
			<span class="row__value">
				{{
					formatAmountBlockchain(currentTransaction.amount, {
						currencyId: currentTransaction.currency_code,
						thousandSeparator: ","
					})
				}}
				{{ getCurrentCoin(currentTransaction.currency_code) }} ({{ formattedFiatAmount }})
			</span>
		</div>
		<div class="row">
			<span class="row__label">{{ $t("Cryptocurrency and chain") }}:</span>
			<div class="row__value row__value--blockchain">
				<blockchain-icon :type="currentTransaction.currency_code as BlockchainType" width="20px" height="20px" />
				<span>{{ assetLabel }}</span>
			</div>
		</div>
		<div class="row">
			<span class="row__label">{{ $t("Hash") }}:</span>
			<display-hash
				:is-link="false"
				type="transaction"
				:count-prefix="1000"
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
			@include mediamax(576) {
				flex-direction: column;
				align-items: flex-start;
				gap: 4px;
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
			}
			&__site {
				display: flex;
				align-items: center;
				gap: 8px;
				min-width: 0;
			}
			&:deep(.ui-link) {
				word-break: break-word;
				display: flex;
				align-items: center;
				gap: 8px;
				text-align: right;
				@include mediamax(768) {
					font-size: 14px;
				}
				@include mediamax(576) {
					justify-content: flex-start;
					font-size: 12px;
					text-align: left;
				}
			}
		}
	}
</style>
