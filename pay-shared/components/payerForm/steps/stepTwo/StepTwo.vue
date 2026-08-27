<script setup lang="ts">
	import { UiSkeleton } from "@dv.net/ui-kit";
	import { changeChainBsc, getCurrentBlockchain } from "@shared/utils/helpers/general.ts";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import NotFound from "@pay-shared/components/payerForm/notFound/NotFound.vue";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import CardSelectBlockchain from "@pay-shared/components/payerForm/cardSelectBlockchain/CardSelectBlockchain.vue";
	import type { BlockchainType, CurrencyType } from "@shared/utils/types/blockchain";
	import WrapperBlock from "@pay-shared/components/payerForm/wrapperBlock/WrapperBlock.vue";
	import type { IPayerAddressResponse } from "@pay-shared/utils/types/payer";

	const {
		filteredBlockchains,
		isLoading = false,
		currentCurrency = null,
		currentChain = null,
		addresses,
		amountRate = "0",
		currencyId
	} = defineProps<{
		filteredBlockchains: IPayerAddressResponse[];
		isLoading?: boolean;
		currentCurrency?: string | null;
		currentChain?: string | null;
		addresses: IPayerAddressResponse[];
		amountRate?: string;
		currencyId?: BlockchainType;
	}>();

	const emit = defineEmits<{
		selectBlockchain: [currencyId: string];
		changeCurrency: [];
	}>();
</script>

<template>
	<wrapper-block>
		<div class="screen">
			<ui-skeleton v-if="isLoading" :rows="1" :row-height="76" :item-border-radius="8" />
			<card-select-blockchain
				v-else-if="!isLoading && currentCurrency"
				type="currency"
				:currency="currentCurrency as CurrencyType"
				:currency-id="currencyId"
				:addresses="addresses"
				:amount-rate="amountRate"
				@change="emit('changeCurrency')"
			/>
			<div class="blockchains">
				<h2 class="blockchains__title">{{ $t("select-blockchain.two") }}</h2>
				<div v-if="isLoading" class="blockchains__cards">
					<ui-skeleton v-for="item in 3" :key="item" :rows="1" :row-height="56" :item-border-radius="8" />
				</div>
				<template v-else>
					<div v-if="filteredBlockchains.length" class="blockchains__cards">
						<div
							v-for="item in filteredBlockchains"
							:key="item.currency.id"
							class="card"
							:class="{ selected: currentChain === getCurrentBlockchain(item.currency.id) }"
							@click="emit('selectBlockchain', item.currency.id)"
						>
							<div class="card__inner">
								<blockchain-icon :type="blockchainCurrencyId[item.currency.blockchain]" />
								<div class="card__blockchain">
									<span>{{ changeChainBsc(getCurrentBlockchain(item.currency.id)) }}</span>
									<span v-if="item.currency.token_label" class="card__blockchain-label">
										({{ item.currency.token_label }})
									</span>
								</div>
							</div>
						</div>
					</div>
					<not-found v-else />
				</template>
			</div>
		</div>
	</wrapper-block>
</template>

<style scoped lang="scss">
	.screen {
		display: flex;
		flex-direction: column;
		gap: 24px;
		@include mediamax(768) {
			gap: 20px;
		}
		.blockchains {
			display: flex;
			flex-direction: column;
			gap: 20px;
			@include mediamax(1024) {
				gap: 12px;
			}
			&__title {
				color: $main-title-color;
				font-family: $font-family-main;
				font-size: 20px;
				font-weight: 600;
				line-height: 120%;
				@include mediamax(768) {
					font-size: 18px;
				}
				@include mediamax(480) {
					font-size: 16px;
				}
			}
			&__cards {
				display: flex;
				flex-direction: column;
				gap: 12px;
			}
			.card {
				display: flex;
				align-items: center;
				gap: 12px;
				justify-content: space-between;
				padding: 12px 24px;
				border-radius: 8px;
				border: 1px solid $main-border-color;
				background-color: $form-background;
				transition: border 0.3s ease-in-out;
				@include mediamax(768) {
					padding: 12px 16px;
				}
				@include mediamax(480) {
					gap: 8px;
					padding: 8px 12px;
				}
				&.selected {
					border: 1px solid $main-text-link-and-price-color;
				}
				@media (hover: hover) {
					&:hover {
						cursor: pointer;
						border: 1px solid $main-text-link-and-price-color;
					}
				}
				&__inner {
					display: flex;
					align-items: center;
					gap: 8px;
				}
				&__blockchain {
					display: flex;
					align-items: center;
					gap: 4px;
					@include mediamax(576) {
						font-size: 14px;
					}
					@include mediamax(480) {
						font-size: 12px;
					}
					&-label {
						color: $main-text-grey-color;
						font-size: 16px;
						font-weight: 400;
						line-height: 20px;
						@include mediamax(576) {
							font-size: 14px;
						}
						@include mediamax(480) {
							font-size: 12px;
						}
					}
				}
			}
		}
	}
</style>
