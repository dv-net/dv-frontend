<script setup lang="ts">
	import { onMounted } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { storeToRefs } from "pinia";
	import { UiButton, UiSkeleton } from "@dv.net/ui-kit";
	import { useRefundStore } from "@pay/stores/refund";
	import { REFUND_CABINET_BUCKET_ORDER, REFUND_STATUS_LABELS } from "@pay/utils/constants/refund";
	import type { IRefundCabinetItem } from "@pay/utils/types/refund";
	import { buildRefundEntryPartialRoute, parseRefundEntryPartialQuery } from "@pay/utils/helpers/refundEntry";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import RefundTxCard from "@pay/views/refund/components/RefundTxCard.vue";
	import { loaderShutdown } from "@pay-shared/utils/helpers/general";
	import { useI18n } from "vue-i18n";

	const refundStore = useRefundStore();
	const { cabinetSections, isLoadingCabinet, isLoadingClaim, walletId, storeId } = storeToRefs(refundStore);
	const { loadCabinet, claimRefund, logout, prefillPartialFromQuery, syncTokenFromStore } = refundStore;

	const route = useRoute();
	const router = useRouter();
	const { notify } = useNotifications();
	const { t } = useI18n();

	const cabinetSkeletonSections = REFUND_CABINET_BUCKET_ORDER.slice(0, 2);

	const handleClaim = async (item: IRefundCabinetItem, destinationAddress: string) => {
		try {
			await claimRefund(item, destinationAddress);
			notify(t("Refund request submitted"), "success");
		} catch (error) {
			console.error(error);
		}
	};

	const getRefundContext = () => {
		const fromQuery = parseRefundEntryPartialQuery(route.query);
		if (fromQuery) return fromQuery;
		if (walletId.value && storeId.value) {
			return { wallet_id: walletId.value, store_id: storeId.value };
		}
		return null;
	};

	const handleLogout = async () => {
		logout();
		const context = getRefundContext();
		await router.replace(context ? buildRefundEntryPartialRoute(context) : { name: "refund-entry" });
	};

	const handleBackToPayment = async () => {
		if (!walletId.value) return;
		await router.push({ name: "payer-wallet", params: { payerId: walletId.value } });
	};

	onMounted(async () => {
		loaderShutdown();
		const context = parseRefundEntryPartialQuery(route.query);
		if (context) {
			prefillPartialFromQuery(context);
		} else {
			syncTokenFromStore();
		}
		try {
			await loadCabinet();
		} catch (error) {
			console.error(error);
			await router.replace(context ? buildRefundEntryPartialRoute(context) : { name: "refund-entry" });
		}
	});
</script>

<template>
	<div class="refund-cabinet">
		<section class="panel">
			<header class="panel__header panel__header--row">
				<div class="panel__intro">
					<h1 class="panel__title">{{ $t("Refund cabinet") }}</h1>
					<p class="panel__subtitle">
						{{ $t("Blocked deposits for this wallet. Request a refund where available") }}
					</p>
				</div>
				<div class="panel__actions">
					<ui-button
						v-if="walletId"
						size="md"
						type="outline"
						mode="neutral"
						left-icon-name="arrow-back"
						@click="handleBackToPayment"
					>
						{{ $t("Back to payment") }}
					</ui-button>
					<ui-button
						size="md"
						type="secondary"
						left-icon-name="logout"
						@click="handleLogout"
					>
						{{ $t("Sign out") }}
					</ui-button>
				</div>
			</header>
		</section>

		<template v-if="isLoadingCabinet">
			<section v-for="bucket in cabinetSkeletonSections" :key="bucket" class="panel">
				<header class="panel__header">
					<div class="panel__section-head">
						<h2 class="panel__title">{{ $t(REFUND_STATUS_LABELS[bucket]) }}</h2>
						<span class="panel__count panel__count--skeleton" />
					</div>
				</header>
				<div class="panel__body">
					<div class="panel-card panel-card--skeleton">
						<ui-skeleton :rows="1" :row-height="160" :item-border-radius="20" />
					</div>
					<div class="panel-card panel-card--skeleton">
						<ui-skeleton :rows="1" :row-height="160" :item-border-radius="20" />
					</div>
				</div>
			</section>
		</template>

		<template v-else>
			<section v-if="!cabinetSections.length" class="panel">
				<div class="panel-card panel-card--empty">
					{{ $t("No blocked deposits found for this wallet") }}
				</div>
			</section>

			<section v-for="section in cabinetSections" :key="section.bucket" class="panel">
				<header class="panel__header">
					<div class="panel__section-head">
						<h2 class="panel__title">{{ $t(REFUND_STATUS_LABELS[section.bucket]) }}</h2>
						<span class="panel__count">{{ section.items.length }}</span>
					</div>
				</header>
				<div class="panel__body">
					<refund-tx-card
						v-for="item in section.items"
						:key="item.blocked_transaction_id"
						:item="item"
						:show-claim-action="section.bucket === 'available'"
						:claim-loading="isLoadingClaim"
						@claim="handleClaim(item, $event)"
					/>
				</div>
			</section>
		</template>
	</div>
</template>

<style scoped lang="scss">
	.refund-cabinet {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 4px;
		border-radius: 24px;
		background: #f7f9fb;

		&__header {
			display: flex;
			flex-direction: column;
			gap: 4px;
			padding: 12px 16px 8px;

			&--row {
				flex-direction: row;
				align-items: flex-start;
				justify-content: space-between;
				gap: 16px;
				@include mediamax(768) {
					flex-direction: column;
					align-items: stretch;
				}
			}
		}

		&__intro {
			display: flex;
			flex-direction: column;
			gap: 4px;
			min-width: 0;
		}

		&__actions {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-shrink: 0;

			@include mediamax(768) {
				flex-direction: column;
				align-items: stretch;
				width: 100%;

				:deep(.ui-button) {
					width: 100%;
				}
			}
		}

		&__title {
			margin: 0;
			color: #303345;
			font-size: 20px;
			font-weight: 700;
			line-height: 24px;
		}

		&__subtitle {
			margin: 0;
			color: $main-text-grey-color;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
		}

		&__section-head {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		&__count {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 22px;
			height: 22px;
			padding: 0 6px;
			border-radius: 11px;
			background: rgba(48, 51, 69, 0.06);
			color: $main-text-grey-color;
			font-size: 12px;
			font-weight: 500;
			line-height: 1;

			&--skeleton {
				width: 22px;
				padding: 0;
				background: rgba(48, 51, 69, 0.08);
				animation: panel-count-pulse 1.2s ease-in-out infinite;
			}
		}

		&__body {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}
	}

	.panel-card {
		padding: 20px;
		border-radius: 20px;
		background: $form-background;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);

		&--skeleton {
			padding: 8px;
		}

		&--empty {
			color: $main-text-grey-color;
			font-size: 14px;
			line-height: 20px;
			text-align: center;
		}
	}

	@keyframes panel-count-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.45;
		}
	}
</style>
