<script setup lang="ts">
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { UiCopyText, UiIcon, UiLink, UiPagination } from "@dv.net/ui-kit";
	import { formatDollars, getCurrentBlockchain, getCurrentCoin, truncateHash } from "@shared/utils/helpers/general.ts";
	import { computed, onMounted, ref, watch } from "vue";
	import BlockAdvertising from "@pay/views/payerForm/components/payerFormSidebar/blockAdvertising/BlockAdvertising.vue";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";
	import type { IWalletTransactionResponse } from "@pay/utils/types/api/apiGo.ts";
	import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import { getLinkExplorer } from "@shared/utils/helpers/linkExplorer.ts";
	import { formatTimeAgo } from "@pay/utils/helpers/dateParse.ts";
	import { useI18n } from "vue-i18n";

	const { payerId, store, amount, errorStore, currentStep, isShowAdvertising, transactionsConfirmed } =
		storeToRefs(usePayerFormStore());

	const { t } = useI18n()
	const isMediaMax480 = useMediaQuery("(max-width: 480px)");

	const lastTransactions = ref<IWalletTransactionResponse[]>([]);
	const lastTransactionsPagination = ref<UItableMeta | null>(null);
	const lastTransactionsFilter = ref({ page: 1, perPage: 3 });

	const isShowSidebar = computed<boolean>(() => ![4, 5].includes(currentStep.value));
	const isShowDetails = computed<boolean>(() => !errorStore.value && isShowSidebar.value);
	const isShowLastPayments = computed<boolean>(() => {
		return !errorStore.value && isShowSidebar.value && Boolean(transactionsConfirmed.value.length)
	});

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

	const handleOpenExplorer = (item: IWalletTransactionResponse) => {
		const link = getLinkExplorer(item.currency_code, "transaction", item.hash);
		if (link) window.open(link, "_blank");
	};

	watch(transactionsConfirmed, () => {
		getLastTransactions();
	});

	onMounted(() => {
		getLastTransactions();
	});
</script>

<template>
	<div v-if="isShowSidebar" class="sidebar">
		<wrapper-block v-if="isShowDetails">
			<div class="details">
				<h2 class="global-title-h2">{{ $t("Payment details") }}</h2>
				<div class="details__content">
					<div class="row">
						<span class="row__label">{{ $t("Payment ID") }}</span>
						<div v-if="payerId" class="flex flex-y-center gap-8">
							<span>{{ truncateHash(payerId, 12) }}</span>
							<ui-copy-text :copied-text="payerId" color-icon="#A4A5B1" />
						</div>
						<span v-else>—</span>
					</div>
					<div v-if="store?.name && store?.site_url" class="row">
						<span class="row__label">{{ $t("Site") }}</span>
						<ui-link
							:href="store.site_url"
							target="_blank"
							:size="isMediaMax480 ? 'lg' : 'xl'"
							class="flex flex-y-center gap-8"
						>
							<span>{{ store.name }}</span>
							<ui-icon name="new-windows" type="400" />
						</ui-link>
					</div>
					<div v-else-if="store?.name && !store?.site_url" class="row">
						<span class="row__label">{{ $t("Site") }}</span>
						<span>{{ store.name }}</span>
					</div>
				</div>
				<div class="details__bottom">
					<span class="details__bottom-label">{{ $t("Sum") }}:</span>
					<span class="details__bottom-price">{{ formatDollars(amount, "$", "—", 2) }}</span>
				</div>
			</div>
		</wrapper-block>
		<wrapper-block v-if="isShowLastPayments">
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
								<ui-icon
									type="400"
									name="new-windows"
									size="sm"
									color="#A4A5B1"
								/>
							</div>
						</div>
						<div v-if="item.is_less_than_1_hour" class="footer">
							<div class="footer__label">
								<span>{{ $t('new') }}</span>
								<span>{{ formatTimeAgo(item.created_at, t) }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</wrapper-block>
		<block-advertising v-if="isShowAdvertising" class="sidebar__advertising" />
	</div>
</template>

<style scoped lang="scss">
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 492px;
		flex-shrink: 0;
		@include mediamax(1180) {
			width: 400px;
		}
		@include mediamax(1024) {
			width: 100%;
		}
		.details {
			display: flex;
			flex-direction: column;
			&__content {
				display: flex;
				flex-direction: column;
				gap: 12px;
				padding: 20px 0 44px;
				border-bottom: 1px solid $main-border-color;
				@include mediamax(480) {
					gap: 8px;
					padding: 12px 0 20px;
				}
				.row {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 12px;
					color: $main-text-grey-color;
					font-size: 16px;
					font-weight: 400;
					line-height: 130%;
					@include mediamax(480) {
						display: flex;
						align-items: unset;
						justify-content: unset;
						flex-direction: column;
						gap: 4px;
						font-size: 14px;
					}
					&__label {
						@include mediamax(480) {
							font-size: 14px;
							opacity: 0.6;
						}
					}
					&__site {
						color: $main-text-link-and-price-color;
					}
				}
			}
			&__bottom {
				padding-top: 20px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				@include mediamax(480) {
					padding-top: 16px;
				}
				&-label {
					font-size: 20px;
					font-weight: 500;
					@include mediamax(480) {
						font-size: 16px;
					}
				}
				&-price {
					color: $main-text-link-and-price-color;
					font-size: 32px;
					@include mediamax(480) {
						font-size: 24px;
					}
					font-weight: 700;
				}
			}
		}
		.payments {
			display: flex;
			flex-direction: column;
			gap: 24px;
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
		&__advertising {
			@include mediamax(1024) {
				display: none;
			}
		}
	}
</style>
