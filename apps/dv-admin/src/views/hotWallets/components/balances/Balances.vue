<script setup lang="ts">
	import { UiRadio, UiRadioGroup, UiLink } from "@dv.net/ui-kit/dist";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import { storeToRefs } from "pinia";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general";
	import { computed, ref, watch } from "vue";

	const {
		walletSummary,
		isLoadingWalletSummary,
		currentBlockchainHotWallets,
		walletBalancesHot,
		displayedWallets,
		selectedBlockchainFromDashboard
	} = storeToRefs(useHotWalletsStore());
	const { getWallets } = useHotWalletsStore();

	const isMinimizedWallets = ref<boolean>(true);
	const filteredWallets = computed(() =>
		isMinimizedWallets.value ? walletSummary.value.slice(0, displayedWallets.value) : walletSummary.value
	);

	const isVisibleTable = computed<boolean>(() => {
		if (isLoadingWalletSummary.value) return true;
		return Boolean(walletSummary.value.length);
	});

	const handleClickRow = async (id: string) => {
		if (id === currentBlockchainHotWallets.value) return;
		currentBlockchainHotWallets.value = id;
		await getWallets();
	};

	const totalCountWallets = computed<number>(() => {
		return Math.floor(walletSummary.value.reduce((sum, item) => sum + item.count_with_balance, 0));
	});

	const sortedBalances = () => {
		walletSummary.value.sort((a) => (a.currency.id !== currentBlockchainHotWallets.value ? 1 : -1));
	};

	watch(
		() => walletSummary.value,
		() => {
			if (selectedBlockchainFromDashboard.value === currentBlockchainHotWallets.value) sortedBalances();
		}
	);
</script>

<template>
	<div v-if="isVisibleTable">
		<ui-radio-group class="table" size="sm" v-model="currentBlockchainHotWallets">
			<h2 class="table__label">{{ $t("Hot wallet balances") }}</h2>

			<div class="table__header">
				<div class="table__header-column">{{ $t("Cryptocurrency") }}</div>
				<div class="table__header-column">{{ $t("Number of wallets") }}</div>
				<div class="table__header-column">{{ $t("Balance") }}</div>
				<div class="table__header-column">{{ $t("Balance") }} (USD)</div>
			</div>

			<div class="table__body">
				<div
					class="row"
					v-for="item in filteredWallets"
					:key="item.currency.id"
					@click="handleClickRow(item.currency.id)"
				>
					<div class="row__column">
						<ui-radio :value="item.currency.id" />
						<blockchain-card :type="item.currency.id" />
					</div>
					<div class="row__column">{{ item.count_with_balance }}</div>
					<div class="row__column">
						{{ formatAmountBlockchain(item.balance, item.currency.id) }} {{ getCurrentCoin(item.currency.id) }}
					</div>
					<div class="row__column row__column--bitcoin">{{ formatDollars(item.balance_usd) }}</div>
				</div>

				<div v-if="walletSummary.length > 3" class="flex center py-10">
					<ui-link @click="isMinimizedWallets = !isMinimizedWallets" size="lg" class="global-link-dashed">
						{{ isMinimizedWallets ? `${$t("Show all")} (${walletSummary.length})` : $t("Hide") }}
					</ui-link>
				</div>
			</div>

			<div class="table__footer">
				<div class="table__footer-inner" @click="handleClickRow('all')">
					<div class="table__footer-column table__footer-column--actions">
						<ui-radio value="all" />
						<span>{{ $t("By all coins") }}</span>
					</div>
					<div class="table__footer-column">{{ totalCountWallets ?? "-" }}</div>
					<div class="table__footer-column"></div>
					<div class="table__footer-column">
						{{ formatDollars(walletBalancesHot) }}
					</div>
				</div>
			</div>
		</ui-radio-group>
	</div>
</template>

<style scoped lang="scss">
	.table {
		position: relative;
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		align-items: unset;
		border: 1px solid $grey;
		padding: 24px 0;

		&__label {
			position: absolute;
			top: -14px;
			left: 56px;
			background-color: $white;
			padding: 0 16px;
			color: $black;
			font-size: 20px;
			font-weight: 600;
		}

		&__header {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			padding: 0 20px;

			&-column {
				color: $grey-opacity;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}
		}

		&__body {
			display: flex;
			flex-direction: column;
			padding: 12px 14px;
			border-bottom: 1px solid $grey;

			.row {
				@extend .no-select;
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				padding: 8px 10px;
				@media (hover: hover) {
					&:hover {
						cursor: pointer;
						border-radius: 8px;
						background-color: $blue-opacity;
					}
				}

				&__column {
					color: $secondary;
					font-size: 16px;
					font-weight: 500;
					line-height: 20px;
					display: flex;
					align-items: center;
					gap: 16px;

					&--bitcoin {
						color: #ff9e00;
					}

					&--tron {
						color: #1f9649;
					}
				}
			}
		}

		&__footer {
			display: flex;
			padding: 12px 14px 0;

			&-inner {
				@extend .no-select;
				width: 100%;
				padding: 8px 10px;
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				@media (hover: hover) {
					&:hover {
						cursor: pointer;
						border-radius: 8px;
						background-color: $blue-opacity;
					}
				}
			}

			&-column {
				color: $black;
				font-size: 14px;
				font-weight: 500;
				line-height: 16px;

				&--actions {
					display: flex;
					align-items: center;
					gap: 8px;
				}
			}
		}
	}
</style>
