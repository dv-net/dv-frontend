<script setup lang="ts">
	import { UiIcon, UiInput, UiSkeleton } from "@dv.net/ui-kit";
	import NavigationButtons from "@pay/views/payerForm/components/steps/navigationButtons/NavigationButtons.vue";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { getCurrentBlockchain } from "@shared/utils/helpers/general.ts";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { useRouter, useRoute } from "vue-router";
	import NotFound from "@pay/views/payerForm/components/steps/notFound/NotFound.vue";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import CardSelectBlockchain from "@pay/views/payerForm/components/steps/cardSelectBlockchain/CardSelectBlockchain.vue";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";

	const { filteredBlockchains, searchBlockchains, isLoading, currentStep, currentCurrency, currentChain } =
		storeToRefs(usePayerFormStore());

	const router = useRouter();
	const route = useRoute();

	const setBlockchain = (currencyId: string) => {
		if (!currencyId) return;
		const chain = getCurrentBlockchain(currencyId);
		currentChain.value = chain;
		router.replace({ query: { ...route.query, chain } });
	};
</script>

<template>
	<wrapper-block>
		<div class="screen">
			<h2 class="global-title-h2">{{ $t("select-blockchain.two") }}</h2>
			<ui-input
				v-model="searchBlockchains"
				is-empty-value-null
				clearable
				@clear="searchBlockchains = null"
				:placeholder="$t('Enter blockchain name to search')"
			>
				<template #prepend><ui-icon size="lg" type="400" name="search" /></template>
			</ui-input>
			<ui-skeleton v-if="isLoading" :rows="1" :row-height="76" :item-border-radius="8" />
			<card-select-blockchain
				v-else-if="!isLoading && currentCurrency"
				type="currency"
				:currency="currentCurrency as CurrencyType"
			/>
			<div class="blockchains">
				<span class="currency__label">{{ $t("Blockchains") }}</span>
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
							@click="setBlockchain(item.currency.id)"
						>
							<div class="card__inner">
								<blockchain-icon :type="blockchainCurrencyId[item.currency.blockchain]" />
								<div class="card__blockchain">
								<span>{{
										item.currency.id.includes("BNBSmartChain") ? "BSC" : getCurrentBlockchain(item.currency.id)
									}}</span>
									<span v-if="item.currency.token_label" class="card__blockchain-label">
									({{ item.currency.token_label }})
								</span>
								</div>
							</div>
							<span class="card__commission">{{ $t('Commission') }} —</span>
						</div>
					</div>
					<not-found v-else />
				</template>
			</div>
			<navigation-buttons
				:is-disabled-btn-forward="!Boolean(currentChain)"
				@click-btn-back="currentStep = 1"
				@click-btn-forward="currentStep = 3"
			/>
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
			gap: 12px;
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
					border: 1px solid #1968e5;
				}
				@media (hover: hover) {
					&:hover {
						cursor: pointer;
						border: 1px solid #1968e5;
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
				&__commission {
					color: $main-text-grey-color;
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
