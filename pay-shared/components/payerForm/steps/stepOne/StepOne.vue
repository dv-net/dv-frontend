<script setup lang="ts">
	import { UiIcon, UiInput, UiSkeleton } from "@dv.net/ui-kit";
	import { computed, ref, onMounted, onUnmounted } from "vue";
	import type { IPayerAddressResponse } from "@pay-shared/utils/types/payer";
	import { getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import type { CurrencyType } from "@shared/utils/types/blockchain";
	import CardCurrency from "@pay-shared/components/payerForm/cardCurrency/CardCurrency.vue";
	import NotFound from "@pay-shared/components/payerForm/notFound/NotFound.vue";
	import PreparingWallets from "@pay-shared/components/payerForm/preparingWallets/PreparingWallets.vue";
	import WrapperBlock from "@pay-shared/components/payerForm/wrapperBlock/WrapperBlock.vue";
	import { convertToEnglishLayout } from "@pay-shared/utils/helpers/keyboardLayout";
	import { useI18n } from "vue-i18n";
	import { transliterate } from "transliteration";

	const {
		filteredCurrencies,
		addresses,
		isLoading = false,
		isPreparingWallets = false,
		currentCurrency = null,
		getAmountRate
	} = defineProps<{
		filteredCurrencies: IPayerAddressResponse[];
		addresses: IPayerAddressResponse[];
		isLoading?: boolean;
		isPreparingWallets?: boolean;
		currentCurrency?: string | null;
		getAmountRate: (currency: CurrencyType) => string;
	}>();

	const emit = defineEmits<{ selectCurrency: [currencyId: string] }>();

	const { locale } = useI18n();
	const searchCurrency = ref<string | null>(null);

	const currenciesList = computed<IPayerAddressResponse[]>(() => {
		const searchValue = searchCurrency.value?.trim();
		if (!searchValue) return filteredCurrencies;
		const normalizedSearch = searchValue.toLowerCase();
		const searchLower = convertToEnglishLayout(normalizedSearch, locale.value);
		const searchLowerAlt = transliterate(normalizedSearch);
		const isShortQuery = searchValue.length <= 2;
		const matchedCoins = new Set<string>();
		const checkMatch = (text: string, query: string) => {
			return isShortQuery ? text.startsWith(query) : text.includes(query);
		};
		for (const item of addresses) {
			const coin = getCurrentCoin(item.currency.id);
			if (!coin) continue;
			const currencyIdLower = item.currency.id.toLowerCase();
			const { contract_address } = item.currency;
			const matches = [
				searchLower === "bsc" && currencyIdLower.includes("bnbsmartchain"),
				checkMatch(currencyIdLower, searchLower),
				checkMatch(currencyIdLower, searchLowerAlt),
				contract_address === searchValue
			];
			if (matches.some(Boolean)) matchedCoins.add(coin);
		}
		const foundCurrencies = filteredCurrencies.filter((item) =>
			matchedCoins.has(getCurrentCoin(item.currency.id) as string)
		);
		return foundCurrencies.map((item) => ({
			...item,
			currency: {
				...item.currency,
				blockchains: item.currency.blockchains?.map((blockchain) => ({
					...blockchain,
					isActive:
						checkMatch(blockchain.blockchain.toLowerCase(), searchLower) ||
						checkMatch(blockchain.blockchain.toLowerCase(), searchLowerAlt)
				}))
			}
		})) as IPayerAddressResponse[];
	});

	onMounted(() => {
		document.documentElement.style.scrollbarGutter = "stable";
	});
	onUnmounted(() => {
		document.documentElement.style.scrollbarGutter = "unset";
	});
</script>

<template>
	<wrapper-block>
		<div class="screen">
			<h2 class="screen__title">{{ $t("Select cryptocurrency for payment") }}</h2>
			<ui-input
				class="screen__search"
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
					<preparing-wallets v-if="isPreparingWallets" />
					<div v-else-if="currenciesList.length" class="block__cards">
						<card-currency
							v-for="item in currenciesList"
							:key="item.currency.id"
							:currency="getCurrentCoin(item.currency.id) as CurrencyType"
							:currency-label="item.currency.currency_label"
							:blockchains="item.currency.blockchains"
							:selected="currentCurrency === getCurrentCoin(item.currency.id)"
							:amount-rate="getAmountRate(getCurrentCoin(item.currency.id) as CurrencyType)"
							@click="emit('selectCurrency', item.currency.id)"
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
		&__search {
			&:deep(.ui-input__input) {
				&::placeholder {
					@include mediamax(480) {
						font-size: 12px;
					}
				}
			}
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
