<script setup lang="ts">
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general";
	import { UiLink, UiSwitch, UiTable, UiTabs, UiTabsItem } from "@dv.net/ui-kit";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import NotFoundMessage from "@dv-admin/components/ui/notFoundMessage/NotFoundMessage.vue";
	import { computed, ref } from "vue";
	import type { IProps } from "@dv-admin/views/search/address/components/addressInfo/types";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import { getLinkSearch } from "@shared/utils/helpers/linkExplorer";
	import type { BlockchainType } from "@shared/utils/types/blockchain";

	const { t } = useI18n();

	defineProps<IProps>();

	const isReadMoreTransferHistory = ref<boolean>(false);
	const hashPrefix = computed<number>(() => (isReadMoreTransferHistory.value ? 100 : 10));

	const currentTabHistory = ref<string>("1");
	const optionsTabHistory = ref<{ value: string; label: string }[]>([
		{ value: "1", label: "Transaction history" },
		{ value: "2", label: "Wallet activity log" },
		{ value: "3", label: "Transfer history" }
	]);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Date"), width: "160" },
		{ name: "amount_usd", label: t("Total"), width: "80" },
		{ name: "amount", label: t("Transaction details") },
		{ name: "more", label: "", width: "130" }
	]);

	const headersHistory = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Date"), width: "100" },
		{ name: "currency_id", label: t("Currency"), width: "100" },
		{ name: "from_address", label: t("From the wallet"), width: `${isReadMoreTransferHistory.value ? 150 : 100}` },
		{ name: "to_address", label: t("To the wallet"), width: `${isReadMoreTransferHistory.value ? 150 : 100}` }
	]);

	const replacePlaceholders = (text: string, variables: { address: string; ip: string }) => {
		return text.replace(/{(\w+)}/g, (match, key: string) => {
			return key in variables ? variables[key as keyof { address: string; ip: string }] : match;
		});
	};
</script>

<template>
	<div class="inner">
		<div class="flex flex-x-between w-full">
			<ui-tabs mode="light" v-model="currentTabHistory">
				<ui-tabs-item v-for="item in optionsTabHistory" :value="item.value" :key="item.value">
					{{ $t(item.label) }}
				</ui-tabs-item>
			</ui-tabs>

			<ui-switch v-if="currentTabHistory === '3'" :label="$t('Read more')" v-model="isReadMoreTransferHistory" />
		</div>

		<div v-if="currentTabHistory === '1'" class="transactions">
			<ui-table
				:loading="isLoadingTransactions"
				:headers="headers"
				:data="transactionsSearchAddress"
				table-layout="fixed"
			>
				<template #body-cell-created_at="{ row }">
					{{ formatDate(row.created_at) }}
				</template>

				<template #body-cell-amount_usd="{ row }">
					{{ formatDollars(row.amount_usd) }}
				</template>

				<template #body-cell-amount="{ row }">
					<div class="transactions__details">
						<div class="blockchain">
							<blockchain-icon :type="row.currency.id" width="16px" height="16px" />
							<span class="blockchain__text">{{ formatAmountBlockchain(row.amount, row?.currency?.id) }}</span>
							<span class="blockchain__currency">{{ getCurrentCoin(row?.currency?.id) }}</span>
						</div>
						<span class="blockchain__point">•</span>
						<display-hash
							type="transaction"
							:is-link="false"
							:hash="row.tx_hash"
							:currency-id="row.currency.id"
							:count-prefix="1000"
						/>
					</div>
				</template>

				<template #body-cell-more="{ row }">
					<ui-link :to="getLinkSearch('transaction', row.tx_hash)">
						{{ $t("Read more") }}
					</ui-link>
				</template>
			</ui-table>

			<ui-link :to="{ name: 'history' }">
				{{ $t("Show statistics for the month") }}
			</ui-link>
		</div>

		<div v-if="currentTabHistory === '2'">
			<div v-if="walletInfo?.logs?.length" class="logs">
				<div v-for="(item, index) in walletInfo.logs" :key="item.text_variables.address" class="logs__item">
					<span class="logs__item-label">{{ index + 1 }}</span>
					<span class="logs__item-text">{{ replacePlaceholders(item.text, item.text_variables) }}</span>
				</div>
			</div>

			<not-found-message v-else />
		</div>

		<div v-if="currentTabHistory === '3'" class="history">
			<ui-table :headers="headersHistory" :data="transferHistory" table-layout="fixed">
				<template #body-cell-created_at="{ row }">
					{{ formatDate(row.created_at) }}
				</template>

				<template #body-cell-currency_id="{ row }">
					<div class="history__price">
						<blockchain-icon :type="row.currency_id as BlockchainType" width="16px" height="16px" />

						<span>
							{{ formatAmountBlockchain(row.amount, row.currency_id) }} {{ getCurrentCoin(row.currency_id) }}
						</span>

						<span class="history__price-info"> ({{ formatDollars(row.amount_usd) }}) </span>
					</div>
				</template>

				<template #body-cell-from_address="{ row }">
					<display-hash
						type="address"
						size-icon="xs"
						size-hash="md"
						:count-prefix="hashPrefix"
						:currency-id="row.currency_id"
						:hash="row.from_address"
						:is-link="false"
					/>
				</template>

				<template #body-cell-to_address="{ row }">
					<div>
						<display-hash
							v-if="row.to_address"
							type="address"
							size-icon="xs"
							size-hash="md"
							:is-link="false"
							:count-prefix="hashPrefix"
							:currency-id="row.currency_id"
							:hash="row.to_address"
						/>
						<span v-else>—</span>
						<div v-if="isReadMoreTransferHistory && row.tx_hash" class="flex flex-column gap-4">
							tx_hash:
							<display-hash
								type="transaction"
								size-icon="xs"
								size-hash="md"
								:is-link="false"
								:count-prefix="hashPrefix"
								:currency-id="row.currency_id"
								:hash="row.tx_hash"
							/>
						</div>
					</div>
				</template>
			</ui-table>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.inner {
		display: flex;
		flex-direction: column;
		gap: 24px;
		&:deep(.ui-tabs) {
			width: max-content;
		}
		.transactions {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: 16px;
			padding-top: 12px;
			&__details {
				display: flex;
				align-items: center;
				gap: 8px;
				.blockchain {
					display: flex;
					align-items: center;
					gap: 4px;
					font-size: 14px;
					font-weight: 500;
					&__text {
						color: #1f9649;
					}
					&__currency {
						font-weight: 400;
						text-transform: uppercase;
					}
					&__point {
						color: $grey-opacity;
					}
				}
			}
		}
		.logs {
			display: flex;
			flex-direction: column;
			&__item {
				font-size: 14px;
				border-bottom: 1px solid #e9ecef;
				padding: 16px 0;
				display: flex;
				align-items: center;
				gap: 12px;
				&:first-child {
					padding: 0 0 16px 0;
				}
				&:last-child {
					border-bottom: none;
				}
				&-label {
					border-radius: 50%;
					background-color: $blue-light;
					color: $blue;
					width: 25px;
					height: 25px;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				&-text {
					color: #a4a5b1;
				}
			}
		}
		.history {
			&__price {
				display: flex;
				align-items: center;
				gap: 4px;
				font-size: 14px;
				white-space: nowrap;
				&-info {
					color: $grey-opacity;
				}
			}
			.hash {
				word-break: break-all;
			}
		}
	}
</style>
