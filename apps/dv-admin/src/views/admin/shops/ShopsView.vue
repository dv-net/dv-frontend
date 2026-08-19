<script setup lang="ts">
	import { computed, onMounted } from "vue";
	import { storeToRefs } from "pinia";
	import { useI18n } from "vue-i18n";
	import { UiTable } from "@dv.net/ui-kit";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { useRootStore } from "@dv-admin/stores/root";
	import { STORE_VERIFICATION_STATUS } from "@dv-admin/utils/constants/root";
	import TableVariantA from "@dv-admin/components/ui/tableVariantA/TableVariantA.vue";
	import StoreActionRow from "@dv-admin/views/admin/shops/components/StoreActionRow.vue";

	const { t } = useI18n();
	const {
		isLoadingPending,
		isLoadingRejected,
		pendingStoresList,
		pendingPagination,
		pendingFilter,
		rejectedStoresList,
		rejectedPagination,
		rejectedFilter,
		isLoadingVerify,
		isLoadingReject,
		isLoadingClarification
	} = storeToRefs(useRootStore());
	const {
		getStoresLists,
		getPendingStoresList,
		getRejectedStoresList,
		verifyStoreById,
		rejectStoreById,
		clarificationStoreById
	} = useRootStore();

	const pendingHeaders = computed<UiTableHeader[]>(() => [
		{ name: "name", label: t("Name"), width: "250" },
		{ name: "owner_email", label: t("User"), width: "300" },
		{ name: "verification_status", label: t("Verification status"), width: "250" },
		{ name: "actions" }
	]);

	const rejectedHeaders = computed<UiTableHeader[]>(() => [
		{ name: "name", label: t("Name") },
		{ name: "owner_email", label: t("User") },
		{ name: "verification_status", label: t("Verification status") },
		{ name: "actions", label: "", width: "140" }
	]);

	const pendingStoresTotal = computed(() => pendingPagination.value?.total ?? 0);

	const changePendingPageHandler = async (pagination: UiPaginationMeta) => {
		pendingFilter.value.page = pagination.page;
		await getPendingStoresList();
	};

	const changeRejectedPageHandler = async (pagination: UiPaginationMeta) => {
		rejectedFilter.value.page = pagination.page;
		await getRejectedStoresList();
	};

	const handleVerify = async (id: string) => {
		await verifyStoreById(id);
		await getStoresLists();
	};

	const handleReject = async (id: string, reason: string) => {
		await rejectStoreById(id, reason);
		await getStoresLists();
	};

	const handleClarification = async (id: string, reason: string) => {
		await clarificationStoreById(id, reason);
		await getStoresLists();
	};

	const hiddenActionsForRow = (status?: STORE_VERIFICATION_STATUS) => {
		if (!status) return [];
		return [status];
	};

	onMounted(async () => {
		await getStoresLists();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Admin')" back-name-route="admin" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Shops") }}</h1>

		<section class="page__section">
			<div class="page__section-title mb-16">
				<h2 class="page__section-heading">{{ $t("Action required") }}</h2>
				<span v-if="pendingStoresTotal" class="page__section-badge">{{ pendingStoresTotal }}</span>
			</div>
			<table-variant-a>
				<ui-table
					row-key="id"
					:loading="isLoadingPending"
					:headers="pendingHeaders"
					:data="pendingStoresList"
					:meta="pendingPagination"
					table-layout="fixed"
					:isShowPerPageSelect="false"
					@change-pagination="changePendingPageHandler"
				>
					<template #body="{ row, headers }">
						<store-action-row
							:row="row"
							:is-loading-verify="isLoadingVerify[row.id]"
							:is-loading-reject="isLoadingReject[row.id]"
							:is-loading-clarification="isLoadingClarification[row.id]"
							:remaining-cols="headers.length - 1"
							show-description
							@verify="handleVerify"
							@reject="handleReject"
							@clarification="handleClarification"
						/>
					</template>
				</ui-table>
			</table-variant-a>
		</section>

		<section class="page__section">
			<h2 class="global-title-h3 mb-16">{{ $t("Verified and rejected") }}</h2>
			<table-variant-a>
				<ui-table
					row-key="id"
					:loading="isLoadingRejected"
					:headers="rejectedHeaders"
					:data="rejectedStoresList"
					:meta="rejectedPagination"
					table-layout="fixed"
					:isShowPerPageSelect="false"
					@change-pagination="changeRejectedPageHandler"
				>
					<template #body="{ row, headers }">
						<store-action-row
							:row="row"
							:is-loading-verify="isLoadingVerify[row.id]"
							:is-loading-reject="isLoadingReject[row.id]"
							:is-loading-clarification="isLoadingClarification[row.id]"
							:remaining-cols="headers.length - 1"
							:hide-actions="hiddenActionsForRow(row.verification_status)"
							show-rejection-reason
							@verify="handleVerify"
							@reject="handleReject"
							@clarification="handleClarification"
						/>
					</template>
				</ui-table>
			</table-variant-a>
		</section>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		&__section {
			& + & {
				margin-top: 40px;
			}
		}
		&__section-title {
			display: flex;
			align-items: center;
			gap: 12px;
		}
		&__section-heading {
			color: rgba(48, 51, 69, 1);
			font-size: 20px;
			font-weight: 700;
			line-height: 24px;
		}
		&__section-badge {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			padding: 6px 12px;
			border-radius: 490px;
			background: rgba(255, 59, 48, 1);
			color: #fff;
			font-size: 14px;
			font-weight: 500;
			line-height: 14px;
		}
	}
</style>
