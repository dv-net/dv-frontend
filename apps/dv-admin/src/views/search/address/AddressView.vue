<script setup lang="ts">
	import {
		capitalizeFirstLetter,
		formatAmountBlockchain,
		formatDollars,
		getCurrentCoin
	} from "@shared/utils/helpers/general";
	import { UiTabs, UiTabsItem } from "@dv.net/ui-kit";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import RowElement from "@dv-admin/views/search/components/rowElement/RowElement.vue";
	import { computed, onMounted, onUnmounted, ref } from "vue";
	import type {
		ITransactionDashboardItem,
		ITransactionRequest,
		IWalletInfoBlockchainAssetResponse
	} from "@dv-admin/utils/types/api/apiGo";
	import { getApiTransaction } from "@dv-admin/services/api/history";
	import { useRoute } from "vue-router";
	import AddressInfo from "@dv-admin/views/search/address/components/addressInfo/AddressInfo.vue";
	import { useSearchStore } from "@dv-admin/stores/search";
	import { storeToRefs } from "pinia";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse.ts";

	const route = useRoute();
	const { wallets, currentIndexWallet, searchValue } = storeToRefs(useSearchStore());
	const { getSearchData, resetSearchValues } = useSearchStore();

	const hash = route.params.hash as string;

	const currentBlockchainTab = ref<string>("");
	const isLoadingTransactions = ref<boolean>(false);
	const transactionsSearchAddress = ref<ITransactionDashboardItem[]>([]);
	const transferHistory = ref<ITransactionDashboardItem[]>([]);

	const filteredBlockchains = computed<IWalletInfoBlockchainAssetResponse[]>(() => {
		if (!wallets.value[currentIndexWallet.value]?.blockchains?.length || !currentBlockchainTab.value) return [];
		return (
			wallets.value[currentIndexWallet.value].blockchains.find((item) => item.blockchain === currentBlockchainTab.value)
				?.assets || []
		);
	});

	const getTransactionsCurrentBlockchain = async () => {
		try {
			isLoadingTransactions.value = true;
			const params: ITransactionRequest = {
				page: 1,
				page_size: 4,
				type: "deposit",
				wallet_address: wallets.value[currentIndexWallet.value]?.address,
				blockchain: currentBlockchainTab.value
			};
			const data = await getApiTransaction(params);
			if (data?.items) transactionsSearchAddress.value = data.items;
		} catch (error: any) {
			console.error(error);
			transactionsSearchAddress.value = [];
		} finally {
			isLoadingTransactions.value = false;
		}
	};

	const getTransferHistory = async () => {
		try {
			const params: ITransactionRequest = {
				page: 1,
				page_size: 4,
				type: "transfer",
				wallet_address: wallets.value[currentIndexWallet.value]?.address,
				blockchain: currentBlockchainTab.value
			};
			const data = await getApiTransaction(params);
			if (data?.items) transferHistory.value = data.items;
		} catch (error: any) {
			console.error(error);
			transferHistory.value = [];
		}
	};

	const getAllInfo = async () => {
		if (wallets.value[currentIndexWallet.value]?.blockchains?.length) {
			currentBlockchainTab.value = wallets.value[currentIndexWallet.value].blockchains[0].blockchain;
		}
		await Promise.all([getTransactionsCurrentBlockchain(), getTransferHistory()]);
	};

	const handleChangeBlockchainTabs = async () => {
		await Promise.all([getTransactionsCurrentBlockchain(), getTransferHistory()]);
	}

	onMounted(async () => {
		if (hash && !wallets.value.length) await getSearchData(hash);
		await getAllInfo();
	});

	onUnmounted(() => {
		resetSearchValues();
		searchValue.value = "";
	});
</script>

<template>
	<div v-if="wallets[currentIndexWallet]" class="address">
		<block-section class="info" radius="md">
			<div class="info__top">
				<h3 class="global-title-h3">{{ $t("Wallet information") }}</h3>
			</div>
			<div class="info__inner">
				<row-element
					class="info__item"
					:label="$t('Address')"
					:value="wallets[currentIndexWallet].address"
					is-copy-value
				/>
				<row-element class="info__item" :label="$t('Total payments')" :value="wallets[currentIndexWallet].total_tx" />
				<row-element class="info__item" label="Email" :value="wallets[currentIndexWallet].email" />
				<row-element
					class="info__item"
					:label="$t('First issue of this wallet')"
					:value="formatDate(wallets[currentIndexWallet].wallet_created_at)"
				/>
				<row-element
					class="info__item"
					:label="$t('Wallet ID')"
					:value="wallets[currentIndexWallet].wallet_id"
					is-copy-value
				/>
				<row-element
					class="info__item"
					:label="$t('Store ID')"
					:value="wallets[currentIndexWallet].store_id"
					is-copy-value
				/>
				<row-element
					class="info__item info__item--border-none"
					:label="$t('Store name')"
					:value="wallets[currentIndexWallet].store_name"
				/>
				<row-element
					class="info__item info__item--border-none"
					:label="$t('Customer ID in the store')"
					:value="wallets[currentIndexWallet].store_external_id"
					is-copy-value
				/>
			</div>
		</block-section>
		<block-section v-if="wallets[currentIndexWallet]?.blockchains?.length" class="assets" radius="md">
			<ui-tabs
				class="assets__tabs"
				mode="light"
				v-model="currentBlockchainTab"
				@change="handleChangeBlockchainTabs"
			>
				<ui-tabs-item
					v-for="item in wallets[currentIndexWallet].blockchains"
					:value="item.blockchain"
					:key="item.blockchain"
				>
					{{ capitalizeFirstLetter(item.blockchain) }}
				</ui-tabs-item>
			</ui-tabs>
			<div class="assets__cards">
				<block-section v-for="item in filteredBlockchains" padding="lg" class="card" :key="item.currency">
					<div class="card__item">
						<blockchain-card :type="item.currency" />
					</div>
					<div class="card__inner">
						<div class="card__item">
							<span class="card__label">{{ $t("Total") }}</span>
							<span>{{ formatAmountBlockchain(item.amount, item.currency) }} {{ getCurrentCoin(item.currency) }}</span>
						</div>
						<div class="card__item">
							<span class="card__label">{{ $t("Total") + " USD" }}</span>
							<span>{{ formatDollars(item.amount_usd) }}</span>
						</div>
					</div>
				</block-section>
			</div>
		</block-section>
		<address-info
			:walletInfo="wallets[currentIndexWallet]"
			:transferHistory="transferHistory"
			:transactionsSearchAddress="transactionsSearchAddress"
			:isLoadingTransactions="isLoadingTransactions"
		/>
	</div>
</template>

<style scoped lang="scss">
	.address {
		display: flex;
		flex-direction: column;
		gap: 24px;
		.info {
			display: flex;
			flex-direction: column;
			gap: 16px;
			&__top {
				display: flex;
				align-items: center;
				justify-content: space-between;
				&-date {
					color: $secondary;
					font-size: 14px;
					font-weight: 500;
					line-height: 20px;
				}
			}
			&__inner {
				display: grid;
				grid-template-columns: 1fr 1fr;
			}
			&__item {
				&--border-none {
					&:deep(.row__inner) {
						border-bottom: none;
					}
				}
				&:nth-child(odd) {
					padding-right: 25px;
					border-right: 1px solid $grey;
				}
				&:nth-child(even) {
					padding-left: 25px;
				}
			}
		}
		.assets {
			display: flex;
			flex-direction: column;
			gap: 16px;
			&__tabs {
				width: max-content;
				min-width: 100px;
			}
			&__cards {
				display: grid;
				gap: 12px;
				grid-template-columns: repeat(3, 1fr);
				.card {
					display: flex;
					flex-direction: column;
					gap: 18px;
					&__inner {
						display: flex;
						flex-direction: column;
						gap: 8px;
						font-size: 14px;
					}
					&__item {
						display: flex;
						align-items: center;
						justify-content: space-between;
					}
					&__label {
						color: #a4a5b1;
					}
				}
			}
		}
	}
</style>
