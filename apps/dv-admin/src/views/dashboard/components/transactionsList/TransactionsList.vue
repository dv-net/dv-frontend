<script setup lang="ts">
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general";
	import { UiLink, UiTable } from "@dv.net/ui-kit";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { storeToRefs } from "pinia";
	import { useTransactionStore } from "@dv-admin/stores/history";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import { computed } from "vue";
	import { getLinkSearch } from "@shared/utils/helpers/linkExplorer";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";

	const { t } = useI18n();
	const { transactions, isLoading } = storeToRefs(useTransactionStore());

	const isVisibleTable = computed<boolean>(() => {
		if (isLoading.value) return true;
		return Boolean(transactions.value.length);
	});

	const headers = computed<UiTableHeader[]>(() => [
		{
			name: "created_at",
			label: t("Date"),
			width: "170"
		},
		{ name: "amount_usd", label: t("Total"), width: "100" },
		{
			name: "amount",
			label: t("Transaction details")
		},
		{ name: "user_email", label: t("E-mail"), width: "250" },
		{ name: "more", label: "", width: "110" }
	]);
</script>

<template>
	<block-section v-if="isVisibleTable" class="transactions" :title="$t('Top up transactions')" :isLoading="isLoading">
		<div class="transactions__table">
			<ui-table :loading="isLoading" :headers="headers" :data="transactions" table-layout="fixed">
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
							:count-prefix="10"
							size-icon="sm"
						/>
					</div>
				</template>

				<template #body-cell-user_email="{ row }">
					<template v-if="row.user_email">{{ row.user_email }}</template>
					<div v-else-if="row.untrusted_email" style="font-style: italic">{{ row.untrusted_email }}</div>
					<template v-else>—</template>
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
	</block-section>
</template>

<style scoped lang="scss">
	.transactions {
		display: flex;
		flex-direction: column;
		gap: 20px;

		&__table {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: 16px;
			padding-top: 12px;
		}

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
</style>
