<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import { storeToRefs } from "pinia";
	import { useI18n } from "vue-i18n";
	import { UiButton, UiInput, UiLink, UiTable } from "@dv.net/ui-kit";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import StatusBadge from "@dv-admin/components/ui/statusBadge/StatusBadge.vue";
	import { useRootStore } from "@dv-admin/stores/root";
	import {
		STORE_ACTION_FEEDBACK_MS,
		STORE_VERIFICATION_STATUS,
		STORE_VERIFICATION_STATUS_LABELS,
		STORE_VERIFICATION_STATUS_MODES
	} from "@dv-admin/utils/constants/root";
	import type { IStoreValidationItemResponse } from "@dv-admin/utils/types/api/apiGo";
	import TableVariantA from "@dv-admin/components/ui/tableVariantA/TableVariantA.vue";

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
		isLoadingReject
	} = storeToRefs(useRootStore());
	const { getStoresLists, getPendingStoresList, getRejectedStoresList, verifyStoreById, rejectStoreById } =
		useRootStore();

	const rejectingStoreId = ref<string | null>(null);
	const rejectReason = ref<string>("");
	const actionFeedback = ref<{ id: string; status: STORE_VERIFICATION_STATUS } | null>(null);

	const pendingHeaders = computed<UiTableHeader[]>(() => [
		{ name: "name", label: t("Name"), width: "250" },
		{ name: "owner_email", label: t("User"), width: "250" },
		{ name: "verification_status", label: t("Verification status"), width: "250" },
		{ name: "actions" }
	]);

	const rejectedHeaders = computed<UiTableHeader[]>(() => [
		{ name: "name", label: t("Name") },
		{ name: "owner_email", label: t("User") },
		{ name: "verification_status", label: t("Verification status") }
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

	const startReject = (row: IStoreValidationItemResponse) => {
		rejectingStoreId.value = row.id;
		rejectReason.value = "";
	};

	const cancelReject = () => {
		rejectingStoreId.value = null;
		rejectReason.value = "";
	};

	const showActionFeedback = async (id: string, status: STORE_VERIFICATION_STATUS) => {
		const store = pendingStoresList.value.find((item) => item.id === id);
		if (store) store.verification_status = status;
		actionFeedback.value = { id, status };
		await new Promise((resolve) => setTimeout(resolve, STORE_ACTION_FEEDBACK_MS));
		actionFeedback.value = null;
		await getStoresLists();
	};

	const handleVerify = async (id: string) => {
		await verifyStoreById(id);
		await showActionFeedback(id, STORE_VERIFICATION_STATUS.SUCCESS);
	};

	const confirmReject = async () => {
		if (!rejectingStoreId.value || !rejectReason.value.trim()) return;
		const id = rejectingStoreId.value;
		await rejectStoreById(id, rejectReason.value.trim());
		cancelReject();
		await showActionFeedback(id, STORE_VERIFICATION_STATUS.REJECTED);
	};

	onMounted(async () => {
		await getStoresLists();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Admin')" back-name-route="admin" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Projects") }}</h1>

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
						<td class="ui-table__body-cell">
							<div class="ui-table__body-cell-inner">
								<div class="store-cell">
									<span class="store-cell__name">{{ row.name }}</span>
									<ui-link v-if="row.site" :href="row.site" target="_blank">
										{{ row.site }}
									</ui-link>
								</div>
							</div>
						</td>
						<td class="ui-table__body-cell" :colspan="headers.length - 1">
							<div class="ui-table__body-cell-inner row-rest">
								<Transition name="reject-panel" mode="out-in">
									<div v-if="rejectingStoreId === row.id" key="reject" class="reject-inline__form">
										<ui-input
											v-model="rejectReason"
											class="reject-inline__input"
											:placeholder="$t('Enter rejection reason...')"
											@keyup.enter="confirmReject"
										/>
										<div class="reject-inline__actions">
											<ui-button
												type="secondary"
												size="xl"
												left-icon-name="check-circle"
												left-icon-type="filled"
												left-icon-color="rgba(48, 51, 69, 1)"
												:loading="isLoadingReject[row.id]"
												:disabled="!rejectReason.trim()"
												@click="confirmReject"
											>
												{{ $t("Confirm") }}
											</ui-button>
											<ui-button
												type="secondary"
												size="xl"
												left-icon-name="cancel"
												left-icon-type="filled"
												left-icon-color="rgba(48, 51, 69, 1)"
												:disabled="isLoadingReject[row.id]"
												@click="cancelReject"
											>
												{{ $t("Cancel.noun") }}
											</ui-button>
										</div>
									</div>
									<div v-else key="content" class="row-rest__content">
										<div class="row-rest__cell">
											{{ row.owner_email || "—" }}
										</div>
										<div class="row-rest__cell">
											<status-badge
												v-if="row.verification_status"
												:label="$t(STORE_VERIFICATION_STATUS_LABELS[row.verification_status])"
												:mode="STORE_VERIFICATION_STATUS_MODES[row.verification_status]"
											/>
										</div>
										<div class="row-rest__cell row-rest__cell--actions">
											<div class="action-slot">
												<div v-if="actionFeedback?.id === row.id" class="action-feedback">
													{{
														actionFeedback.status === STORE_VERIFICATION_STATUS.SUCCESS
															? $t("Store verified successfully")
															: $t("Store rejected successfully")
													}}
												</div>
												<div v-else class="action-slot__buttons">
													<ui-button
														type="secondary"
														size="xl"
														left-icon-name="check-circle"
														left-icon-type="filled"
														left-icon-color="#26A212"
														:loading="isLoadingVerify[row.id]"
														@click="handleVerify(row.id)"
													>
														{{ $t("Verify store") }}
													</ui-button>
													<ui-button
														type="secondary"
														left-icon-name="cancel"
														left-icon-color="rgba(255, 59, 48, 1)"
														left-icon-type="filled"
														size="xl"
														@click="startReject(row)"
													>
														{{ $t("Reject store") }}
													</ui-button>
												</div>
											</div>
										</div>
									</div>
								</Transition>
							</div>
						</td>
					</template>
				</ui-table>
			</table-variant-a>
		</section>

		<section class="page__section">
			<h2 class="global-title-h3 mb-16">{{ $t("All") }}</h2>
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
					<template #body-cell-name="{ row }">
						<div class="store-cell">
							<span class="store-cell__name">{{ row.name }}</span>
							<ui-link v-if="row.site" :href="row.site" target="_blank">
								{{ row.site }}
							</ui-link>
						</div>
					</template>
					<template #body-cell-owner_email="{ row }">
						{{ row.owner_email || "—" }}
					</template>
					<template #body-cell-verification_status="{ row }">
						<status-badge
							v-if="row.verification_status"
							:label="$t(STORE_VERIFICATION_STATUS_LABELS[row.verification_status])"
							:mode="STORE_VERIFICATION_STATUS_MODES[row.verification_status]"
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
		.store-cell {
			display: flex;
			flex-direction: column;
			gap: 4px;
			&__name {
				font-weight: 500;
				word-break: break-word;
				color: rgba(48, 51, 69, 1);
				font-size: 14px;
				line-height: 20px;
			}
		}
		.row-rest {
			width: 100%;
			min-height: 44px;
			overflow: hidden;
			&__content {
				display: grid;
				grid-template-columns: 250px 250px minmax(0, 1fr);
				align-items: center;
				width: 100%;
			}
			&__cell {
				min-width: 0;
				&--actions {
					display: flex;
					justify-content: flex-end;
				}
			}
		}
		.action-slot {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			width: 100%;
			min-height: 44px;
			&__buttons {
				display: flex;
				align-items: center;
				justify-content: flex-end;
				gap: 8px;
			}
		}
		.action-feedback {
			display: inline-flex;
			align-items: center;
			height: 44px;
			padding: 0 14px;
			border-radius: 12px;
			box-sizing: border-box;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			color: #1a7a3c;
			background: linear-gradient(180deg, #f0fbf4 0%, #e6faed 100%);
			box-shadow: inset 0 0 0 1px rgba(31, 150, 73, 0.16);
			animation: action-feedback-in 0.2s ease;
		}
		@keyframes action-feedback-in {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
		.reject-inline {
			&__form {
				display: flex;
				align-items: center;
				width: 100%;
				min-height: 44px;
				gap: 8px;
			}
			&__input {
				flex: 1;
				min-width: 0;
			}
			&__actions {
				display: flex;
				align-items: center;
				gap: 4px;
				flex-shrink: 0;
			}
		}
	}

	.reject-panel-enter-active,
	.reject-panel-leave-active {
		transition:
			opacity 0.22s ease,
			transform 0.22s ease;
	}
	.reject-panel-enter-from,
	.reject-panel-leave-to {
		opacity: 0;
		transform: translateY(4px) scale(0.98);
	}
</style>
