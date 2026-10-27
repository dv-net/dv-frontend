<script setup lang="ts">
	import { computed } from "vue";
	import { UiButton, UiConfirm, UiCopyText, UiIcon } from "@dv.net/ui-kit";
	import type { IRefundRequestDetailed } from "@dv-admin/utils/types/api/apiGo";
	import { AML_RISK_LEVEL_LABELS, type TAmlRiskLevel } from "@dv-admin/utils/constants/aml";
	import { REFUND_STATUS_LABELS } from "@dv-admin/utils/constants/refund";
	import { ALL_MODE_TAG, ALL_STATUSES } from "@dv-admin/utils/constants/general";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import {
		changeChainBsc,
		formatAmountBlockchain,
		formatDollars,
		getCurrentBlockchain,
		getCurrentCoin,
		truncateHash
	} from "@shared/utils/helpers/general";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import IconDeposit from "@dv-admin/components/icons/refund/IconDeposit.vue";
	import IconTransfer from "@dv-admin/components/icons/refund/IconTransfer.vue";
	import IconStatus from "@dv-admin/components/icons/refund/IconStatus.vue";
	import IconWallet from "@dv-admin/components/icons/refund/IconWallet.vue";
	import IconCalendar from "@dv-admin/components/icons/refund/IconCalendar.vue";
	import IconDocument from "@dv-admin/components/icons/projects/IconDocument.vue";

	const { item, projectName, rejectRequest, approveRequest, cancelRequest, executeNowRequest } = defineProps<{
		item: IRefundRequestDetailed;
		projectName?: string;
		rejectRequest: () => Promise<unknown>;
		approveRequest: () => Promise<unknown>;
		cancelRequest: () => Promise<unknown>;
		executeNowRequest: () => Promise<unknown>;
	}>();

	const isCompact = useMediaQuery("(max-width: 1024px)");

	const statusLabel = computed(() => REFUND_STATUS_LABELS[item.status] ?? item.status);

	const statusTone = computed(() => {
		switch (item.status) {
			case "completed":
				return "success";
			case "failed":
			case "rejected":
				return "danger";
			case "processing":
			case "pending_review":
			case "canceled":
				return "warning";
			case "scheduled":
				return "info";
			default:
				return "neutral";
		}
	});

	const canReview = computed(() => item.status === "pending_review");
	const canManageScheduled = computed(() => item.status === "scheduled");

	const displayWalletId = computed(() => {
		if (!item.wallet_id) return "";
		return isCompact.value ? truncateHash(item.wallet_id, 10, 6) : item.wallet_id;
	});

	const displayDestination = computed(() => {
		if (!item.destination_address) return "";
		return isCompact.value ? truncateHash(item.destination_address, 10, 6) : item.destination_address;
	});

	const displayProjectName = computed(() => projectName || item.store_id);

	const depositCurrencyId = computed(() => item.blocked_transaction?.currency_id || "");

	const depositFiatLabel = computed(() =>
		item.blocked_transaction?.amount_usd
			? formatDollars(item.blocked_transaction.amount_usd, { countPartMoreOneDollar: 2 })
			: ""
	);

	const depositCryptoAmount = computed(() => {
		const currencyId = depositCurrencyId.value || undefined;
		const amount = item.blocked_transaction?.amount;
		if (amount && currencyId) {
			return `${formatAmountBlockchain(amount, { currencyId })} ${getCurrentCoin(currencyId)}`;
		}
		return amount || "";
	});

	const depositNetworkLabel = computed(() =>
		depositCurrencyId.value ? changeChainBsc(getCurrentBlockchain(depositCurrencyId.value)) : ""
	);

	const depositCryptoLabel = computed(() =>
		[depositCryptoAmount.value, depositNetworkLabel.value].filter(Boolean).join(" · ")
	);

	const depositAmountLabel = computed(() =>
		[depositFiatLabel.value, depositCryptoLabel.value].filter(Boolean).join(" · ")
	);

	const payoutFiatLabel = computed(() =>
		item.transfer?.amount_usd ? formatDollars(item.transfer.amount_usd, { countPartMoreOneDollar: 2 }) : ""
	);

	const payoutCryptoAmount = computed(() => {
		const currencyId = depositCurrencyId.value || undefined;
		const amount = item.transfer?.amount;
		if (amount && currencyId) {
			return `${formatAmountBlockchain(amount, { currencyId })} ${getCurrentCoin(currencyId)}`;
		}
		return amount || "";
	});

	const payoutAmountLabel = computed(() =>
		[payoutFiatLabel.value, payoutCryptoAmount.value, depositNetworkLabel.value].filter(Boolean).join(" · ")
	);

	const depositRiskLabel = computed(() => {
		const level = item.blocked_transaction?.risk_level;
		if (!level) return "";
		return level in AML_RISK_LEVEL_LABELS ? AML_RISK_LEVEL_LABELS[level as TAmlRiskLevel] : level;
	});

	const riskTone = (level: string) => {
		if (level === "high" || level === "critical") return "danger";
		if (level === "medium") return "warning";
		if (level === "low" || level === "none") return "success";
		return "neutral";
	};

	const flowLabel = (value: string | null | undefined) => {
		if (!value) return "";
		return value in ALL_STATUSES ? ALL_STATUSES[value] : value;
	};

	const flowTone = (value: string | null | undefined) => {
		if (!value) return "neutral";
		const mode = ALL_MODE_TAG[value];
		if (mode === "positive") return "success";
		if (mode === "negative") return "danger";
		if (mode === "warning") return "warning";
		if (mode === "accent") return "info";
		return "neutral";
	};

	const showDeposit = computed(() => {
		const tx = item.blocked_transaction;
		if (!tx) return false;
		return Boolean(
			tx.tx_hash ||
				tx.amount ||
				tx.amount_usd ||
				tx.currency_id ||
				tx.from_address ||
				tx.to_address ||
				tx.risk_level ||
				tx.score
		);
	});

	const showPayout = computed(() => {
		const transfer = item.transfer;
		if (!transfer) return false;
		return Boolean(
			transfer.tx_hash || transfer.status || transfer.amount || transfer.amount_usd
		);
	});
</script>

<template>
	<article class="tx-card">
		<header class="tx-card__header">
			<div class="tx-card__identity">
				<div class="tx-card__title-row">
					<span class="tx-card__email">{{ item.email }}</span>
					<template v-if="item.wallet_id">
						<span class="tx-card__dot">·</span>
						<span class="tx-card__wallet-text">{{ displayWalletId }}</span>
						<ui-copy-text :copied-text="item.wallet_id" color-icon="#A4A5B1" size-icon="sm" />
					</template>
				</div>
			</div>
			<time class="tx-card__date" :datetime="item.created_at">
				{{ formatDate(item.created_at, { dateOnly: true }) }}
				<icon-calendar class="tx-card__date-icon" />
			</time>
		</header>

		<div class="tx-card__metrics">
			<div v-if="item.store_id" class="metric">
				<div class="metric__icon" aria-hidden="true">
					<icon-document />
				</div>
				<div class="metric__body">
					<span class="metric__label">{{ $t("Project") }}</span>
					<router-link
						class="metric__value metric__value--link"
						:to="{ name: 'projects-edit', params: { id: item.store_id } }"
					>
						{{ displayProjectName }}
					</router-link>
				</div>
			</div>
			<div class="metric">
				<div class="metric__icon" aria-hidden="true">
					<icon-status />
				</div>
				<div class="metric__body">
					<span class="metric__label">{{ $t("Status") }}</span>
					<span class="metric__value" :data-tone="statusTone">{{ $t(statusLabel) }}</span>
				</div>
			</div>
			<div v-if="item.destination_address" class="metric">
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

		<section v-if="showDeposit" class="details details--headed">
			<h3 class="details__title">
				<span class="details__title-mark">
					<icon-deposit class="details__title-icon" />
				</span>
				{{ $t("Deposit") }}
			</h3>
			<dl
				v-if="depositAmountLabel || (item.blocked_transaction?.risk_level && depositRiskLabel) || item.blocked_transaction?.score"
				class="details__list details__list--thirds"
			>
				<div v-if="depositAmountLabel" class="details__item">
					<dt>{{ $t("Amount") }}</dt>
					<dd class="details__amount">
						<span v-if="depositFiatLabel">{{ depositFiatLabel }}</span>
						<span v-if="depositFiatLabel && (depositCryptoAmount || depositNetworkLabel)">·</span>
						<span v-if="depositCryptoAmount" class="details__amount-crypto">
							<blockchain-icon
								v-if="depositCurrencyId"
								:type="depositCurrencyId as BlockchainType"
								width="16px"
								height="16px"
							/>
							<span>{{ depositCryptoAmount }}</span>
						</span>
						<span v-if="depositCryptoAmount && depositNetworkLabel">·</span>
						<span v-if="depositNetworkLabel">{{ depositNetworkLabel }}</span>
					</dd>
				</div>
				<div v-if="item.blocked_transaction?.risk_level && depositRiskLabel" class="details__item">
					<dt>{{ $t("Risk level") }}</dt>
					<dd :data-tone="riskTone(item.blocked_transaction.risk_level)">{{ $t(depositRiskLabel) }}</dd>
				</div>
				<div v-if="item.blocked_transaction?.score" class="details__item">
					<dt>{{ $t("Score") }}</dt>
					<dd>{{ item.blocked_transaction.score }}</dd>
				</div>
			</dl>
			<dl
				v-if="item.blocked_transaction?.tx_hash || item.blocked_transaction?.from_address || item.blocked_transaction?.to_address"
				class="details__list details__list--thirds"
			>
				<div v-if="item.blocked_transaction?.tx_hash" class="details__item">
					<dt>{{ $t("Transaction hash") }}</dt>
					<dd>
						<display-hash
							type="transaction"
							size-icon="xs"
							size-hash="md"
							:count-prefix="8"
							:count-suffix="4"
							:currency-id="depositCurrencyId"
							:hash="item.blocked_transaction.tx_hash"
						/>
					</dd>
				</div>
				<div v-if="item.blocked_transaction?.from_address" class="details__item">
					<dt>{{ $t("Sender") }}</dt>
					<dd>
						<display-hash
							type="address"
							size-icon="xs"
							size-hash="md"
							:count-prefix="8"
							:count-suffix="4"
							:currency-id="depositCurrencyId"
							:hash="item.blocked_transaction.from_address"
						/>
					</dd>
				</div>
				<div v-if="item.blocked_transaction?.to_address" class="details__item">
					<dt>{{ $t("Recipient") }}</dt>
					<dd>
						<display-hash
							type="address"
							size-icon="xs"
							size-hash="md"
							:count-prefix="8"
							:count-suffix="4"
							:currency-id="depositCurrencyId"
							:hash="item.blocked_transaction.to_address"
						/>
					</dd>
				</div>
			</dl>
		</section>

		<section v-if="showPayout && item.transfer" class="details details--headed">
			<h3 class="details__title">
				<span class="details__title-mark">
					<icon-transfer class="details__title-icon" />
				</span>
				{{ $t("Transfer") }}
			</h3>
			<dl
				v-if="payoutAmountLabel || item.transfer.status || item.transfer.tx_hash"
				class="details__list details__list--thirds"
			>
				<div v-if="payoutAmountLabel" class="details__item">
					<dt>{{ $t("Amount") }}</dt>
					<dd class="details__amount">
						<span v-if="payoutFiatLabel">{{ payoutFiatLabel }}</span>
						<span v-if="payoutFiatLabel && (payoutCryptoAmount || depositNetworkLabel)">·</span>
						<span v-if="payoutCryptoAmount" class="details__amount-crypto">
							<blockchain-icon
								v-if="depositCurrencyId"
								:type="depositCurrencyId as BlockchainType"
								width="16px"
								height="16px"
							/>
							<span>{{ payoutCryptoAmount }}</span>
						</span>
						<span v-if="payoutCryptoAmount && depositNetworkLabel">·</span>
						<span v-if="depositNetworkLabel">{{ depositNetworkLabel }}</span>
					</dd>
				</div>
				<div v-if="item.transfer.status" class="details__item">
					<dt>{{ $t("Status") }}</dt>
					<dd :data-tone="flowTone(item.transfer.status)">{{ $t(flowLabel(item.transfer.status)) }}</dd>
				</div>
				<div v-if="item.transfer.tx_hash" class="details__item details__item--third">
					<dt>{{ $t("Transaction hash") }}</dt>
					<dd>
						<display-hash
							type="transaction"
							size-icon="xs"
							size-hash="md"
							:count-prefix="8"
							:count-suffix="4"
							:currency-id="depositCurrencyId"
							:hash="item.transfer.tx_hash"
						/>
					</dd>
				</div>
			</dl>
		</section>

		<p v-if="item.status === 'scheduled' && item.execute_after" class="tx-card__note">
			{{ $t("Funds will be sent after") }} {{ formatDate(item.execute_after) }}
		</p>
		<div v-if="item.last_error" class="tx-card__error">
			<span class="tx-card__error-mark" aria-hidden="true">
				<ui-icon name="error" type="filled" size="sm" />
			</span>
			<div class="tx-card__error-body">
				<span class="tx-card__error-label">{{ $t("Last error") }}</span>
				<span class="tx-card__error-text">{{ item.last_error }}</span>
			</div>
		</div>

		<div v-if="canReview || canManageScheduled" class="tx-card__actions">
			<ui-button v-if="canReview" mode="neutral" size="lg" left-icon-name="check-circle" @click="approveRequest">
				{{ $t("Approve") }}
			</ui-button>
			<ui-confirm
				v-if="canReview"
				:title="`${$t('Reject refund request')}?`"
				:text="$t('The payer will not be able to submit another refund request for this deposit')"
				:method="rejectRequest"
			>
				<template #default="{ loading }">
					<ui-button type="secondary" size="lg" left-icon-name="cancel" :loading="loading">
						{{ $t("Reject") }}
					</ui-button>
				</template>
			</ui-confirm>
			<ui-button
				v-if="canManageScheduled"
				mode="neutral"
				size="lg"
				left-icon-name="send"
				@click="executeNowRequest"
			>
				{{ $t("Send now") }}
			</ui-button>
			<ui-confirm
				v-if="canManageScheduled"
				:title="`${$t('Cancel scheduled refund')}?`"
				:text="$t('The request will return to review')"
				:method="cancelRequest"
			>
				<template #default="{ loading }">
					<ui-button type="secondary" size="lg" left-icon-name="cancel" :loading="loading">
						{{ $t("Cancel refund") }}
					</ui-button>
				</template>
			</ui-confirm>
		</div>
	</article>
</template>

<style scoped lang="scss">
	.tx-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		border-radius: 20px;
		background: $white;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
		min-width: 0;

		@include mediamax(480) {
			padding: 12px;
			gap: 10px;
		}

		&__header {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: 12px;
			min-width: 0;
		}

		&__identity {
			min-width: 0;
		}

		&__title-row {
			display: flex;
			align-items: center;
			gap: 6px;
			min-width: 0;
		}

		&__email {
			flex-shrink: 0;
			color: $black;
			font-size: 15px;
			font-weight: 700;
			line-height: 20px;
			white-space: nowrap;
		}

		&__dot {
			flex-shrink: 0;
			color: $secondary;
			font-size: 13px;
			line-height: 18px;
		}

		&__wallet-text {
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: $secondary;
			font-size: 13px;
			font-weight: 400;
			line-height: 18px;
		}

		&__date {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			flex-shrink: 0;
			color: $black;
			font-size: 13px;
			font-weight: 500;
			line-height: 18px;
			white-space: nowrap;
		}

		&__date-icon {
			display: block;
			flex-shrink: 0;
			color: $black;
		}

		&__metrics {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 8px;

			@include mediamax(768) {
				grid-template-columns: 1fr;
			}
		}

		&__note {
			margin: 0;
			color: $secondary;
			font-size: 13px;
			line-height: 18px;
		}

		&__error {
			display: flex;
			align-items: flex-start;
			gap: 10px;
			margin: 0;
			padding: 10px 12px;
			border-radius: 14px;
			background: rgba(221, 76, 30, 0.06);
			box-shadow: inset 0 0 0 1px rgba(221, 76, 30, 0.16);
		}

		&__error-mark {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 22px;
			height: 22px;
			flex-shrink: 0;
			border-radius: 7px;
			background: rgba(221, 76, 30, 0.12);
			color: #dd4c1e;
		}

		&__error-body {
			display: flex;
			flex-direction: column;
			gap: 2px;
			min-width: 0;
		}

		&__error-label {
			color: #dd4c1e;
			font-size: 12px;
			font-weight: 600;
			line-height: 16px;
		}

		&__error-text {
			max-height: 72px;
			overflow-y: auto;
			color: $black;
			font-size: 13px;
			font-weight: 400;
			line-height: 18px;
			white-space: pre-wrap;
			overflow-wrap: anywhere;
		}

		&__actions {
			display: flex;
			justify-content: flex-end;
			flex-wrap: wrap;
			gap: 8px;

			@include mediamax(480) {
				flex-direction: column;

				:deep(.ui-button) {
					width: 100%;
				}
			}
		}
	}

	.metric {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		padding: 6px 8px;
		border-radius: 14px;
		background: $white;
		box-shadow: inset 0 0 0 1px $grey;

		&__icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			flex-shrink: 0;
			border-radius: 10px;
			background: $blue-opacity;
			color: $black;
		}

		&__body {
			display: flex;
			flex-direction: column;
			gap: 1px;
			min-width: 0;
			flex: 1;
		}

		&__label {
			color: $secondary;
			font-size: 12px;
			font-weight: 500;
			line-height: 14px;
		}

		&__value {
			color: $black;
			font-size: 14px;
			font-weight: 500;
			line-height: 16px;
			overflow-wrap: anywhere;

			&--hash {
				display: flex;
				align-items: center;
				gap: 6px;
				min-width: 0;
				color: $secondary;
				font-weight: 400;
				line-height: 18px;
			}

			&--link {
				color: $blue;
				text-decoration: none;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;

				@media (hover: hover) {
					&:hover {
						text-decoration: underline;
					}
				}
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

			&[data-tone="info"] {
				color: $blue;
			}

			&[data-tone="neutral"] {
				color: $secondary;
			}
		}

		&__hash-text {
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: $secondary;
			font-size: 14px;
			font-weight: 400;
			line-height: 18px;
		}
	}

	.details {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
		padding: 10px 12px;
		border-radius: 14px;
		background: $white;
		box-shadow: inset 0 0 0 1px $grey;

		&--headed {
			gap: 14px;
			padding: 0 12px 14px;
		}

		&__title {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			margin: 0;
			color: $black;
			font-size: 13px;
			font-weight: 600;
			line-height: 16px;
		}

		&--headed &__title {
			width: calc(100% + 24px);
			margin-right: -12px;
			margin-left: -12px;
			padding: 10px 12px;
			border-bottom: 1px solid $grey;
		}

		&__title-mark {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 22px;
			height: 22px;
			flex-shrink: 0;
			border-radius: 7px;
			background: $blue-opacity;
			color: $black;
		}

		&__title-icon {
			display: block;
			flex-shrink: 0;
			color: $black;
		}

		&__amount {
			display: flex;
			align-items: center;
			gap: 6px;
			min-width: 0;
		}

		&__amount-crypto {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			min-width: 0;
		}

		&__list {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 8px 16px;
			margin: 0;

			@include mediamax(768) {
				grid-template-columns: 1fr;
			}

			&--thirds {
				grid-template-columns: repeat(3, minmax(0, 1fr));

				@include mediamax(768) {
					grid-template-columns: 1fr;
				}
			}
		}

		&__item {
			display: flex;
			flex-direction: column;
			gap: 2px;
			min-width: 0;

			&--third {
				grid-column: 3;

				@include mediamax(768) {
					grid-column: auto;
				}
			}

			dt {
				color: $secondary;
				font-size: 12px;
				font-weight: 500;
				line-height: 14px;
			}

			dd {
				margin: 0;
				min-width: 0;
				color: $black;
				font-size: 14px;
				font-weight: 500;
				line-height: 18px;
				overflow-wrap: anywhere;

				:deep(.hash) {
					max-width: 100%;
					min-width: 0;
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

				&[data-tone="info"] {
					color: $blue;
				}

				&[data-tone="neutral"] {
					color: $secondary;
				}
			}
		}
	}
</style>
