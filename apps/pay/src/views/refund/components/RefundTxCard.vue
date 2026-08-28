<script setup lang="ts">
	import { computed, ref } from "vue";
	import { UiButton, UiCopyText, UiIcon } from "@dv.net/ui-kit";
	import type { IRefundCabinetItem } from "@pay/utils/types/refund";
	import { REFUND_STATUS_LABELS } from "@pay/utils/constants/refund";
	import {
		changeChainBsc,
		getCurrentBlockchain,
		getCurrentCoin,
		truncateHash
	} from "@shared/utils/helpers/general";
	import { getLinkExplorer } from "@shared/utils/helpers/linkExplorer";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import RefundClaimForm from "@pay/views/refund/components/RefundClaimForm.vue";
	import IconStatus from "@pay/components/icons/refund/IconStatus.vue";
	import IconRisk from "@pay/components/icons/refund/IconRisk.vue";
	import IconScore from "@pay/components/icons/refund/IconScore.vue";
	import IconWallet from "@pay/components/icons/refund/IconWallet.vue";
	import IconCalendar from "@pay/components/icons/refund/IconCalendar.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery";
	import dayjs from "dayjs";

	const {
		item,
		showClaimAction = false,
		claimLoading = false
	} = defineProps<{
		item: IRefundCabinetItem;
		showClaimAction?: boolean;
		claimLoading?: boolean;
	}>();

	const emit = defineEmits<{
		claim: [destinationAddress: string];
	}>();

	const isClaimOpen = ref(false);
	const isCompact = useMediaQuery("(max-width: 1024px)");

	const formatCreatedDate = (value: string) => {
		const date = dayjs(value);
		return date.isValid() ? date.format("DD.MM.YYYY, HH:mm") : value;
	};

	const coinLabel = computed(() => (item.currency_id ? getCurrentCoin(item.currency_id) : item.currency_id));
	const networkLabel = computed(() => {
		const chain = item.currency_id
			? getCurrentBlockchain(item.currency_id) || item.blockchain
			: item.blockchain;
		return changeChainBsc(chain);
	});

	const statusLabel = computed(() => {
		if (item.refund_status && item.refund_status in REFUND_STATUS_LABELS) {
			return REFUND_STATUS_LABELS[item.refund_status];
		}
		if (showClaimAction) return "Available for refund";
		return null;
	});

	const statusTone = computed(() => {
		switch (item.refund_status) {
			case "completed":
				return "success";
			case "failed":
			case "rejected":
				return "danger";
			case "processing":
			case "pending_review":
				return "warning";
			default:
				return showClaimAction ? "success" : "neutral";
		}
	});

	const displayTxHash = computed(() => {
		if (!item.tx_hash) return "";
		return isCompact.value ? truncateHash(item.tx_hash, 10, 6) : item.tx_hash;
	});

	const displayDestination = computed(() => {
		if (!item.destination_address) return "";
		return isCompact.value ? truncateHash(item.destination_address, 10, 6) : item.destination_address;
	});

	const openExplorer = (type: "address" | "transaction", hash: string) => {
		if (!item.currency_id || !hash) return;
		const link = getLinkExplorer(item.currency_id, type, hash);
		if (link) window.open(link, "_blank");
	};
</script>

<template>
	<article class="tx-card">
		<header class="tx-card__header">
			<div class="tx-card__asset">
				<blockchain-icon :type="item.currency_id as BlockchainType" width="32px" height="32px" />
				<div class="tx-card__asset-text">
					<span class="tx-card__coin">{{ coinLabel }}</span>
					<span class="tx-card__dot">·</span>
					<span class="tx-card__network">{{ networkLabel }}</span>
				</div>
			</div>
			<time v-if="item.created_at" class="tx-card__date" :datetime="item.created_at">
				{{ formatCreatedDate(item.created_at) }}
				<icon-calendar class="tx-card__date-icon" />
			</time>
		</header>

		<button
			v-if="item.tx_hash"
			type="button"
			class="tx-card__hash"
			@click="openExplorer('transaction', item.tx_hash)"
		>
			<span class="tx-card__hash-text">{{ displayTxHash }}</span>
			<div class="tx-card__hash-actions">
				<span @click.stop>
					<ui-copy-text :copied-text="item.tx_hash" color-icon="#A4A5B1" size-icon="sm" />
				</span>
				<ui-icon type="400" name="new-windows" size="sm" color="#A4A5B1" />
			</div>
		</button>

		<div class="tx-card__metrics">
			<div v-if="statusLabel" class="metric">
				<div class="metric__icon" aria-hidden="true">
					<icon-status />
				</div>
				<div class="metric__body">
					<span class="metric__label">{{ $t("Status") }}</span>
					<span class="metric__value" :data-tone="statusTone">{{ $t(statusLabel) }}</span>
				</div>
			</div>
			<div v-if="item.risk_level" class="metric">
				<div class="metric__icon" aria-hidden="true">
					<icon-risk />
				</div>
				<div class="metric__body">
					<span class="metric__label">{{ $t("Risk level") }}</span>
					<span class="metric__value" :data-tone="item.risk_level === 'critical' ? 'danger' : 'neutral'">
						{{ item.risk_level }}
					</span>
				</div>
			</div>
			<div v-if="item.score" class="metric">
				<div class="metric__icon" aria-hidden="true">
					<icon-score />
				</div>
				<div class="metric__body">
					<span class="metric__label">{{ $t("Score") }}</span>
					<span class="metric__value">{{ item.score }}</span>
				</div>
			</div>
			<div
				v-if="item.destination_address"
				class="metric metric--wide"
				role="button"
				tabindex="0"
				@click="openExplorer('address', item.destination_address)"
				@keydown.enter="openExplorer('address', item.destination_address)"
			>
				<div class="metric__icon" aria-hidden="true">
					<icon-wallet />
				</div>
				<div class="metric__body">
					<span class="metric__label">{{ $t("Destination address") }}</span>
					<span class="metric__value metric__value--hash">
						<span class="metric__hash-text">{{ displayDestination }}</span>
						<span @click.stop>
							<ui-copy-text :copied-text="item.destination_address" color-icon="#A4A5B1" size-icon="sm" />
						</span>
					</span>
				</div>
			</div>
		</div>

		<div v-if="showClaimAction && !isClaimOpen" class="tx-card__actions">
			<ui-button mode="neutral" size="lg" left-icon-name="account-balance-wallet" @click="isClaimOpen = true">
				{{ $t("Request refund") }}
			</ui-button>
		</div>

		<refund-claim-form
			v-if="showClaimAction && isClaimOpen"
			class="tx-card__claim"
			:item="item"
			:loading="claimLoading"
			@claim="emit('claim', $event)"
			@cancel="isClaimOpen = false"
		/>
	</article>
</template>

<style scoped lang="scss">
	.tx-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px;
		border-radius: 20px;
		background: $form-background;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
		min-width: 0;
		@include mediamax(480) {
			padding: 16px;
			gap: 12px;
		}

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			min-width: 0;
		}

		&__asset {
			display: flex;
			align-items: center;
			gap: 8px;
			min-width: 0;
		}

		&__asset-text {
			display: flex;
			align-items: center;
			gap: 6px;
			min-width: 0;
		}

		&__coin {
			color: $main-color;
			font-size: 14px;
			font-weight: 500;
			line-height: 16px;
			white-space: nowrap;
		}

		&__dot,
		&__network {
			color: $main-text-grey-color;
			font-size: 14px;
			font-weight: 400;
			line-height: 16px;
			white-space: nowrap;
		}

		&__date {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			flex-shrink: 0;
			color: $main-color;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			white-space: nowrap;
			@include mediamax(480) {
				font-size: 12px;
			}
		}

		&__date-icon {
			display: block;
			flex-shrink: 0;
			color: $main-color;
		}

		&__hash {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			gap: 6px;
			max-width: 100%;
			min-width: 0;
			padding: 0;
			border: 0;
			background: transparent;
			cursor: pointer;
			text-align: left;
		}

		&__hash-text {
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: $main-subtitle-color;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
			@include mediamax(480) {
				font-size: 12px;
			}
		}

		&__hash-actions {
			display: flex;
			align-items: center;
			gap: 4px;
			flex-shrink: 0;
		}

		&__metrics {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 8px;
			@include mediamax(1024) {
				grid-template-columns: 1fr;
			}
		}

		&__actions {
			display: flex;
			justify-content: flex-end;
			gap: 8px;
			@include mediamax(768) {
				:deep(.ui-button) {
					width: 100%;
				}
			}
		}

		&__claim {
			padding: 16px;
			border-radius: 16px;
			border: 1px solid #e1e8f1;
			background: #f7f9fb;
			@include mediamax(480) {
				padding: 12px;
			}
		}
	}

	.metric {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		padding: 8px;
		border-radius: 16px;
		background: $form-background;
		box-shadow: inset 0 0 0 1px #e1e8f1;

		&--wide {
			@extend .pointer;
			grid-column: 1 / -1;
		}

		&__icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			flex-shrink: 0;
			border-radius: 12px;
			background: #f7f9fb;
			color: $main-color;
			@include mediamax(480) {
				width: 36px;
				height: 36px;
			}
		}

		&__body {
			display: flex;
			flex-direction: column;
			gap: 2px;
			min-width: 0;
			flex: 1;
		}

		&__label {
			color: $main-text-grey-color;
			font-size: 12px;
			font-weight: 500;
			line-height: 16px;
		}

		&__value {
			color: $main-color;
			font-size: 14px;
			font-weight: 500;
			line-height: 16px;
			overflow-wrap: anywhere;

			&--hash {
				display: flex;
				align-items: center;
				gap: 6px;
				min-width: 0;
				color: $main-text-link-and-price-color;
			}

			&[data-tone="success"] {
				color: #1b8f3a;
			}

			&[data-tone="warning"] {
				color: rgba(255, 158, 0, 1);
			}

			&[data-tone="danger"] {
				color: #c4452d;
			}

			&[data-tone="neutral"] {
				color: $main-text-grey-color;
			}
		}

		&__hash-text {
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
</style>
