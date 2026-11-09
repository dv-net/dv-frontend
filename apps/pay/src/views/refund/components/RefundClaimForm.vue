<script setup lang="ts">
	import { computed, ref } from "vue";
	import { UiButton, UiCopyText, UiIcon, UiInput, UiSkeleton } from "@dv.net/ui-kit";
	import { isBitcoinLikeDeposit } from "@pay/utils/constants/refund";
	import type { IRefundCabinetItem, IRefundEstimate } from "@pay/utils/types/refund";
	import { ESTIMATE_REFRESH_MS, useRefundEstimate } from "@pay/views/refund/composables/useRefundEstimate";
	import IconDeposit from "@pay/components/icons/refund/IconDeposit.vue";
	import IconTransfer from "@pay/components/icons/refund/IconTransfer.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery";
	import { formatAmountBlockchain, getCurrentCoin, truncateHash } from "@shared/utils/helpers/general";
	import { useI18n } from "vue-i18n";

	const {
		item,
		loading = false,
		toSender = false
	} = defineProps<{
		item: IRefundCabinetItem;
		loading?: boolean;
		toSender?: boolean;
	}>();

	const emit = defineEmits<{
		claim: [destinationAddress: string];
		cancel: [];
	}>();

	const { t } = useI18n();
	const isCompact = useMediaQuery("(max-width: 768px)");
	const destinationAddress = ref(toSender ? (item.from_address ?? "") : "");
	const senderAddressEditable = computed(
		() => toSender && isBitcoinLikeDeposit(item.currency_id, item.blockchain)
	);
	const fillButtonSize = computed(() => (isCompact.value ? "lg" : "xl"));
	const { estimate, isEstimating, isWaiting, errorKey, quoteCycle, canClaim } = useRefundEstimate(
		item.blocked_transaction_id,
		destinationAddress,
		toSender
	);

	const showEstimate = computed(() => destinationAddress.value.trim().length >= 20);

	const fractionDigits = (amount: string | number) => String(amount).split(".")[1]?.length ?? 0;

	const isPositiveAmount = (value: string | number | null | undefined) => {
		if (value === null || value === undefined || value === "") return false;
		return /[1-9]/.test(String(value));
	};

	const formatCrypto = (amount: string | number | null | undefined, currencyId: string, exact = false) => {
		if (amount === null || amount === undefined || amount === "" || !currencyId) return "";
		const formatted = formatAmountBlockchain(amount, {
			currencyId,
			count: exact ? fractionDigits(amount) : undefined
		});
		if (!formatted || formatted === "—") return "";
		const coin = getCurrentCoin(currencyId);
		return coin ? `${formatted} ${coin}` : formatted;
	};

	const shortageLabel = computed(() => {
		const current = estimate.value;
		if (!current || !isPositiveAmount(current.fee_shortage)) return "";
		return formatCrypto(current.fee_shortage, current.fee_currency_id, true);
	});

	const showShortage = computed(() => {
		const current = estimate.value;
		const fee = current?.estimated_fee;
		const shortage = current?.fee_shortage;
		if (!current || !shortageLabel.value || fee === null || fee === undefined || fee === "") return Boolean(shortageLabel.value);
		if (shortage === null || shortage === undefined || shortage === "") return false;
		return (
			formatAmountBlockchain(fee, { currencyId: current.fee_currency_id, count: fractionDigits(fee) }) !==
			formatAmountBlockchain(shortage, { currencyId: current.fee_currency_id, count: fractionDigits(shortage) })
		);
	});

	const feeBalanceLabel = computed(() => {
		const current = estimate.value;
		if (!current || current.fee_balance === null || current.fee_balance === undefined || current.fee_balance === "") {
			return "";
		}
		return formatCrypto(current.fee_balance, current.fee_currency_id, true);
	});

	const networkFeeLabel = (current: IRefundEstimate) => {
		if (current.estimated_fee !== null && current.estimated_fee !== undefined && current.estimated_fee !== "") {
			return formatCrypto(current.estimated_fee, current.fee_currency_id, true);
		}
		if (current.fee_from_amount) return t("Taken from the refund amount");
		return t("The exact fee is not estimated yet");
	};

	const amountToReceiveLabel = (current: IRefundEstimate) => {
		if (current.amount_to_receive !== null && current.amount_to_receive !== undefined && current.amount_to_receive !== "") {
			return formatCrypto(current.amount_to_receive, current.currency_id);
		}
		return t("Calculated when the refund is sent");
	};

	const depositCaption = computed(() => {
		if (!shortageLabel.value) return t("Send native coin to this deposit address");
		return showShortage.value ? t("To this deposit address") : t("Send the network fee here");
	});

	const displayDepositAddress = computed(() => {
		if (!item.to_address) return "";
		return isCompact.value ? truncateHash(item.to_address, 10, 6) : item.to_address;
	});

	const fillSenderAddress = () => {
		if (!item.from_address) return;
		destinationAddress.value = item.from_address;
	};

	const submit = () => {
		if (!canClaim.value || loading) return;
		emit("claim", destinationAddress.value.trim());
	};
</script>

<template>
	<form class="claim-form" @submit.prevent="submit">
		<p class="claim-form__hint">
			<ui-icon class="claim-form__hint-icon" name="info" type="400" size="sm" />
			<span v-if="toSender">{{ $t("A refund to the sender address is sent automatically within an hour") }}</span>
			<span v-else>
				{{ $t("A refund to the sender address is sent automatically within an hour") }}.
				{{ $t("A refund to another address is sent after the merchant reviews it") }}
			</span>
		</p>
		<div class="claim-form__address">
			<ui-input
				v-model="destinationAddress"
				class="claim-form__input"
				:label="$t(toSender ? 'Sender address' : 'Destination address')"
				:placeholder="$t(toSender ? 'Sender address' : 'Destination address')"
				:readonly="toSender && !senderAddressEditable"
				size="md"
				name="destination_address"
				autocomplete="off"
			>
				<template v-if="toSender && !senderAddressEditable && destinationAddress" #append>
					<ui-copy-text :copied-text="destinationAddress" color-icon="#A4A5B1" size-icon="sm" />
				</template>
			</ui-input>
			<ui-button
				v-if="item.from_address && !toSender"
				class="claim-form__fill"
				native-type="button"
				:size="fillButtonSize"
				type="secondary"
				left-icon-name="arrow-back"
				left-icon-size="sm"
				:disabled="loading"
				@click="fillSenderAddress"
			>
				{{ $t("Return to the sender address") }}
			</ui-button>
		</div>
		<div v-if="showEstimate" class="claim-form__estimate">
			<ui-skeleton
				v-if="isWaiting || isEstimating"
				role="status"
				:aria-label="$t('Estimating the refund')"
				:rows="1"
				:row-height="109"
				:item-border-radius="16"
				first-color="var(--color-background-tertiary)"
				second-color="var(--color-background-secondary)"
			/>
			<p v-else-if="errorKey" class="claim-form__warning">
				{{ $t(errorKey) }}
			</p>
			<section v-else-if="estimate" class="claim-form__block">
				<div class="claim-form__panes">
					<div class="claim-form__pane">
						<h3 class="claim-form__block-title">
							<span class="claim-form__title-mark">
								<icon-transfer class="claim-form__title-icon" />
							</span>
							{{ $t("Transfer") }}
						</h3>
						<dl class="claim-form__rows">
							<div class="claim-form__row">
								<dt>{{ $t("Amount to receive") }}</dt>
								<dd>{{ amountToReceiveLabel(estimate) }}</dd>
							</div>
							<div class="claim-form__row">
								<dt>
									{{ $t("Network fee") }}
									<svg
										:key="quoteCycle"
										class="claim-form__timer"
										:style="{ '--quote-duration': `${ESTIMATE_REFRESH_MS}ms` }"
										viewBox="0 0 20 20"
										width="14"
										height="14"
										aria-hidden="true"
									>
										<circle class="claim-form__timer-track" cx="10" cy="10" r="7" />
										<circle class="claim-form__timer-value" cx="10" cy="10" r="7" />
									</svg>
								</dt>
								<dd>{{ networkFeeLabel(estimate) }}</dd>
							</div>
						</dl>
					</div>
					<div v-if="!estimate.fee_covered" class="claim-form__pane">
						<h3 class="claim-form__block-title">
							<span class="claim-form__title-mark">
								<icon-deposit class="claim-form__title-icon" />
							</span>
							{{ $t("Deposit") }}
						</h3>
						<p class="claim-form__caption">{{ depositCaption }}</p>
						<div v-if="item.to_address" class="claim-form__address-row">
							<span class="claim-form__address-text">{{ displayDepositAddress }}</span>
							<ui-copy-text :copied-text="item.to_address" color-icon="#A4A5B1" size-icon="sm" />
						</div>
						<dl v-if="shortageLabel || feeBalanceLabel" class="claim-form__rows">
							<div v-if="shortageLabel" class="claim-form__row">
								<dt>{{ $t("Still needed") }}</dt>
								<dd>{{ shortageLabel }}</dd>
							</div>
							<div v-if="feeBalanceLabel" class="claim-form__row">
								<dt>{{ $t("Fee balance") }}</dt>
								<dd>{{ feeBalanceLabel }}</dd>
							</div>
						</dl>
						<p v-if="estimate.activation_required" class="claim-form__caption">
							{{ $t("The deposit address is not activated") }}
						</p>
					</div>
				</div>
			</section>
		</div>
		<p class="claim-form__warning">
			{{ $t("Exchange refund warning") }}
		</p>
		<div class="claim-form__actions">
			<ui-button
				native-type="submit"
				size="lg-xl"
				mode="neutral"
				left-icon-name="account-balance-wallet"
				left-icon-size="sm"
				:loading="loading"
				:disabled="!canClaim || loading"
			>
				{{ $t(toSender ? "Return to the sender address" : "Submit refund request") }}
			</ui-button>
			<ui-button
				native-type="button"
				size="lg-xl"
				type="secondary"
				left-icon-name="cancel"
				left-icon-size="sm"
				:disabled="loading"
				@click="emit('cancel')"
			>
				{{ t("Cancel") }}
			</ui-button>
		</div>
	</form>
</template>

<style scoped lang="scss">
	.claim-form {
		display: flex;
		flex-direction: column;
		gap: 12px;

		&__hint,
		&__warning {
			margin: 0;
			font-size: 13px;
			line-height: 1.4;
			color: $main-text-grey-color;
		}

		&__hint {
			display: flex;
			align-items: flex-start;
			gap: 8px;
		}

		&__hint-icon {
			flex-shrink: 0;
			margin-top: 1px;
			color: $main-text-grey-color;
		}

		&__address {
			display: flex;
			align-items: center;
			gap: 8px;

			@include mediamax(768) {
				flex-direction: column;
				align-items: stretch;
			}
		}

		&__input {
			flex: 1 1 auto;
			min-width: 0;
			width: 100%;
		}

		&__fill {
			flex-shrink: 0;

			@include mediamax(768) {
				width: 100%;
			}
		}

		&__warning {
			padding: 10px 12px;
			border-radius: 12px;
			background: rgba(255, 158, 0, 0.12);
			color: #8a5a00;
		}

		&__estimate {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}

		&__block {
			min-width: 0;
			overflow: hidden;
			border-radius: 16px;
			background: #fff;
			box-shadow: inset 0 0 0 1px #e1e8f1;
		}

		&__panes {
			display: grid;
			grid-template-columns: 1fr 1fr;

			@include mediamax(768) {
				grid-template-columns: 1fr;
			}
		}

		&__pane {
			display: flex;
			flex-direction: column;
			gap: 10px;
			min-width: 0;
			padding: 0 14px 12px;

			&:only-child {
				grid-column: 1 / -1;
			}

			& + & {
				border-left: 1px solid #e1e8f1;

				@include mediamax(768) {
					border-left: 0;
					border-top: 1px solid #e1e8f1;
				}
			}
		}

		&__block-title {
			display: flex;
			align-items: center;
			gap: 6px;
			width: calc(100% + 28px);
			margin: 0 -14px;
			padding: 10px 14px;
			border-bottom: 1px solid #e1e8f1;
			color: $main-color;
			font-size: 13px;
			font-weight: 600;
			line-height: 16px;
		}

		&__title-mark {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 22px;
			height: 22px;
			flex-shrink: 0;
			border-radius: 7px;
			background: #f7f9fb;
			color: $main-color;
		}

		&__title-icon {
			display: block;
			flex-shrink: 0;
		}

		&__amount {
			margin: 0;
			color: $main-color;
			font-size: 16px;
			font-weight: 600;
			line-height: 22px;
		}

		&__caption {
			margin: 0;
			color: $main-color;
			font-size: 13px;
			line-height: 18px;
		}

		&__timer {
			display: block;
			flex-shrink: 0;
			color: $main-text-grey-color;
		}

		&__timer-track,
		&__timer-value {
			fill: none;
			stroke-width: 2;
		}

		&__timer-track {
			stroke: #e1e8f1;
		}

		&__timer-value {
			stroke: currentColor;
			stroke-linecap: round;
			transform: rotate(-90deg);
			transform-origin: center;
			stroke-dasharray: 43.98;
			stroke-dashoffset: 43.98;
			animation: quote-fill var(--quote-duration, 10s) linear forwards;
		}

		&__address-row {
			display: flex;
			align-items: center;
			gap: 6px;
			min-width: 0;
			padding: 6px 8px;
			border-radius: 10px;
			background: #f7f9fb;
		}

		&__address-text {
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: $main-color;
			font-size: 12px;
			line-height: 16px;
		}

		&__rows {
			display: flex;
			flex-direction: column;
			gap: 8px;
			margin: 0;
		}

		&__row {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			gap: 12px;
			font-size: 13px;
			line-height: 18px;

			dt {
				display: inline-flex;
				align-items: center;
				gap: 6px;
				color: $main-text-grey-color;
			}

			dd {
				margin: 0;
				color: $main-color;
				font-weight: 500;
				text-align: right;
			}

			@include mediamax(768) {
				flex-direction: column;
				align-items: flex-start;
				gap: 2px;

				dd {
					text-align: left;
					overflow-wrap: anywhere;
				}
			}
		}

		&__actions {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-end;
			gap: 8px;

			@include mediamax(768) {
				display: grid;
				grid-template-columns: 1fr 1fr;

				:deep(.ui-button) {
					width: 100%;
				}
			}

			@include mediamax(480) {
				grid-template-columns: 1fr;
			}
		}
	}

	@keyframes quote-fill {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
