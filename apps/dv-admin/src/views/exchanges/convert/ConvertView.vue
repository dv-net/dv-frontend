<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { UiButton, UiIcon, UiRadio, UiRadioGroup, UiSelect, UiSkeleton } from "@dv.net/ui-kit";
	import { computed, onMounted, ref } from "vue";
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general";
	import { UiInput } from "@dv.net/ui-kit/dist";
	import { storeToRefs } from "pinia";
	import { useAutoExchangeStore } from "@dv-admin/stores/withdrawal/autoExchange";
	import { RecycleScroller } from "vue-virtual-scroller";
	import { useRoute, useRouter } from "vue-router";
	import { hasExchangeCycle } from "@dv-admin/utils/helpers/autoExchange";
	import type { IExchangePairsResponse } from "@dv-admin/utils/types/api/apiGo";
	import BannerAttention from "@dv-admin/components/ui/bannerAttention/BannerAttention.vue";
	import NotFoundMessage from "@dv-admin/components/ui/notFoundMessage/NotFoundMessage.vue";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { ONLY_LETTERS_AND_NUMBERS_REGEX, WITHOUT_SLASH_REGEX } from "@shared/utils/constants/regex";
	import BlockBalancesExchange
		from "@dv-admin/views/exchanges/components/blockBalancesExchange/BlockBalancesExchange.vue";

	const { exchangePairs, exchangeUserPairs, isLoading, isLoadingPutExchangePairs } =
		storeToRefs(useAutoExchangeStore());
	const { putExchangePairs, getAllExchangePairs } = useAutoExchangeStore();
	const route = useRoute();
	const router = useRouter();

	const slug = route.params.slug as string;
	const isShowWarning = ref<boolean>(false);
	const currentBlockCurrency = ref<string>("usdt");
	const currentBlock = ref<string>("2");
	const searchPairs = ref<string>("");
	const options: IUiSelectOptions[] = [{ value: "usdt", label: "USDT" }];

	const handleAddPairs = (displayName: string) => {
		if (exchangeUserPairs.value.includes(displayName)) return;
		exchangeUserPairs.value.push(displayName);
		isShowWarning.value = hasExchangeCycle(exchangeUserPairs.value);
	};

	const handleDeletePair = (displayName: string) => {
		exchangeUserPairs.value = exchangeUserPairs.value.filter((item) => item !== displayName);
		isShowWarning.value = hasExchangeCycle(exchangeUserPairs.value);
	};

	const filteredExchangePairs = computed<IExchangePairsResponse[]>(() => {
		const regex = new RegExp(searchPairs.value.replace(ONLY_LETTERS_AND_NUMBERS_REGEX, ""), "i");

		return searchPairs.value
			? exchangePairs.value.filter((item) => item.display_name.replace(WITHOUT_SLASH_REGEX, "").match(regex))
			: exchangePairs.value;
	});

	const getOnlyPair = (pairs: string): { base: string; quote: string } => {
		const [base, quote] = pairs.split("/");
		return { base, quote };
	};

	onMounted(async () => {
		await getAllExchangePairs(slug);
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Crypto exchanges')" back-name-route="exchanges" />

		<div class="flex flex-y-center flex-x-between mb-8">
			<h1 class="global-title-h2">{{ $t("Auto exchange") }}</h1>
			<ui-button
				type="secondary"
				right-icon-name="arrow-forward 1"
				right-icon-size="lg"
				@click="router.push({ name: 'exchanges-convert-history', params: { slug } })"
			>
				{{ $t("View exchanges") }}
			</ui-button>
		</div>

		<block-balances-exchange :slug="slug" />

		<ui-radio-group class="page__blocks" v-model="currentBlock">
			<block-section class="section w-full" :class="{ opacity: currentBlock !== '1' }">
				<div class="section__top">
					<ui-radio value="1" />
					<h2 class="global-title-h3">{{ $t("Automatically convert all income into one selected currency") }}</h2>
				</div>
				<p class="section__text">
					{{
						$t(
							'All incoming cryptocurrency will be automatically converted into the currency you choose. In addition, on the "Auto Withdrawal" tab, you can set up automatic sending of funds from the crypto exchange to your cold wallet'
						)
					}}.
				</p>
				<block-section mode="grey-border">
					<global-input title="Select which currency to convert all receipts into">
						<ui-select v-model="currentBlockCurrency" :options="options" size="lg" />
					</global-input>
				</block-section>
			</block-section>

			<block-section class="section w-full" :class="{ opacity: currentBlock !== '2' }">
				<div class="section__top">
					<ui-radio value="2" />
					<h2 class="global-title-h3">{{ $t("Select the pairs you want to change") }}</h2>
				</div>
				<p class="section__text">
					{{
						$t(
							"The exchange will be carried out only for the selected currency pairs and in the specified direction. If the pair is not selected, the currency will remain on the exchange unchanged"
						)
					}}.
				</p>
				<div class="section__blocks">
					<block-section class="select-pairs" mode="grey-border" padding="lg">
						<h3 class="select-pairs__title">{{ $t("Select the currency pairs you want to convert") }}</h3>
						<div class="select-pairs__inner">
							<ui-input v-model="searchPairs" :placeholder="$t('Search')">
								<template #prepend>
									<ui-icon type="400" size="sm" name="search" />
								</template>
							</ui-input>

							<ui-skeleton v-if="isLoading" :rows="4" :row-height="29" :item-border-radius="8" :rows-gap="11" />

							<div v-else>
								<recycle-scroller
									v-if="filteredExchangePairs.length"
									class="select-pairs__list"
									:items="filteredExchangePairs"
									:item-size="38"
									key-field="display_name"
									v-slot="{ item }"
								>
									<div class="select-pairs__item" @click="handleAddPairs(item.display_name)">
										<span>
											{{ $t("all") }} <b>{{ getOnlyPair(item.display_name).base }}</b> {{ $t("convert to") }}
											<b>{{ getOnlyPair(item.display_name).quote }}</b>
										</span>
										<span class="select-pairs__item-button global-center">
											<ui-icon type="400" color="#303345" size="md" name="add" />
										</span>
									</div>
								</recycle-scroller>
								<not-found-message v-else size="sm" />
							</div>
						</div>
					</block-section>
					<block-section class="auto-pairs" mode="grey-border" padding="lg">
						<h3 class="auto-pairs__title">{{ $t("Automatically exchanging pairs") }}</h3>
						<ul class="auto-pairs__list">
							<li v-for="item in exchangeUserPairs" class="auto-pairs__item" :key="item">
								<span>
									{{ $t("all") }} <b>{{ getOnlyPair(item).base }}</b> {{ $t("convert to") }}
									<b>{{ getOnlyPair(item).quote }}</b>
								</span>
								<ui-icon
									class="auto-pairs__item-close"
									type="400"
									color="#1968E5"
									name="close"
									size="sm"
									@click="handleDeletePair(item)"
								/>
							</li>
						</ul>
					</block-section>
				</div>
			</block-section>
		</ui-radio-group>

		<banner-attention
			:text="$t('Attention! Exchange cycle detected in given pairs. Eliminate duplicate or cyclical connections')"
			:is-show-banner="isShowWarning"
		/>

		<ui-button mode="neutral" size="xl" :loading="isLoadingPutExchangePairs" @click="putExchangePairs(slug)">
			{{ $t("Save") }}
		</ui-button>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;

		&__actions {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		&__blocks {
			display: flex;
			flex-direction: column;
			gap: 24px;
		}
	}

	.section {
		display: flex;
		flex-direction: column;

		&.opacity {
			opacity: 0.6;
		}

		&__top {
			display: flex;
			align-items: center;
			gap: 16px;
		}

		&__text {
			color: $secondary;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			margin: 12px 0 20px;
		}

		&__blocks {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 16px;
		}

		.select-pairs {
			&__title {
				color: #202229;
				font-size: 16px;
				font-weight: 500;
				line-height: 20px;
				margin-bottom: 16px;
			}

			&__inner {
				display: flex;
				flex-direction: column;
				gap: 12px;
			}

			&__list {
				display: flex;
				flex-direction: column;
				height: 150px;
				overflow-y: auto;
				padding-right: 12px;
			}

			&__item {
				color: $secondary;
				font-size: 14px;
				font-weight: 400;
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 10px;
				height: 38px;

				b {
					color: $black;
					font-weight: 500;
				}

				&-button {
					border-radius: 6px;
					background-color: #ecf0f5;
					padding: 4px;
					cursor: pointer;
					width: max-content;
				}
			}
		}

		.auto-pairs {
			&__title {
				color: #202229;
				font-size: 16px;
				font-weight: 500;
				line-height: 20px;
				margin-bottom: 16px;
			}

			&__list {
				display: flex;
				flex-direction: column;
				gap: 12px;
				height: 172px;
				overflow-y: auto;
				padding-right: 10px;
			}

			&__item {
				border-radius: 4px;
				border: 1px solid $blue;
				display: flex;
				padding: 8px 12px;
				align-items: center;
				gap: 4px;
				color: $blue;
				font-size: 12px;
				font-weight: 400;
				line-height: 16px;

				b {
					font-weight: 700;
				}

				&-close {
					cursor: pointer;
				}
			}
		}
	}
</style>
