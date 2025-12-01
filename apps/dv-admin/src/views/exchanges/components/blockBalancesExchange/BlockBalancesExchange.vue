<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import type { IBalancesCurrentExchangeItem } from "@dv-admin/utils/types/api/apiGo";
	import { UiIcon, UiSkeleton } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import {
		changeChainBsc,
		formatAmountBlockchain,
		formatDollars,
		getCurrentBlockchain,
		getCurrentCoin
	} from "@shared/utils/helpers/general";
	import { getApiBalanceCurrentExchange } from "@dv-admin/services/api/exchangeSettings.ts";
	import type { BlockchainType } from "@shared/utils/types/blockchain";

	const { slug } = defineProps<{ slug?: string }>();

	const isShowAll = ref<boolean>(false);
	const isLoadingBalancesExchange = ref<boolean>(false);
	const balancesExchange = ref<IBalancesCurrentExchangeItem[]>([]);

	const isVisibleTable = computed<boolean>(() => {
		if (isLoadingBalancesExchange.value) return true;
		return Boolean(balancesExchange.value && balancesExchange.value.length);
	});

	const balancesFiltered = computed(() => {
		if (!balancesExchange.value) return [];
		const sortedBalances = balancesExchange.value.toSorted((a, b) => Number(b.amount_usd) - Number(a.amount_usd));
		return isShowAll.value ? sortedBalances : sortedBalances.slice(0, 3);
	});

	const handleClickToggle = () => {
		isShowAll.value = !isShowAll.value;
	};

	const getBalancesExchange = async (slug?: string) => {
		try {
			if (!slug) return;
			isLoadingBalancesExchange.value = true;
			const data = await getApiBalanceCurrentExchange(slug);
			if (data) balancesExchange.value = data.balances;
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingBalancesExchange.value = false;
		}
	};

	onMounted(async () => {
		await getBalancesExchange(slug);
	});
</script>

<template>
	<block-section
		v-if="isVisibleTable"
		class="wallets"
		:title="`${$t('Balances on the exchange')} ${slug?.toLocaleUpperCase('en')}`"
		:info-title="`${$t('Balances on the exchange')} ${slug?.toLocaleUpperCase('en')}`"
		:info-text="$t('Here you can see the current balances on the selected crypto exchange for each currency')"
		:isLoading="isLoadingBalancesExchange"
	>
		<div v-if="isLoadingBalancesExchange" class="wallets__skeleton">
			<ui-skeleton :rows="1" :row-height="52" :item-border-radius="8" />
			<ui-skeleton :rows="1" :row-height="52" :item-border-radius="8" />
			<ui-skeleton :rows="1" :row-height="52" :item-border-radius="8" />
			<ui-skeleton :rows="1" :row-height="52" :item-border-radius="8" />
		</div>
		<div v-else class="wallets__inner">
			<div v-for="item in balancesFiltered" :key="item.currency" class="wallet">
				<div class="blockchain">
					<blockchain-icon :type="item.currency as BlockchainType" width="32px" height="32px" />
					<div class="blockchain__content">
						<span class="blockchain__content-title">{{ getCurrentCoin(item.currency) }}</span>
						<span class="blockchain__content-subtitle">
							{{ changeChainBsc(getCurrentBlockchain(item.currency)) }}
						</span>
					</div>
				</div>
				<div class="price">
					<span class="price__title">{{ formatDollars(item.amount_usd) }}</span>
					<span class="price__subtitle">
						{{ formatAmountBlockchain(item.amount, item.currency) }} {{ getCurrentCoin(item.currency) }}
					</span>
				</div>
			</div>
			<div class="btn-more" @click.stop="handleClickToggle">
				<div class="btn-more__inner">
					<span class="btn-more__plus">
						<ui-icon :name="isShowAll ? 'close' : 'add'" type="400" color="#1968E5" size="lg" />
					</span>
					<span class="btn-more__text">
						{{ isShowAll ? $t("Hide") : $t("Show more") }}
					</span>
				</div>
				<ui-icon :name="isShowAll ? 'arrow-back' : 'arrow-forward 1'" type="400" color="#1968E5" size="lg" />
			</div>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.wallets {
		display: flex;
		flex-direction: column;
		&__skeleton {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 12px;
		}
		&__inner {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 12px;
			.wallet {
				display: flex;
				align-items: center;
				border-radius: 8px;
				background-color: $blue-opacity;
				padding: 8px 0;
				border: 1px solid transparent;
				transition: border 0.3s ease-in-out;
				animation: fadeIn 0.3s ease;
				.blockchain {
					display: flex;
					align-items: center;
					min-width: 120px;
					gap: 8px;
					padding: 0 8px;
					border-right: 1px solid $grey;
					&__content {
						display: flex;
						flex-direction: column;
						font-weight: 500;
						&-title {
							color: $black;
							font-size: 14px;
							line-height: 20px;
						}
						&-subtitle {
							color: $secondary;
							font-size: 11px;
							line-height: 12px;
						}
					}
				}
				.price {
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					flex-grow: 1;
					padding: 0 8px;
					&__title {
						color: $black;
						font-size: 14px;
						font-weight: 500;
						line-height: 16px;
					}
					&__subtitle {
						color: $secondary;
						font-size: 12px;
						font-weight: 400;
						line-height: 16px;
					}
				}
			}
			.btn-more {
				border-radius: 8px;
				border: 1px solid $grey;
				padding: 8px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 8px;
				transition: border 0.3s ease-in-out;
				@media (hover: hover) {
					&:hover {
						cursor: pointer;
						border: 1px solid $blue;
					}
				}
				&__inner {
					display: flex;
					align-items: center;
					gap: 8px;
				}
				&__plus {
					@extend .center;
					width: 32px;
					height: 32px;
					border-radius: 100px;
					background-color: $blue-light;
				}
				&__text {
					color: $secondary;
					font-size: 14px;
					font-weight: 500;
					line-height: 20px;
					width: max-content;
					border-bottom: 2px dashed transparent;
					border-image: repeating-linear-gradient(to right, $secondary 0 6px, transparent 6px 12px) 1;
				}
			}
		}
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>