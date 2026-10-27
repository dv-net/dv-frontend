<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { storeToRefs } from "pinia";
	import { useI18n } from "vue-i18n";
	import { UiPagination, UiSkeleton, UiTabs, UiTabsItem } from "@dv.net/ui-kit";
	import IconNotFound from "@dv-admin/components/icons/IconNotFound.vue";
	import {
		getApiRefundRequestsList,
		postApiRefundApprove,
		postApiRefundCancel,
		postApiRefundExecuteNow,
		postApiRefundReject
	} from "@dv-admin/utils/services/refunds";
	import type { IPagination, IRefundRequestDetailed, RefundStatus } from "@dv-admin/utils/types/api/apiGo";
	import { REFUND_REQUESTS_PAGE_SIZE, REFUND_STATUS_FILTER_LABELS, REFUND_STATUSES } from "@dv-admin/utils/constants/refund";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { useRefundsStore } from "@dv-admin/stores/refunds";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { usePolling } from "@shared/utils/composables/usePolling";
	import RefundRequestCard from "@dv-admin/views/projects/refunds/components/RefundRequestCard.vue";

	const { t } = useI18n();
	const { notify } = useNotifications();
	const { projects } = storeToRefs(useProjectsStore());
	const { getProjects } = useProjectsStore();
	const { loadRefundRequestsCount } = useRefundsStore();
	const { otpGlobalCode } = storeToRefs(useGeneralStore());
	const { openOtpGlobalModal } = useGeneralStore();
	const { startPolling } = usePolling();

	const refundRequests = ref<IRefundRequestDetailed[]>([]);
	const pagination = ref<IPagination | null>(null);
	const page = ref(1);
	const statusFilter = ref<RefundStatus | "all">("all");
	const isLoading = ref(true);
	let requestId = 0;

	const projectNameById = computed(() => {
		return new Map(projects.value.map((project) => [project.id, project.name]));
	});

	const statusOptions = computed(() => [
		{ value: "all", label: t("All") },
		...REFUND_STATUSES.map((status) => ({
			value: status,
			label: t(REFUND_STATUS_FILTER_LABELS[status])
		}))
	]);

	const listTotal = computed(() => pagination.value?.total ?? 0);

	const fetchRefundRequestsPage = () =>
		getApiRefundRequestsList({
			page: page.value,
			page_size: REFUND_REQUESTS_PAGE_SIZE,
			...(statusFilter.value === "all" ? {} : { statuses: [statusFilter.value] })
		});

	const loadRefundRequests = async () => {
		const currentRequestId = ++requestId;
		let data = await fetchRefundRequestsPage();
		while (!(data?.items ?? []).length && page.value > 1) {
			if (currentRequestId !== requestId) return;
			page.value -= 1;
			data = await fetchRefundRequestsPage();
		}
		if (currentRequestId !== requestId) return;
		refundRequests.value = data?.items ?? [];
		pagination.value = data?.pagination ?? null;
	};

	const refreshAfterAction = async () => {
		try {
			await Promise.all([loadRefundRequests(), loadRefundRequestsCount()]);
		} catch (error) {
			console.error(error);
		}
	};

	const handleReject = async (refundId: string) => {
		await postApiRefundReject(refundId);
		await refreshAfterAction();
		notify(t("Refund request rejected"), "success");
	};

	const handleApprove = async (refundId: string) => {
		if (!otpGlobalCode.value) {
			openOtpGlobalModal(() => handleApprove(refundId));
			return;
		}
		await postApiRefundApprove(refundId, otpGlobalCode.value);
		await refreshAfterAction();
		notify(t("Refund approved"), "success");
	};

	const handleCancel = async (refundId: string) => {
		await postApiRefundCancel(refundId);
		await refreshAfterAction();
		notify(t("Scheduled refund canceled"), "success");
	};

	const handleExecuteNow = async (refundId: string) => {
		if (!otpGlobalCode.value) {
			openOtpGlobalModal(() => handleExecuteNow(refundId));
			return;
		}
		await postApiRefundExecuteNow(refundId, otpGlobalCode.value);
		await refreshAfterAction();
		notify(t("Refund sent"), "success");
	};

	const handlePageChange = async (nextPage: number) => {
		if (nextPage === page.value) return;
		page.value = nextPage;
		try {
			await loadRefundRequests();
		} catch (error) {
			console.error(error);
		}
	};

	const setStatusFilter = (value: string) => {
		statusFilter.value = value as RefundStatus | "all";
	};

	watch(statusFilter, async () => {
		page.value = 1;
		try {
			await loadRefundRequests();
		} catch (error) {
			console.error(error);
		}
	});

	onMounted(async () => {
		await Promise.all([
			getProjects(),
			startPolling(async () => {
				try {
					await Promise.all([loadRefundRequests(), loadRefundRequestsCount()]);
				} finally {
					isLoading.value = false;
				}
			})
		]);
	});
</script>

<template>
	<div class="page">
		<div class="page__header">
			<div class="page__title-row">
				<h1 class="global-title-h1">{{ $t("Refund requests") }}</h1>
				<span v-if="!isLoading && listTotal" class="page__count">
					{{ listTotal }}
				</span>
			</div>
			<p class="page__subtitle">
				{{ $t("Payers can request a refund for deposits blocked by AML. Review pending requests here") }}
			</p>
		</div>

		<ui-tabs
			class="filters"
			mode="light"
			size="md"
			width-mode="content"
			:model-value="statusFilter"
			@update:model-value="setStatusFilter"
		>
			<ui-tabs-item v-for="option in statusOptions" :key="option.value" :value="option.value">
				{{ option.label }}
			</ui-tabs-item>
		</ui-tabs>

		<section class="panel">
			<div v-if="isLoading" class="panel__body">
				<div class="panel-card panel-card--skeleton">
					<ui-skeleton :rows="1" :row-height="156" :item-border-radius="20" />
				</div>
			</div>

			<div v-else-if="!refundRequests.length" class="panel-card panel-card--empty">
				<icon-not-found class="panel-card__empty-icon" />
				<p class="panel-card__empty-text">{{ $t("No refund requests") }}</p>
			</div>

			<div v-else class="panel__body">
				<refund-request-card
					v-for="item in refundRequests"
					:key="item.id"
					:item="item"
					:project-name="projectNameById.get(item.store_id)"
					:reject-request="() => handleReject(item.id)"
					:approve-request="() => handleApprove(item.id)"
					:cancel-request="() => handleCancel(item.id)"
					:execute-now-request="() => handleExecuteNow(item.id)"
				/>
			</div>
		</section>

		<ui-pagination
			v-if="!isLoading && refundRequests.length && listTotal > REFUND_REQUESTS_PAGE_SIZE"
			:per-page="REFUND_REQUESTS_PAGE_SIZE"
			:total="listTotal"
			:isShowPerPageSelect="false"
			:page="page"
			@update:page="handlePageChange"
		/>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;

		&__header {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}

		&__title-row {
			display: flex;
			align-items: center;
			gap: 8px;
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
	}

	.filters {
		align-self: flex-start;
		max-width: 100%;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 4px;
		border-radius: 24px;
		background: $blue-opacity;

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
			display: flex;
			flex: 1;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 4px;
			text-align: center;
		}

		&__empty-icon {
			width: 200px;
			height: 102px;
		}

		&__empty-text {
			margin: 0;
			color: $secondary;
			font-size: 16px;
			font-weight: 500;
			line-height: 24px;
		}
	}
</style>
