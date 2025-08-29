<script setup lang="ts">
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import { storeToRefs } from "pinia";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import { formatAmountBlockchain } from "@shared/utils/helpers/general.ts";

	const { depositAddresses } = storeToRefs(useExchangeSettingsStore());
</script>

<template>
	<block-section v-if="depositAddresses.length" class="inner">
		<h2 class="global-title-h2">{{ $t("Exchange addresses") }}</h2>
		<div class="addresses">
			<div class="addresses__header">
				<div>{{ $t("Currency") }}</div>
				<div>{{ $t("Address") }}</div>
				<div>{{ $t("Minimum deposit") }}</div>
			</div>
			<div class="addresses__rows">
				<div v-for="item in depositAddresses" :key="item.address" class="addresses__row">
					<div>
						<blockchain-card :type="item.currency" />
					</div>
					<div>
						<display-hash
							type="address"
							:hash="item.address"
							:currency-id="item.currency"
							:count-prefix="1000"
							size-icon="sm"
							:is-link="false"
						/>
					</div>
					<div class="amount">
						<span class="amount__text">{{ formatAmountBlockchain(item.min_deposit_amount, item.currency) }}</span>
					</div>
				</div>
			</div>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.inner {
		display: flex;
		flex-direction: column;
		gap: 16px;
		.addresses {
			display: flex;
			flex-direction: column;
			gap: 12px;
			&__header {
				display: grid;
				grid-template-columns: 200px 1fr 150px;
				gap: 20px;
				color: $grey-opacity;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
				padding: 0 12px;
			}
			&__rows {
				display: flex;
				flex-direction: column;
				border-radius: 12px;
				border: 1px solid #ecf0f5;
				height: 290px;
				overflow-y: auto;
			}
			&__row {
				display: grid;
				grid-template-columns: 200px 1fr 150px;
				gap: 20px;
				padding: 12px;
				border-bottom: 1px solid #ecf0f5;
				&:last-child {
					border-bottom: unset;
				}
				.amount {
					&__text {
						color: $black;
						font-size: 16px;
						font-weight: 400;
						line-height: 20px;
					}
				}
			}
		}
	}
</style>
