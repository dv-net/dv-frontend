<script setup lang="ts">
	import { computed, ref } from "vue";
	import { storeToRefs } from "pinia";
	import { UiButton } from "@dv.net/ui-kit";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import {
		STORE_ACTION_FEEDBACK_MS,
		STORE_VERIFICATION_STATUS
	} from "@dv-admin/utils/constants/root";

	const props = defineProps<{
		storeId: string;
	}>();

	const { currentProject, isLoadingResendVerify } = storeToRefs(useProjectsStore());
	const { postResendVerifyStore, refreshAfterResendVerify } = useProjectsStore();

	const isResendSuccess = ref(false);

	const isRejected = computed(
		() => currentProject.value?.verification_status === STORE_VERIFICATION_STATUS.REJECTED
	);

	const rejectionReason = computed(() => currentProject.value?.rejection_reason || "");

	const isVisible = computed(() => isRejected.value || isResendSuccess.value);

	const handleResend = async () => {
		await postResendVerifyStore(props.storeId);
		isResendSuccess.value = true;
		await new Promise((resolve) => setTimeout(resolve, STORE_ACTION_FEEDBACK_MS));
		await refreshAfterResendVerify(props.storeId);
		isResendSuccess.value = false;
	};
</script>

<template>
	<div
		v-if="isVisible"
		class="verification-alert"
		:class="{ 'verification-alert--success': isResendSuccess }"
	>
		<template v-if="isResendSuccess">
			<div class="verification-alert__content">
				<p class="verification-alert__title">{{ $t("Verification request has been resent") }}</p>
			</div>
		</template>
		<template v-else>
			<div class="verification-alert__content">
				<div class="verification-alert__header">
					<p class="verification-alert__title">{{ $t("Store verification was rejected") }}</p>
				</div>
				<p v-if="rejectionReason" class="verification-alert__reason">{{ rejectionReason }}</p>
				<p class="verification-alert__hint">
					{{ $t("Fix the issues and resend the store for verification") }}
				</p>
			</div>
			<ui-button
				mode="neutral"
				leftIconName="autorenew 1"
				:loading="isLoadingResendVerify[storeId]"
				@click="handleResend"
			>
				{{ $t("Resend verification") }}
			</ui-button>
		</template>
	</div>
</template>

<style scoped lang="scss">
	.verification-alert {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		padding: 20px 24px;
		border-radius: 16px;
		background: linear-gradient(180deg, #fff8f7 0%, #ffefed 100%);
		box-shadow: inset 0 0 0 1px rgba(255, 59, 48, 0.12);
		transition:
			background 0.25s ease,
			box-shadow 0.25s ease;

		&--success {
			justify-content: flex-start;
			background: linear-gradient(180deg, #f0fbf4 0%, #e6faed 100%);
			box-shadow: inset 0 0 0 1px rgba(31, 150, 73, 0.16);

			.verification-alert__title {
				color: #1a7a3c;
			}
		}

		&__content {
			display: flex;
			flex-direction: column;
			gap: 8px;
			min-width: 0;
		}

		&__header {
			display: flex;
			align-items: center;
			gap: 12px;
			flex-wrap: wrap;
		}

		&__title {
			color: rgba(48, 51, 69, 1);
			font-size: 16px;
			font-weight: 600;
			line-height: 20px;
		}

		&__reason {
			color: #c0392b;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			word-break: break-word;
		}

		&__hint {
			color: rgba(107, 109, 128, 1);
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
		}

		@media (max-width: 768px) {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
