<script setup lang="ts">
	import { onMounted } from "vue";
	import { useRouter } from "vue-router";
	import { storeToRefs } from "pinia";
	import { UiButton, UiSkeleton } from "@dv.net/ui-kit";
	import { useRefundStore } from "@pay/stores/refund";
	import { REFUND_STATUS_LABELS } from "@pay/utils/constants/refund";
	import type { IRefundCabinetItem } from "@pay/utils/types/refund";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import RefundTxCard from "@pay/views/refund/components/RefundTxCard.vue";
	import { loaderShutdown } from "@pay-shared/utils/helpers/general";
	import { useI18n } from "vue-i18n";

	const refundStore = useRefundStore();
	const { cabinetSections, isLoadingCabinet, isLoadingClaim } = storeToRefs(refundStore);
	const { loadCabinet, claimRefund, logout } = refundStore;

	const router = useRouter();
	const { notify } = useNotifications();
	const { t } = useI18n();

	const handleClaim = async (item: IRefundCabinetItem, destinationAddress: string) => {
		try {
			await claimRefund(item, destinationAddress);
			notify(t("Refund request submitted"), "success");
		} catch (error) {
			console.error(error);
		}
	};

	const handleLogout = async () => {
		logout();
		await router.replace({ name: "refund-entry" });
	};

	onMounted(async () => {
		loaderShutdown();
		try {
			await loadCabinet();
		} catch (error) {
			console.error(error);
			await router.replace({ name: "refund-entry" });
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
				<ui-button size="md" type="secondary" left-icon-name="logout" @click="handleLogout">
					{{ $t("Sign out") }}
				</ui-button>
			</header>
		</section>

		<section v-if="isLoadingCabinet" class="panel">
			<div class="panel__body">
				<div class="panel-card panel-card--skeleton">
					<ui-skeleton :rows="1" :row-height="160" :item-border-radius="20" />
				</div>
				<div class="panel-card panel-card--skeleton">
					<ui-skeleton :rows="1" :row-height="160" :item-border-radius="20" />
				</div>
			</div>
		</section>

		<section v-else-if="!cabinetSections.length" class="panel">
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
				@include mediamax(640) {
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
</style>
