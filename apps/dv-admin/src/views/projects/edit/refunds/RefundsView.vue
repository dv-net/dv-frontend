<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import { useRoute } from "vue-router";
	import { useI18n } from "vue-i18n";
	import { UiSkeleton } from "@dv.net/ui-kit";
	import { getApiStoreRefundRequests, postApiStoreRefundReject } from "@dv-admin/utils/services/projects";
	import type { IRefundRequest } from "@dv-admin/utils/types/api/apiGo";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import RefundRequestCard from "@dv-admin/views/projects/edit/refunds/components/RefundRequestCard.vue";

	const { t } = useI18n();
	const { notify } = useNotifications();
	const route = useRoute();
	const storeId = route.params.id as string;

	const refundRequests = ref<IRefundRequest[]>([]);
	const isLoading = ref(false);

	const loadRefundRequests = async () => {
		try {
			isLoading.value = true;
			refundRequests.value = await getApiStoreRefundRequests(storeId);
		} catch (error) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const handleReject = async (refundId: string) => {
		await postApiStoreRefundReject(storeId, refundId);
		refundRequests.value = refundRequests.value.filter((item) => item.id !== refundId);
		notify(t("Refund request rejected"), "success");
	};

	onMounted(loadRefundRequests);
</script>

<template>
	<div class="refunds">
		<section class="panel">
			<header class="panel__header">
				<div class="panel__intro">
					<div class="panel__section-head">
						<h2 class="panel__title">{{ $t("Refund requests") }}</h2>
						<span v-if="!isLoading && refundRequests.length" class="panel__count">
							{{ refundRequests.length }}
						</span>
					</div>
					<p class="panel__subtitle">
						{{
							$t(
								"Payers can request a refund for deposits blocked by AML. Review pending requests here"
							)
						}}
					</p>
				</div>
			</header>

			<div v-if="isLoading" class="panel__body">
				<div class="panel-card panel-card--skeleton">
					<ui-skeleton :rows="1" :row-height="156" :item-border-radius="20" />
				</div>
				<div class="panel-card panel-card--skeleton">
					<ui-skeleton :rows="1" :row-height="156" :item-border-radius="20" />
				</div>
			</div>

			<div v-else-if="!refundRequests.length" class="panel-card panel-card--empty">
				{{ $t("No pending refund requests") }}
			</div>

			<div v-else class="panel__body">
				<refund-request-card
					v-for="item in refundRequests"
					:key="item.id"
					:item="item"
					:reject-request="() => handleReject(item.id)"
				/>
			</div>
		</section>
	</div>
</template>

<style scoped lang="scss">
	.refunds {
		width: 100%;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 4px;
		border-radius: 24px;
		background: $blue-opacity;

		&__header {
			display: flex;
			flex-direction: column;
			gap: 4px;
			padding: 12px 16px 8px;
		}

		&__intro {
			display: flex;
			flex-direction: column;
			gap: 4px;
			min-width: 0;
		}

		&__section-head {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		&__title {
			margin: 0;
			color: $black;
			font-size: 20px;
			font-weight: 700;
			line-height: 24px;
		}

		&__subtitle {
			margin: 0;
			color: $secondary;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
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
			color: $secondary;
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
		background: $white;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);

		&--skeleton {
			padding: 8px;
		}

		&--empty {
			color: $secondary;
			font-size: 14px;
			line-height: 20px;
			text-align: center;
		}
	}
</style>
