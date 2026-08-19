<script setup lang="ts">
	import { computed, ref } from "vue";
	import { useI18n } from "vue-i18n";
	import { UiButton, UiDropdown, UiIcon, UiInput, UiLink } from "@dv.net/ui-kit";
	import StatusBadge from "@dv-admin/components/ui/statusBadge/StatusBadge.vue";
	import {
		STORE_VERIFICATION_STATUS,
		STORE_VERIFICATION_STATUS_LABELS,
		STORE_VERIFICATION_STATUS_MODES
	} from "@dv-admin/utils/constants/root";
	import type { IStoreValidationItemResponse } from "@dv-admin/utils/types/api/apiGo";

	type ReasonAction = "reject" | "clarification";

	const props = withDefaults(
		defineProps<{
			row: IStoreValidationItemResponse;
			remainingCols?: number;
			isLoadingVerify?: boolean;
			isLoadingReject?: boolean;
			isLoadingClarification?: boolean;
			showDescription?: boolean;
			showRejectionReason?: boolean;
			hideActions?: STORE_VERIFICATION_STATUS[];
		}>(),
		{
			remainingCols: 3,
			isLoadingVerify: false,
			isLoadingReject: false,
			isLoadingClarification: false,
			showDescription: false,
			showRejectionReason: false,
			hideActions: () => []
		}
	);

	const emit = defineEmits<{
		verify: [id: string];
		reject: [id: string, reason: string];
		clarification: [id: string, reason: string];
	}>();

	const { t } = useI18n();

	const reasonAction = ref<ReasonAction | null>(null);
	const reasonText = ref<string>("");
	const isShowDropdown = ref(false);

	const isReasonMode = computed(() => reasonAction.value !== null);

	const reasonPlaceholder = computed(() =>
		reasonAction.value === "clarification" ? t("Enter clarification reason...") : t("Enter rejection reason...")
	);

	const isSubmitting = computed(() => props.isLoadingReject || props.isLoadingClarification);

	const startReasonAction = (action: ReasonAction) => {
		isShowDropdown.value = false;
		reasonAction.value = action;
		reasonText.value = "";
	};

	const cancelReasonAction = () => {
		reasonAction.value = null;
		reasonText.value = "";
	};

	const confirmReasonAction = () => {
		if (!reasonAction.value || !reasonText.value.trim()) return;
		const reason = reasonText.value.trim();
		if (reasonAction.value === "clarification") {
			emit("clarification", props.row.id, reason);
		} else {
			emit("reject", props.row.id, reason);
		}
		cancelReasonAction();
	};

	const handleVerify = () => {
		isShowDropdown.value = false;
		emit("verify", props.row.id);
	};

	const showVerify = computed(
		() => !props.hideActions.includes(STORE_VERIFICATION_STATUS.SUCCESS)
	);
	const showClarification = computed(
		() => !props.hideActions.includes(STORE_VERIFICATION_STATUS.NEEDS_CLARIFICATION)
	);
	const showReject = computed(
		() => !props.hideActions.includes(STORE_VERIFICATION_STATUS.REJECTED)
	);

	defineExpose({ cancelReasonAction, isReasonMode });
</script>

<template>
	<td class="ui-table__body-cell">
		<div class="ui-table__body-cell-inner">
			<div class="store-cell">
				<span class="store-cell__name">{{ row.name }}</span>
				<ui-link v-if="row.site" :href="row.site" target="_blank">
					{{ row.site }}
				</ui-link>
				<p v-if="showDescription && row.description" class="store-cell__description">
					{{ row.description }}
				</p>
			</div>
		</div>
	</td>
	<td class="ui-table__body-cell" :colspan="remainingCols">
		<div class="ui-table__body-cell-inner row-rest">
			<Transition name="reject-panel" mode="out-in">
				<div v-if="isReasonMode" key="reason" class="reject-inline__form">
					<ui-input
						v-model="reasonText"
						class="reject-inline__input"
						:placeholder="reasonPlaceholder"
						@keyup.enter="confirmReasonAction"
					/>
					<div class="reject-inline__actions">
						<ui-button
							type="secondary"
							size="xl"
							left-icon-name="check-circle"
							left-icon-type="filled"
							left-icon-color="rgba(48, 51, 69, 1)"
							:loading="isSubmitting"
							:disabled="!reasonText.trim()"
							@click="confirmReasonAction"
						>
							{{ $t("Confirm") }}
						</ui-button>
						<ui-button
							type="secondary"
							size="xl"
							left-icon-name="cancel"
							left-icon-type="filled"
							left-icon-color="rgba(48, 51, 69, 1)"
							:disabled="isSubmitting"
							@click="cancelReasonAction"
						>
							{{ $t("Cancel.noun") }}
						</ui-button>
					</div>
				</div>
				<div v-else key="content" class="row-rest__content">
					<div class="row-rest__cell row-rest__cell--email">
						<div class="user-cell">
							<span class="user-cell__email">{{ row.owner_email || "—" }}</span>
							<blockquote v-if="row.verification_comment" class="user-quote">
								<p class="user-quote__text">{{ row.verification_comment }}</p>
							</blockquote>
						</div>
					</div>
					<div class="row-rest__cell">
						<div v-if="row.verification_status" class="verification-cell">
							<status-badge
								:label="$t(STORE_VERIFICATION_STATUS_LABELS[row.verification_status])"
								:mode="STORE_VERIFICATION_STATUS_MODES[row.verification_status]"
							/>
							<blockquote
								v-if="showRejectionReason && row.rejection_reason"
								class="verification-cell__reason"
							>
								{{ row.rejection_reason }}
							</blockquote>
						</div>
					</div>
					<div class="row-rest__cell row-rest__cell--actions">
						<div class="action-slot">
							<ui-dropdown
								trigger="click"
								popper-class="global-dropdown__wallets"
								placement="bottom-end"
								v-model="isShowDropdown"
							>
								<template #reference>
									<ui-button
										type="secondary"
										size="xl"
										left-icon-name="tune"
									>
										{{ $t("Actions") }}
									</ui-button>
								</template>
								<template #default>
									<div class="global-dropdown__wallets-list">
										<div
											v-if="showVerify"
											class="global-dropdown__wallets-item"
											@click="handleVerify"
										>
											<ui-icon
												name="check-circle"
												type="filled"
												color="#26A212"
												size="md"
											/>
											<span>{{ $t("Verify store") }}</span>
										</div>
										<div
											v-if="showClarification"
											class="global-dropdown__wallets-item"
											@click="startReasonAction('clarification')"
										>
											<ui-icon
												name="help"
												type="filled"
												color="#E6A100"
												size="md"
											/>
											<span>{{ $t("Request clarification") }}</span>
										</div>
										<div
											v-if="showReject"
											class="global-dropdown__wallets-item"
											@click="startReasonAction('reject')"
										>
											<ui-icon
												name="cancel"
												type="filled"
												color="rgba(255, 59, 48, 1)"
												size="md"
											/>
											<span>{{ $t("Reject store") }}</span>
										</div>
									</div>
								</template>
							</ui-dropdown>
						</div>
					</div>
				</div>
			</Transition>
		</div>
	</td>
</template>

<style scoped lang="scss">
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
		&__description {
			margin: 0;
			padding: 8px 10px;
			border-radius: 8px;
			background: rgba(247, 249, 251, 1);
			color: rgba(107, 109, 128, 1);
			font-size: 13px;
			font-weight: 400;
			line-height: 18px;
			word-break: break-word;
		}
	}
	.verification-cell {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		min-width: 0;

		&__reason {
			margin: 0;
			padding: 4px 8px;
			border-radius: 6px;
			border-left: 2px solid rgba(107, 109, 128, 0.35);
			background: rgba(247, 249, 251, 1);
			color: rgba(107, 109, 128, 1);
			font-size: 12px;
			font-weight: 400;
			font-style: italic;
			line-height: 16px;
			word-break: break-word;
		}
	}
	.user-cell {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
		&__email {
			overflow-wrap: anywhere;
			word-break: break-word;
		}
	}
	.user-quote {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 10px 12px;
		border-radius: 8px;
		border-left: 3px solid rgba(107, 109, 128, 0.35);
		background: rgba(247, 249, 251, 1);
		box-sizing: border-box;
		&__text {
			margin: 0;
			color: rgba(107, 109, 128, 1);
			font-size: 13px;
			font-weight: 400;
			font-style: italic;
			line-height: 18px;
			word-break: break-word;
		}
	}
	.row-rest {
		width: 100%;
		min-width: 0;
		min-height: 44px;
		overflow: hidden;
		&__content {
			display: flex;
			align-items: center;
			gap: 48px;
			width: 100%;
			min-width: 0;
		}
		&__cell {
			min-width: 0;
			box-sizing: border-box;
			&:nth-child(1),
			&:nth-child(2) {
				flex: 0 0 250px;
				width: 250px;
				max-width: 250px;
			}
			&--email {
				overflow-wrap: anywhere;
				word-break: break-word;
			}
			&--actions {
				flex: 1 1 auto;
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
