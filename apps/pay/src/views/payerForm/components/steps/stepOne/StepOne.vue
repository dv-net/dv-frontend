<script setup lang="ts">
	import { UiIcon, UiInput, UiSkeleton } from "@dv.net/ui-kit";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { POPULAR_CURRENCY } from "@pay/utils/constants/blockchain";
	import { computed, ref } from "vue";
	import type { IPayerAddressResponse } from "@pay/utils/types/api/apiGo.ts";
	import { changeChainBsc, getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import { useRoute, useRouter } from "vue-router";
	import CardCurrency from "@pay/views/payerForm/components/steps/cardCurrency/CardCurrency.vue";
	import NotFound from "@pay/views/payerForm/components/steps/notFound/NotFound.vue";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";

	const { addresses, currentCurrency, currentStep, currentChain, isLoading, filteredBlockchains } = storeToRefs(usePayerFormStore());

	const router = useRouter();
	const route = useRoute();

	const searchCurrency = ref<string | null>(null);

	const filteredCurrencies = computed<IPayerAddressResponse[]>(() => {
		const unique = new Map<CurrencyType, IPayerAddressResponse>();
		addresses.value.forEach((item) => {
			const coin = getCurrentCoin(item.currency.id) as CurrencyType;
			if (!unique.has(coin)) {
				const blockchains = addresses.value
					.filter((el) => getCurrentCoin(el.currency.id) === coin)
					.map((c) => changeChainBsc(getCurrentBlockchain(c.currency.id)))
					.filter(Boolean) as string[];
				unique.set(coin, { ...item, currency: { ...item.currency, blockchains } });
			}
		});
		let uniqueArray: IPayerAddressResponse[] = Array.from(unique.values());
		if (searchCurrency.value) {
			const searchLower = searchCurrency.value.toLocaleLowerCase("en");
			uniqueArray = uniqueArray.filter((item) =>
				item.currency.id.toLocaleLowerCase("en").includes(searchLower) ||
				searchCurrency.value === item.currency.contract_address
			);
		}
		uniqueArray.sort((a, b) => {
			const coinA = getCurrentCoin(a.currency.id);
			const coinB = getCurrentCoin(b.currency.id);
			const aIsPopular = POPULAR_CURRENCY.includes(coinA as CurrencyType);
			const bIsPopular = POPULAR_CURRENCY.includes(coinB as CurrencyType);
			if (aIsPopular && !bIsPopular) return -1;
			if (!aIsPopular && bIsPopular) return 1;
			return 0;
		});
		return uniqueArray;
	});

	const setCurrency = (currencyId: string) => {
		if (!currencyId) return;
		const token = getCurrentCoin(currencyId);
		currentCurrency.value = token;
		currentChain.value = null;
		const query: Record<string, any> = {
			...(route.query.amount && { amount: route.query.amount }),
			...(route.query.email && { email: route.query.email }),
			token,
		};
		if (filteredBlockchains.value.length === 1) {
			const chain = getCurrentBlockchain(currencyId);
			currentChain.value = chain;
			currentStep.value = 3;
			query.chain = chain;
		} else {
			currentStep.value = 2;
		}
		router.replace({ query });
	};
</script>

<template>
	<wrapper-block>
		<div class="screen">
			<h2 class="global-title-h2">{{ $t("Select cryptocurrency for payment") }}</h2>
			<ui-input
				v-model="searchCurrency"
				is-empty-value-null
				clearable
				@clear="searchCurrency = null"
				:placeholder="$t('Enter cryptocurrency, chain or contract')"
			>
				<template #prepend><ui-icon size="lg" type="400" name="search" /></template>
			</ui-input>
			<div class="block">
				<span class="block__label">{{ $t("All assets") }}</span>
				<div v-if="isLoading" class="block__cards">
					<ui-skeleton v-for="item in 5" :key="item" :rows="1" :row-height="56" :item-border-radius="8" />
				</div>
				<template v-else>
					<div v-if="filteredCurrencies.length" class="block__cards">
						<card-currency
							v-for="item in filteredCurrencies"
							:key="item.currency.id"
							:currency="getCurrentCoin(item.currency.id) as CurrencyType"
							:currency-label="item.currency.currency_label"
							:blockchains="item.currency.blockchains"
							:selected="currentCurrency === getCurrentCoin(item.currency.id)"
							@click="setCurrency(item.currency.id)"
						/>
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
		@include mediamax(480) {
			gap: 20px;
		}
		.block {
			display: flex;
			flex-direction: column;
			gap: 12px;
			&__label {
				color: $main-subtitle-color;
				@include mediamax(768) {
					font-size: 14px;
				}
			}
			&__cards {
				display: grid;
				grid-template-columns: repeat(1, 1fr);
				gap: 12px;
				&-popular {
					grid-template-columns: repeat(2, 1fr);
					@include mediamax(480) {
						gap: 8px;
						&:deep(.card) {
							font-size: 12px;
							padding: 8px;
							.card__block {
								svg {
									width: 20px !important;
									height: 20px !important;
									min-width: 20px !important;
									min-height: 20px !important;
									max-width: 20px !important;
									max-height: 20px !important;
								}
							}
						}
					}
				}
			}
		}
	}
</style>
