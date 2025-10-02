<script setup lang="ts">
	import { computed, ref } from "vue";
	import { useRouter } from "vue-router";
	import { storeToRefs } from "pinia";
	import type { IWalletSummaryResponse } from "@dv-admin/utils/types/api/apiGo";
	import { UiIcon, UiSkeleton } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { changeChainBsc, formatDollars, getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import { getDeclensionWallets } from "@dv-admin/utils/helpers/declensions";

	const { walletSummary, isLoadingWalletSummary, currentBlockchainHotWallets, selectedBlockchainFromDashboard } =
		storeToRefs(useHotWalletsStore());

	const router = useRouter();
	const isShowAll = ref<boolean>(false);

	const isVisibleTable = computed<boolean>(() => {
		if (isLoadingWalletSummary.value) return true;
		return Boolean(walletSummary.value.length);
	});

	const walletSummaryFiltered = computed<IWalletSummaryResponse[]>(() => {
		const sortedWallets = walletSummary.value.toSorted(
			(a: IWalletSummaryResponse, b: IWalletSummaryResponse) => Number(b.balance_usd) - Number(a.balance_usd)
		);
		return isShowAll.value ? sortedWallets : sortedWallets.slice(0, 7);
	});

	const handleClickToggle = () => {
		isShowAll.value = !isShowAll.value;
	};

	const selectCurrencyHandler = async (currencyId: string) => {
		currentBlockchainHotWallets.value = currencyId;
		selectedBlockchainFromDashboard.value = currencyId;
		await router.push({ name: "hotWallets" });
	};
</script>

<template>
	<block-section
		class="wallets"
		v-if="isVisibleTable"
		:title="$t('Hot wallet balances')"
		:info-title="$t('Hot wallets - what are they and what are they for?')"
		:isLoading="isLoadingWalletSummary"
	>
		<template #infoText>
			<div class="ui-tooltip__text flex flex-column gap-12">
				<span>
					{{
						$t(
							"Hot wallets allow us to understand which client sent the payment. In cryptocurrency, it is impossible to determine the purpose of the transfer, so each client has a separate wallet - this way we know exactly who sent the funds"
						)
					}}.
				</span>
				<span>
					{{
						$t(
							"After we have received the funds and understood who they are from, we need to send them to your crypto exchange or personal wallet and the commission for these transfers is taken from your processing wallet"
						)
					}}
				</span>
			</div>
		</template>

		<div v-if="isLoadingWalletSummary" class="flex flex-column gap-16">
			<div class="wallets__skeleton">
				<ui-skeleton :rows="1" :rowHeight="58" :item-border-radius="8" />
				<ui-skeleton :rows="1" :rowHeight="58" :item-border-radius="8" />
				<ui-skeleton :rows="1" :rowHeight="58" :item-border-radius="8" />
				<ui-skeleton :rows="1" :rowHeight="58" :item-border-radius="8" />
			</div>
			<div class="wallets__skeleton">
				<ui-skeleton :rows="1" :rowHeight="58" :item-border-radius="8" />
				<ui-skeleton :rows="1" :rowHeight="58" :item-border-radius="8" />
				<ui-skeleton :rows="1" :rowHeight="58" :item-border-radius="8" />
				<ui-skeleton :rows="1" :rowHeight="58" :item-border-radius="8" />
			</div>
		</div>
		<div v-else class="wallets__inner">
			<div
				v-for="item in walletSummaryFiltered"
				:key="item.currency.id"
				class="wallet"
				@click="selectCurrencyHandler(item.currency.id)"
			>
				<div class="blockchain">
					<blockchain-icon :type="item.currency.id" width="32px" height="32px" />
					<div class="blockchain__content">
						<span class="blockchain__content-title">{{ getCurrentCoin(item.currency.id) }}</span>
						<span class="blockchain__content-subtitle">
							{{ changeChainBsc(getCurrentBlockchain(item.currency.id)) }}
						</span>
					</div>
				</div>
				<div class="price">
					<span class="price__title">{{ formatDollars(item.balance_usd) }}</span>
					<span class="price__subtitle">
						{{ item.count_with_balance }} {{ $t(getDeclensionWallets(item.count_with_balance)) }}
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
			gap: 16px;
		}
		&__inner {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 16px;
			.wallet {
				display: flex;
				align-items: center;
				border-radius: 8px;
				background-color: $blue-opacity;
				padding: 12px 0;
				border: 1px solid transparent;
				transition: border 0.3s ease-in-out;
				animation: fadeIn 0.3s ease;
				@media (hover: hover) {
					&:hover {
						cursor: pointer;
						border: 1px solid $blue;
					}
				}
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
						font-size: 12px;
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
				padding: 12px;
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
