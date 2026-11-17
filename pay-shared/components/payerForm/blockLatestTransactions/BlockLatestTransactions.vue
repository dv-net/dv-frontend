<script setup lang="ts">
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import { changeChainBsc, getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import { formatTimeAgo } from "@pay-shared/utils/helpers/dateParse";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import WrapperBlock from "@pay-shared/components/payerForm/wrapperBlock/WrapperBlock.vue";
	import { UiButton, UiIcon, UiPagination } from "@dv.net/ui-kit";
	import { getLinkExplorer } from "@shared/utils/helpers/linkExplorer.ts";
	import { useI18n } from "vue-i18n";
	import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { computed, ref, useTemplateRef, watch } from "vue";
	import type { ILatestTransaction } from "./types";
	import { formatFiatAmount } from "@pay-shared/utils/helpers/fiat";
	import { openExternal } from "@shared/utils/helpers/url";

	const { transactions, fiatCurrency = "USD", title = "Latest payments" } = defineProps<{
		transactions: ILatestTransaction[];
		fiatCurrency?: string;
		title?: string;
	}>();

	const emit = defineEmits<{
		requestRefund: [blockedTransactionId: string];
	}>();

	const { t, locale } = useI18n();

	const PER_PAGE = 3;
	const PAGE_TURN_DURATION = { enter: 620, leave: 300 };

	const page = ref<number>(1);
	const pageTurnDirection = ref<"next" | "prev">("next");
	const viewportRef = useTemplateRef<HTMLElement>("viewport");
	let heightBeforeTurn = 0;

	const lastTransactions = computed<ILatestTransaction[]>(() =>
		transactions.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE)
	);

	const lastTransactionsPagination = computed<UItableMeta | null>(() =>
		transactions.length ? ({ page: page.value, perPage: PER_PAGE, total: transactions.length } as UItableMeta) : null
	);

	const handleOpenExplorer = (item: ILatestTransaction) => {
		const link = getLinkExplorer(item.currency_code, "transaction", item.hash);
		openExternal(link);
	};

	/** Keeps the block height while pages swap (out-in), then glides to the new page height */
	const lockViewportHeight = () => {
		const viewport = viewportRef.value;
		if (!viewport) return;
		heightBeforeTurn = viewport.offsetHeight;
		viewport.style.height = `${heightBeforeTurn}px`;
	};

	const animateViewportHeight = (element: Element) => {
		const viewport = viewportRef.value;
		if (!viewport) return;
		viewport.style.removeProperty("height");
		const targetHeight = (element as HTMLElement).offsetHeight;
		if (!heightBeforeTurn || Math.abs(targetHeight - heightBeforeTurn) < 1) return;
		viewport.animate([{ height: `${heightBeforeTurn}px` }, { height: `${targetHeight}px` }], {
			duration: 420,
			easing: "cubic-bezier(0.4, 0, 0.2, 1)"
		});
	};

	watch(page, (newPage, oldPage) => {
		pageTurnDirection.value = newPage > oldPage ? "next" : "prev";
	});

	watch(
		() => transactions.length,
		(total) => {
			const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
			if (page.value > lastPage) page.value = lastPage;
		}
	);
</script>

<template>
	<wrapper-block>
		<div class="payments">
			<div class="payments__top">
				<h2 class="payments__title">{{ $t(title) }}</h2>
				<ui-pagination
					v-if="lastTransactionsPagination"
					:per-page="lastTransactionsPagination.perPage"
					:total="lastTransactionsPagination.total"
					:isShowPerPageSelect="false"
					v-model:page="page"
				/>
			</div>
			<div ref="viewport" class="payments__viewport">
				<transition
					:name="`page-turn-${pageTurnDirection}`"
					mode="out-in"
					:duration="PAGE_TURN_DURATION"
					@before-leave="lockViewportHeight"
					@enter="animateViewportHeight"
				>
					<div :key="page" class="payments__body">
						<div
							v-for="(item, index) in lastTransactions"
							:key="item.hash"
							class="card"
							:class="{ selected: item.is_less_than_1_hour }"
							:style="{ '--card-index': index }"
						>
							<div class="header">
								<div class="content">
									<blockchain-icon :type="item.currency_code as BlockchainType" width="32px" height="32px" />
									<div class="content__inner">
										<span class="content__title">
											{{ getCurrentCoin(item.currency_code) }} {{ item.currency_label }}
										</span>
										<span class="content__subtitle">
											{{ changeChainBsc(getCurrentBlockchain(item.currency_code)) }}
											{{ item.token_label ? `(${item.token_label})` : null }}
										</span>
									</div>
								</div>
								<div class="header__amount">
									{{ formatFiatAmount(item.amount_usd, item.fiat_currency || fiatCurrency) }}
								</div>
							</div>
							<div class="hash" @click="handleOpenExplorer(item)">
								<span class="hash__text">{{ item.hash }}</span>
								<div class="hash__icon">
									<ui-icon type="400" name="new-windows" size="sm" />
								</div>
							</div>
							<div v-if="item.is_less_than_1_hour || item.blocked_transaction_id" class="footer">
								<div v-if="item.is_less_than_1_hour" class="footer__label">
									<span>{{ $t("new") }}</span>
									<span>{{ formatTimeAgo(item.created_at, t, locale) }}</span>
								</div>
								<ui-button
									v-if="item.blocked_transaction_id"
									class="footer__refund"
									size="sm"
									type="outline"
									mode="neutral"
									left-icon-name="sync-alt"
									left-icon-size="sm"
									@click.stop="emit('requestRefund', item.blocked_transaction_id)"
								>
									{{ $t("Process refund") }}
								</ui-button>
							</div>
						</div>
					</div>
				</transition>
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
		&__title {
			color: $main-title-color;
			font-family: $font-family-main;
			font-size: 20px;
			font-weight: 600;
			line-height: 120%;
			@include mediamax(768) {
				font-size: 18px;
			}
			@include mediamax(480) {
				font-size: 16px;
			}
		}
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
		&__viewport {
			perspective: 1600px;
			overflow-x: clip;
			overflow-clip-margin: 24px;
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
						transition: color 0.25s ease;
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
						display: flex;
						width: 16px;
						height: 16px;
						flex-shrink: 0;
						color: $main-subtitle-color;
						transition:
							color 0.25s ease,
							transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
					}
					@media (hover: hover) {
						&:hover {
							.hash__text,
							.hash__icon {
								color: $main-text-link-and-price-color;
							}
							.hash__icon {
								transform: translate(2px, -2px);
							}
						}
					}
				}
				.footer {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 8px;
					&__label {
						border-radius: 27px;
						background-color: $main-text-link-and-price-color;
						display: flex;
						padding: 4px 8px;
						align-items: center;
						gap: 4px;
						color: $text-header-form-background;
						font-size: 12px;
						font-weight: 400;
					}
					&__refund {
						margin-left: auto;
						flex-shrink: 0;
					}
				}
			}
		}
	}

	.page-turn-next-leave-active,
	.page-turn-prev-leave-active {
		transition:
			transform 0.3s cubic-bezier(0.55, 0, 1, 0.45),
			opacity 0.26s ease-in;
		backface-visibility: hidden;
	}
	.page-turn-next-leave-active {
		transform-origin: left center;
	}
	.page-turn-prev-leave-active {
		transform-origin: right center;
	}
	.page-turn-next-leave-to {
		transform: rotateY(-28deg) translateX(-10%);
		opacity: 0;
	}
	.page-turn-prev-leave-to {
		transform: rotateY(28deg) translateX(10%);
		opacity: 0;
	}

	.page-turn-next-enter-active,
	.page-turn-prev-enter-active {
		perspective: 1600px;
		.card {
			transition:
				transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
				opacity 0.4s ease-out;
			transition-delay: calc(var(--card-index, 0) * 60ms);
			backface-visibility: hidden;
		}
	}
	.page-turn-next-enter-active .card {
		transform-origin: right center;
	}
	.page-turn-prev-enter-active .card {
		transform-origin: left center;
	}
	.page-turn-next-enter-from .card {
		transform: rotateY(22deg) translateX(12%);
		opacity: 0;
	}
	.page-turn-prev-enter-from .card {
		transform: rotateY(-22deg) translateX(-12%);
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.page-turn-next-leave-active,
		.page-turn-prev-leave-active,
		.page-turn-next-enter-active .card,
		.page-turn-prev-enter-active .card {
			transition: opacity 0.2s ease;
			transform: none;
		}
	}
</style>
