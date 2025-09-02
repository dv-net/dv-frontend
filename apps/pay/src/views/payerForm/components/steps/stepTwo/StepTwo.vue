<script setup lang="ts">
	import { UiIcon, UiInput, UiSkeleton } from "@dv.net/ui-kit";
	import NavigationButtons from "@pay/views/payerForm/components/steps/navigationButtons/NavigationButtons.vue";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { getCurrentBlockchain } from "@shared/utils/helpers/general.ts";
	import CardCurrency from "@pay/views/payerForm/components/steps/cardCurrency/CardCurrency.vue";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { useRouter, useRoute } from "vue-router";
	import NotFound from "@pay/views/payerForm/components/steps/notFound/NotFound.vue";
	import { computed } from "vue";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";

	const { filteredBlockchains, searchBlockchains, isLoading, currentStep, currentCurrency, currentChain, addresses } =
		storeToRefs(usePayerFormStore());
	const { getAmountRate } = usePayerFormStore();

	const router = useRouter();
	const route = useRoute();

	const currentCurrencyLabel = computed<string | null>(() => {
		const find = addresses.value.find((item) => item.currency.code === currentCurrency.value);
		return find ? find.currency.currency_label : null;
	});

	const setBlockchain = (currencyId: string) => {
		if (!currencyId) return;
		const chain = getCurrentBlockchain(currencyId);
		currentChain.value = chain;
		router.replace({ query: { ...route.query, chain } });
	};
</script>

<template>
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
		<div v-if="isLoading || currentCurrency" class="currency">
			<span class="currency__label">{{ $t("Selected currency") }}</span>
			<ui-skeleton v-if="isLoading" :rows="1" :row-height="56" :item-border-radius="8" />
			<card-currency
				v-else
				:currency="currentCurrency as CurrencyType"
				:currency-label="currentCurrencyLabel"
				mode="grey"
				:is-hover-active="false"
			/>
		</div>
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
						<span class="card__price"> ~ {{ getAmountRate(item.currency.id) }} {{ currentCurrency }} </span>
					</div>
				</div>
				<not-found v-else />
			</template>
		</div>
		<navigation-buttons
			class="mt-48"
			:is-disabled-btn-forward="!Boolean(currentChain)"
			@click-btn-back="currentStep = 1"
			@click-btn-forward="currentStep = 3"
		/>
	</div>
</template>

<style scoped lang="scss">
	.screen {
		padding: 24px;
		display: flex;
		flex-direction: column;
		border-radius: 16px;
		gap: 24px;
		background-color: $form-background;
		.currency {
			display: flex;
			flex-direction: column;
			gap: 12px;
			&__label {
				color: $main-subtitle-color;
				font-size: 16px;
				font-weight: 500;
			}
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
				padding: 8px 24px;
				border-radius: 8px;
				min-height: 56px;
				border: 1px solid $main-border-color;
				background-color: $form-background;
				transition: border 0.3s ease-in-out;
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
					&-label {
						color: $main-text-grey-color;
						font-size: 16px;
						font-weight: 400;
						line-height: 20px;
					}
				}
				&__price {
					color: $main-text-grey-color;
					font-size: 14px;
					font-weight: 400;
				}
			}
		}
	}
</style>
