<script setup lang="ts">
	import { onMounted } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { useSearchStore } from "@dv-admin/stores/search";
	import { storeToRefs } from "pinia";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import type { IWalletInfoBlockchainResponse } from "@dv-admin/utils/types/api/apiGo";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import type { BlockchainType } from "@shared/utils/types/blockchain";

	const route = useRoute();
	const router = useRouter();
	const { wallets, currentIndexWallet } = storeToRefs(useSearchStore());
	const { getSearchData } = useSearchStore();

	const searchParams = route.params.searchParams as string;

	const goToInfoWallet = async (address: string, index: number) => {
		currentIndexWallet.value = index;
		await router.push({ params: { hash: address }, name: "search-address" });
	};

	const getCurrencyId = (blockchains: IWalletInfoBlockchainResponse[]) => {
		return blockchains.reduce((acc: string[], item: IWalletInfoBlockchainResponse) => {
			if (item.blockchain in blockchainCurrencyId) {
				acc.push(blockchainCurrencyId[item.blockchain]);
			}
			return acc;
		}, []);
	};

	onMounted(async () => {
		if (searchParams && !wallets.value.length) {
			await getSearchData(searchParams);
		}
	});
</script>

<template>
	<div class="wrapper">
		<h2 class="global-title-h3">{{ $t("List of the wallets") }}</h2>
		<div class="wallets">
			<block-section
				v-for="(item, index) in wallets"
				:key="item.address"
				class="wallet"
				mode="white"
				padding="md"
				@click="goToInfoWallet(item.address, index)"
			>
				<div class="wallet__row">
					<span class="wallet__label">{{ $t("Store name") }}</span>
					<span class="wallet__value">{{ item.store_name }}</span>
				</div>
				<div class="wallet__row">
					<span class="wallet__label">{{ $t("Address") }}</span>
					<span class="wallet__value">{{ item.address }}</span>
				</div>
				<div class="flex flex-y-center flex-x-end gap-4">
					<blockchain-icon
						v-for="currencyId in getCurrencyId(item.blockchains)"
						:key="currencyId"
						:type="currencyId as BlockchainType"
					/>
				</div>
			</block-section>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 24px;
		.wallets {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 12px;
			.wallet {
				display: flex;
				flex-direction: column;
				gap: 8px;
				cursor: pointer;
				@media (hover: hover) {
					&:hover {
						background-color: $blue-opacity;
					}
				}
				&__row {
					display: flex;
					justify-content: space-between;
					gap: 8px;
					color: $black;
					font-size: 14px;
					font-weight: 500;
					line-height: 20px;
				}
				&__label {
					color: #6b6d80;
					font-weight: 400;
				}
				&__value {
					text-align: right;
					word-break: break-word;
				}
			}
		}
	}
</style>
