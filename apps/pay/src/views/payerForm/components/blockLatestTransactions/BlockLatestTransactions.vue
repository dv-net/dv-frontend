<script setup lang="ts">
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import { formatDollars, getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import { formatTimeAgo } from "@pay/utils/helpers/dateParse.ts";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import { UiIcon, UiPagination } from "@dv.net/ui-kit";
	import type { IWalletTransactionResponse } from "@pay/utils/types/api/apiGo.ts";
	import { getLinkExplorer } from "@shared/utils/helpers/linkExplorer.ts";
	import { useI18n } from "vue-i18n";
	import { storeToRefs } from "pinia";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { onMounted, ref, watch } from "vue";

	const { t } = useI18n();

	const { transactionsConfirmed } = storeToRefs(usePayerFormStore());

	const lastTransactions = ref<IWalletTransactionResponse[]>([]);
	const lastTransactionsPagination = ref<UItableMeta | null>(null);
	const lastTransactionsFilter = ref({ page: 1, perPage: 3 });

	const handleOpenExplorer = (item: IWalletTransactionResponse) => {
		const link = getLinkExplorer(item.currency_code, "transaction", item.hash);
		if (link) window.open(link, "_blank");
	};

	const getLastTransactions = () => {
		const allTransactions = transactionsConfirmed.value || [];
		const total = allTransactions.length;
		const { page, perPage } = lastTransactionsFilter.value;
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;
		lastTransactions.value = allTransactions.slice(startIndex, endIndex);
		if (total > 0) {
			lastTransactionsPagination.value = { page, perPage, total } as UItableMeta;
		} else {
			lastTransactionsPagination.value = null;
		}
	};

	watch(transactionsConfirmed, () => {
		getLastTransactions();
	});

	onMounted(() => {
		getLastTransactions();
	});
</script>

<template>
	<wrapper-block>
		<div class="payments">
			<div class="payments__top">
				<h2 class="global-title-h2">{{ $t("Latest payments") }}</h2>
				<ui-pagination
					v-if="lastTransactionsPagination"
					:per-page="lastTransactionsPagination.perPage"
					:total="lastTransactionsPagination.total"
					:isShowPerPageSelect="false"
					v-model:page="lastTransactionsFilter.page"
					@update:page="getLastTransactions"
				/>
			</div>
			<div class="payments__body">
				<div
					v-for="item in lastTransactions"
					:key="item.hash"
					class="card"
					:class="{ selected: item.is_less_than_1_hour }"
				>
					<div class="header">
						<div class="content">
							<blockchain-icon :type="item.currency_code as BlockchainType" width="32px" height="32px" />
							<div class="content__inner">
								<span class="content__title">{{ getCurrentCoin(item.currency_code) }}</span>
								<span class="content__subtitle">{{ getCurrentBlockchain(item.currency_code) }}</span>
							</div>
						</div>
						<div class="header__amount">{{ formatDollars(item.amount_usd, "$", "—", 2) }}</div>
					</div>
					<div class="hash" @click="handleOpenExplorer(item)">
						<span class="hash__text">{{ item.hash }}</span>
						<div class="hash__icon">
							<ui-icon type="400" name="new-windows" size="sm" color="#A4A5B1" />
						</div>
					</div>
					<div v-if="item.is_less_than_1_hour" class="footer">
						<div class="footer__label">
							<span>{{ $t("new") }}</span>
							<span>{{ formatTimeAgo(item.created_at, t) }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</wrapper-block>
</template>

<style scoped lang="scss">
	.payments {
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 100%;
		&__top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			min-height: 32px;
			&:deep(.ui-pagination) {
				flex-shrink: 0;
				.ui-pagination__btn-first {
					display: none;
				}
				.ui-pagination__btn-last {
					display: none;
				}
			}
		}
		&__body {
			display: flex;
			flex-direction: column;
			gap: 24px;
			.card {
				display: flex;
				flex-direction: column;
				gap: 12px;
				padding: 12px 16px;
				border-radius: 12px;
				border: 1px solid $main-border-color;
				background-color: $form-background;
				@include mediamax(480) {
					padding: 12px;
				}
				&.selected {
					border-color: $main-text-link-and-price-color;
				}
				.header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 8px;
					.content {
						display: flex;
						align-items: center;
						gap: 8px;
						&__inner {
							display: flex;
							flex-direction: column;
						}
						&__title {
							color: $main-color;
							font-size: 14px;
							font-weight: 500;
							line-height: 16px;
						}
						&__subtitle {
							color: $main-text-grey-color;
							font-size: 12px;
							font-weight: 400;
							line-height: 16px;
						}
					}
					&__amount {
						color: $main-color;
						font-size: 20px;
						font-weight: 600;
						@include mediamax(576) {
							font-size: 18px;
						}
						@include mediamax(480) {
							font-size: 16px;
						}
					}
				}
				.hash {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 12px;
					@extend .pointer;
					&__text {
						flex-grow: 1;
						text-wrap: nowrap;
						text-overflow: ellipsis;
						overflow: hidden;
						color: $main-subtitle-color;
						font-size: 14px;
						font-weight: 400;
						@include mediamax(1024) {
							text-wrap: unset;
							text-overflow: unset;
							overflow: unset;
							word-break: break-word;
						}
						@include mediamax(480) {
							font-size: 12px;
						}
					}
					&__icon {
						width: 16px;
						height: 16px;
						flex-shrink: 0;
						& > svg {
							transition: transform 0.3s ease-in-out;
							@media (hover: hover) {
								&:hover {
									cursor: pointer;
									transform: scale(1.1);
								}
							}
						}
					}
				}
				.footer {
					display: flex;
					align-items: center;
					justify-content: space-between;
					&__label {
						border-radius: 27px;
						background-color: $main-text-link-and-price-color;
						display: flex;
						padding: 4px 8px;
						align-items: center;
						gap: 4px;
						color: #fff;
						font-size: 12px;
						font-weight: 400;
					}
				}
			}
		}
	}
</style>