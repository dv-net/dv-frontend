<script setup lang="ts">
	import { UiButton, UiIcon } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import { useI18n } from "vue-i18n";
	import { useRefundStore } from "@pay/stores/refund";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import RefundTxCard from "@pay/views/refund/components/RefundTxCard.vue";
	import IconTransfer from "@pay/components/icons/refund/IconTransfer.vue";
	import type { IRefundCabinetItem } from "@pay/utils/types/refund";

	const emit = defineEmits<{
		email: [];
	}>();

	const refundStore = useRefundStore();
	const { senderRefundItems, claimingSenderRefundId } = storeToRefs(refundStore);
	const { claimRefundToSender, loadSenderRefundItems } = refundStore;

	const { t } = useI18n();
	const { notify } = useNotifications();

	const readClaimError = (error: unknown): { status?: number; message: string } => {
		if (!error || typeof error !== "object" || !("response" in error)) return { message: "" };
		const response = (error as { response?: { status?: number; data?: { errors?: { message?: string }[] } } })
			.response;
		return { status: response?.status, message: response?.data?.errors?.[0]?.message ?? "" };
	};

	const handleClaim = async (item: IRefundCabinetItem, destinationAddress: string) => {
		try {
			await claimRefundToSender(item, destinationAddress);
		} catch (error) {
			const { status, message } = readClaimError(error);
			if (status === 409) {
				notify(t("A refund request has already been submitted"));
				await loadSenderRefundItems();
				return;
			}
			if (status === 403) {
				notify(t("Refund without email is no longer available"));
				await loadSenderRefundItems();
				return;
			}
			if (status === 422) {
				notify(t(message.includes("not a sender") ? "The address is not a sender of the deposit" : "Refund fee unavailable"));
				return;
			}
			notify(t("Failed to submit the refund request"));
			console.error(error);
		}
	};
</script>

<template>
	<div class="choice">
		<section class="alternative">
			<span class="method__mark" aria-hidden="true">
				<ui-icon name="mail" type="400" size="md" />
			</span>
			<div class="method__intro">
				<h2 class="method__title">{{ $t("To another address") }}</h2>
				<p class="method__text">
					{{ $t("Email confirmation required") }}. {{ $t("A refund to another address is sent after the merchant reviews it") }}
				</p>
			</div>
			<ui-button
				class="alternative__action"
				size="lg"
				type="secondary"
				left-icon-name="mail"
				left-icon-size="sm"
				@click="emit('email')"
			>
				{{ $t("Continue with email") }}
			</ui-button>
		</section>

		<section class="method">
			<header class="method__head">
				<span class="method__mark" aria-hidden="true">
					<icon-transfer />
				</span>
				<div class="method__intro">
					<div class="method__title-row">
						<h2 class="method__title">{{ $t("To the sender address") }}</h2>
						<span class="method__badge">{{ $t("No email needed") }}</span>
					</div>
					<p class="method__text">{{ $t("A refund to the sender address is sent automatically within an hour") }}</p>
				</div>
			</header>
			<div class="method__list">
				<refund-tx-card
					v-for="item in senderRefundItems"
					:key="item.blocked_transaction_id"
					:item="item"
					:show-claim-action="!item.refund_status && Boolean(item.from_address)"
					:claim-loading="claimingSenderRefundId === item.blocked_transaction_id"
					to-sender
					@claim="handleClaim(item, $event)"
				/>
			</div>
		</section>
	</div>
</template>

<style scoped lang="scss">
	.choice {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.method {
		display: flex;
		flex-direction: column;
		gap: 4px;

		&__head {
			display: flex;
			align-items: flex-start;
			gap: 12px;
			padding: 12px 16px 8px;
			@include mediamax(480) {
				padding: 12px 12px 8px;
			}
		}

		&__mark {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			flex-shrink: 0;
			border-radius: 12px;
			background: $form-background;
			box-shadow: inset 0 0 0 1px #e1e8f1;
			color: $main-color;
		}

		&__intro {
			display: flex;
			flex-direction: column;
			gap: 4px;
			min-width: 0;
			flex: 1;
		}

		&__title-row {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 8px;
		}

		&__title {
			margin: 0;
			color: $main-color;
			font-size: 16px;
			font-weight: 600;
			line-height: 20px;
		}

		&__badge {
			display: inline-flex;
			align-items: center;
			height: 22px;
			padding: 0 8px;
			border-radius: 11px;
			background: rgba(27, 143, 58, 0.1);
			color: #1b8f3a;
			font-size: 12px;
			font-weight: 500;
			line-height: 16px;
			white-space: nowrap;
		}

		&__text {
			margin: 0;
			color: $main-text-grey-color;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
		}

		&__list {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}
	}

	.alternative {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
		padding: 20px;
		border-radius: 20px;
		background: $form-background;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
		@include mediamax(768) {
			flex-wrap: wrap;
		}
		@include mediamax(480) {
			padding: 16px;
		}

		.method__mark {
			background: #f7f9fb;
			box-shadow: none;
		}

		&__action {
			flex-shrink: 0;
			@include mediamax(768) {
				width: 100%;
			}
		}
	}
</style>
