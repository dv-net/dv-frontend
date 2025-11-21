<script setup lang="ts">
	import {
		capitalizeFirstLetter,
		formatAmountBlockchain,
		formatDollars,
		getCurrentBlockchain,
		getCurrentCoin
	} from "@shared/utils/helpers/general";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { UiButton } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import BlockWebhookDemo from "@dv-admin/components/ui/blockWebhookDemo/BlockWebhookDemo.vue";
	import RowElement from "@dv-admin/views/search/components/rowElement/RowElement.vue";
	import { storeToRefs } from "pinia";
	import { useRoute } from "vue-router";
	import { onMounted, ref } from "vue";
	import { getApiReceiptOneTransaction, postApiTransactionSendWebhooks } from "@dv-admin/services/api/history";
	import type { IReceiptOneTransactionResponse } from "@dv-admin/utils/types/api/apiGo";
	import { useSearchStore } from "@dv-admin/stores/search";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";

	const { transaction } = storeToRefs(useSearchStore());
	const { getSearchData } = useSearchStore();
	const route = useRoute();
	const { notify } = useNotifications();
	const { t } = useI18n();

	const hash = route.params.hash as string;
	const isLoadingSendWebhooks = ref<boolean>(false);
	const receipt = ref<IReceiptOneTransactionResponse | null>(null);

	const getReceiptData = async () => {
		try {
			if (!transaction.value || !transaction.value?.receipt_id) return;
			const receiptData = await getApiReceiptOneTransaction(transaction.value.receipt_id);
			if (receiptData) receipt.value = receiptData;
		} catch (error: any) {
			console.error(error);
		}
	};

	const postTransactionSendWebhooks = async () => {
		try {
			if (!transaction.value || !transaction.value?.id) return;
			isLoadingSendWebhooks.value = true;
			await postApiTransactionSendWebhooks(transaction.value.id);
			notify(t("Webhook resent"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingSendWebhooks.value = false;
		}
	};

	onMounted(async () => {
		if (hash && !transaction.value) {
			await getSearchData(hash);
			await getReceiptData();
		}
	});
</script>

<template>
	<div v-if="transaction" class="transaction">
		<block-section class="info" radius="md">
			<div class="info__top">
				<h3 class="global-title-h3">{{ $t("Transaction information") }}</h3>
				<span class="info__top-date">{{ formatDate(transaction.network_created_at) }}</span>
			</div>
			<div class="info__inner">
				<row-element class="info__item" :label="$t('Transaction hash')" :value="transaction.tx_hash" is-copy-value />
				<row-element
					class="info__item"
					:label="$t('Total')"
					:value="formatAmountBlockchain(transaction.amount, transaction.currency_id)"
				/>
				<row-element class="info__item" :label="$t('Transaction type')" :value="transaction.type" />
				<row-element class="info__item" :label="$t('Amount USD')" :value="formatDollars(transaction.amount_usd)" />
				<row-element class="info__item" :label="$t('Currency')" :value="getCurrentCoin(transaction.currency_id)" />
				<row-element class="info__item" :label="$t('Recipient')" :value="transaction.to_address" is-copy-value />
				<row-element
					class="info__item"
					:label="$t('Blockchain')"
					:value="capitalizeFirstLetter(transaction.blockchain)"
				/>
				<row-element
					class="info__item info__item--border-none"
					:label="$t('Sender')"
					:value="transaction.from_address"
					is-copy-value
				/>
				<row-element class="info__item info__item--border-none" :label="$t('Status')" :value="transaction.is_confirmed ? $t('Confirmed') : $t('Unconfirmed')" />
			</div>
		</block-section>
		<block-section v-if="receipt" class="info" radius="md">
			<div class="info__top">
				<h3 class="global-title-h3">{{ $t("Receipt.one") }}</h3>
				<span class="info__top-date">{{ formatDate(receipt.created_at) }}</span>
			</div>
			<div class="info__inner">
				<row-element class="info__item" :label="$t('ID')" :value="receipt.id" is-copy-value />
				<row-element class="info__item" :label="$t('Status')" :value="receipt.status" />
				<row-element class="info__item" :label="$t('Store ID')" :value="receipt.store_id" is-copy-value />
				<row-element class="info__item" :label="$t('Currency')" :value="getCurrentBlockchain(receipt.currency_id)" />
				<row-element
					class="info__item info__item--border-none"
					:label="$t('Wallet ID')"
					:value="receipt.wallet_id"
					is-copy-value
				/>
				<row-element
					class="info__item info__item--border-none"
					:label="$t('Total')"
					:value="formatAmountBlockchain(receipt.amount, receipt.currency_id)"
				/>
			</div>
		</block-section>
		<ui-button
			v-if="transaction.type === 'deposit'"
			type="secondary"
			class="transaction__button-hook"
			:loading="isLoadingSendWebhooks"
			@click="postTransactionSendWebhooks"
		>
			{{ $t("Repeat the hook about crediting to the store again") }}
		</ui-button>
		<block-section
			v-if="transaction?.webhook_history?.length"
			mode="grey-border"
			padding="lg"
			radius="md"
			class="webhooks"
		>
			<div v-for="item in transaction.webhook_history" :key="item.id" class="webhooks__item">
				<div class="webhooks__inner">
					<span class="webhooks__date">{{ formatDate(item.created_at) }}</span>
					<block-webhook-demo :webhook="item" type="request" />
					<block-webhook-demo :webhook="item" type="response" />
				</div>
			</div>
		</block-section>
	</div>
</template>

<style scoped lang="scss">
	.transaction {
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
		&__button-hook {
			margin-bottom: 8px;
		}
		.webhooks {
			display: flex;
			flex-direction: column;
			gap: 24px;
			&__date {
				font-size: 14px;
				color: $secondary;
			}
			&__item {
				display: flex;
				flex-direction: column;
			}
			&__inner {
				display: flex;
				flex-direction: column;
				gap: 12px;
			}
		}
	}
</style>
