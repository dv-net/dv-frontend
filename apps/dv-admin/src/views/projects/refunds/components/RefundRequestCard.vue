<script setup lang="ts">
	import { computed } from "vue";
	import { UiButton, UiConfirm, UiCopyText } from "@dv.net/ui-kit";
	import type { IRefundRequest, RefundStatus } from "@dv-admin/utils/types/api/apiGo";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { truncateHash } from "@shared/utils/helpers/general";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery";
	import IconStatus from "@dv-admin/components/icons/refund/IconStatus.vue";
	import IconWallet from "@dv-admin/components/icons/refund/IconWallet.vue";
	import IconCalendar from "@dv-admin/components/icons/refund/IconCalendar.vue";
	import IconDocument from "@dv-admin/components/icons/projects/IconDocument.vue";

	const STATUS_LABELS: Record<RefundStatus, string> = {
		pending_review: "Pending review",
		rejected: "Rejected",
		processing: "Processing",
		completed: "Completed",
		failed: "Failed"
	};

	const { item, projectName, rejectRequest } = defineProps<{
		item: IRefundRequest;
		projectName?: string;
		rejectRequest: () => Promise<unknown>;
	}>();

	const isCompact = useMediaQuery("(max-width: 1024px)");

	const statusLabel = computed(() => STATUS_LABELS[item.status] ?? item.status);

	const statusTone = computed(() => {
		switch (item.status) {
			case "completed":
				return "success";
			case "failed":
			case "rejected":
				return "danger";
			case "processing":
			case "pending_review":
				return "warning";
			default:
				return "neutral";
		}
	});

	const canReject = computed(() => item.status === "pending_review");

	const displayWalletId = computed(() => {
		if (!item.wallet_id) return "";
		return isCompact.value ? truncateHash(item.wallet_id, 10, 6) : item.wallet_id;
	});

	const displayDestination = computed(() => {
		if (!item.destination_address) return "";
		return isCompact.value ? truncateHash(item.destination_address, 10, 6) : item.destination_address;
	});

	const displayProjectName = computed(() => projectName || item.store_id);
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

		<div v-if="canReject" class="tx-card__actions">
			<ui-confirm
				:title="`${$t('Reject refund request')}?`"
				:text="$t('The payer will not be able to submit another refund request for this deposit')"
				:method="rejectRequest"
			>
				<template #default="{ loading }">
					<ui-button mode="neutral" size="lg" left-icon-name="cancel" :loading="loading">
						{{ $t("Reject") }}
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

		&__actions {
			display: flex;
			justify-content: flex-end;

			@include mediamax(480) {
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
</style>
