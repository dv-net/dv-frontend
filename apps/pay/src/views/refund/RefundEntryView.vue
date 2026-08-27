<script setup lang="ts">
	import { UiButton, UiForm, UiFormItem, UiInput } from "@dv.net/ui-kit";
	import { computed, onMounted, reactive, ref } from "vue";
	import { useRouter } from "vue-router";
	import { storeToRefs } from "pinia";
	import { useRefundStore } from "@pay/stores/refund";
	import { REFUND_CODE_LENGTH } from "@pay/utils/constants/refund";
	import { EMAIL_REGEX, UUID_REGEX } from "@shared/utils/constants/regex";
	import { loaderShutdown } from "@pay-shared/utils/helpers/general";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";

	const refundStore = useRefundStore();
	const { walletId, storeId, email, code, entryStep, isLoadingLookup, isLoadingVerify, resendCooldownSec, isAuthenticated } =
		storeToRefs(refundStore);
	const { sendCode, verifyCode } = refundStore;

	const router = useRouter();
	const { t } = useI18n();

	const lookupFormRef = ref<HTMLFormElement | null>(null);
	const verifyFormRef = ref<HTMLFormElement | null>(null);

	const lookupForm = reactive({
		wallet_id: walletId,
		store_id: storeId,
		email: email
	});

	const verifyForm = reactive({
		code: code
	});

	const lookupRules = computed<UiFormRules>(() => ({
		wallet_id: [
			{ required: true, message: t("Enter wallet UUID") },
			{
				validator: () => UUID_REGEX.test(lookupForm.wallet_id.trim()),
				message: t("Must be a valid UUID")
			}
		],
		store_id: [
			{ required: true, message: t("Enter store UUID") },
			{
				validator: () => UUID_REGEX.test(lookupForm.store_id.trim()),
				message: t("Must be a valid UUID")
			}
		],
		email: [
			{ required: true, message: t("Enter email") },
			{ validator: () => EMAIL_REGEX.test(lookupForm.email), message: t("Email must be valid") }
		]
	}));

	const verifyRules = computed<UiFormRules>(() => ({
		code: [
			{ required: true, message: t("Enter verification code") },
			{
				validator: () => verifyForm.code.trim().length === REFUND_CODE_LENGTH,
				message: t("Code must be 6 characters")
			}
		]
	}));

	const goToLookup = () => {
		entryStep.value = "lookup";
		code.value = "";
	};

	const handleSendCode = async () => {
		if (!lookupFormRef.value || !(await lookupFormRef.value.validate())) return;
		try {
			await sendCode();
		} catch (error) {
			console.error(error);
		}
	};

	const handleVerify = async () => {
		if (!verifyFormRef.value || !(await verifyFormRef.value.validate())) return;
		try {
			await verifyCode();
			await router.push({ name: "refund-cabinet" });
		} catch (error) {
			console.error(error);
		}
	};

	const handleResend = async () => {
		if (resendCooldownSec.value > 0) return;
		try {
			await sendCode();
		} catch (error) {
			console.error(error);
		}
	};

	onMounted(async () => {
		loaderShutdown();
		if (isAuthenticated.value) {
			await router.replace({ name: "refund-cabinet" });
		}
	});
</script>

<template>
	<div class="refund-entry">
		<section class="panel">
			<header class="panel__header">
				<h1 class="panel__title">{{ $t("Refund blocked deposits") }}</h1>
				<p class="panel__subtitle">
					{{
						$t(
							"Enter the wallet and store details used for the payment. We will send a verification code to the confirmed email"
						)
					}}
				</p>
			</header>

			<div class="panel-card">
				<ui-form
					v-if="entryStep === 'lookup'"
					ref="lookupFormRef"
					class="form"
					:rules="lookupRules"
					:model="lookupForm"
					@submit.prevent="handleSendCode"
				>
					<div class="form__row">
						<ui-form-item name="wallet_id" :label="$t('Wallet UUID')">
							<ui-input
								v-model="lookupForm.wallet_id"
								:placeholder="$t('Enter wallet UUID')"
								size="md"
								name="wallet_id"
								autocomplete="off"
							/>
						</ui-form-item>
						<ui-form-item name="store_id" :label="$t('Store UUID')">
							<ui-input
								v-model="lookupForm.store_id"
								:placeholder="$t('Enter store UUID')"
								size="md"
								name="store_id"
								autocomplete="off"
							/>
						</ui-form-item>
					</div>
					<ui-form-item name="email" :label="$t('Email')">
						<ui-input
							v-model="lookupForm.email"
							:placeholder="$t('Enter email')"
							size="md"
							type="email"
							name="email"
							autocomplete="email"
						/>
					</ui-form-item>
					<ui-button
						class="form__submit"
						native-type="submit"
						size="xl"
						mode="neutral"
						left-icon-name="mail"
						left-icon-size="md"
						:loading="isLoadingLookup"
					>
						{{ $t("Send verification code") }}
					</ui-button>
				</ui-form>

				<ui-form
					v-else
					ref="verifyFormRef"
					class="form"
					:rules="verifyRules"
					:model="verifyForm"
					@submit.prevent="handleVerify"
				>
					<p class="form__hint">
						{{ $t("Enter the 6-character code from your email") }}
					</p>
					<ui-form-item name="code" :label="$t('Verification code')">
						<ui-input
							v-model="verifyForm.code"
							:placeholder="$t('Verification code')"
							size="md"
							name="code"
							autocomplete="one-time-code"
							:maxlength="REFUND_CODE_LENGTH"
						/>
					</ui-form-item>
					<ui-button
						class="form__submit"
						native-type="submit"
						size="xl"
						mode="neutral"
						left-icon-name="check-circle"
						:loading="isLoadingVerify"
					>
						{{ $t("Continue") }}
					</ui-button>
					<div class="form__actions">
						<ui-button
							native-type="button"
							size="xl"
							type="outline"
							mode="neutral"
							left-icon-name="arrow-back"
							@click="goToLookup"
						>
							{{ $t("Back") }}
						</ui-button>
						<ui-button
							native-type="button"
							size="xl"
							type="secondary"
							left-icon-name="autorenew 1"
							:disabled="resendCooldownSec > 0 || isLoadingLookup"
							:loading="isLoadingLookup"
							@click="handleResend"
						>
							<template v-if="resendCooldownSec > 0">
								{{ $t("Resend code in") }} {{ resendCooldownSec }}{{ $t("s") }}
							</template>
							<template v-else>
								{{ $t("Resend code") }}
							</template>
						</ui-button>
					</div>
				</ui-form>
			</div>
		</section>
	</div>
</template>

<style scoped lang="scss">
	.refund-entry {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		align-self: flex-start;
	}

	.panel {
		width: 100%;
		max-width: 720px;
		height: fit-content;
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
	}

	.panel-card {
		display: flex;
		flex-direction: column;
		padding: 20px;
		border-radius: 20px;
		background: $form-background;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
		@include mediamax(480) {
			padding: 16px;
		}
	}

	.form {
		display: flex;
		flex-direction: column;

		&__row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: 12px;
			@include mediamax(480) {
				grid-template-columns: 1fr;
			}
		}

		&__hint {
			margin: 0;
			color: $main-text-grey-color;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
		}

		&__actions {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 8px;
			margin-top: 12px;

			:deep(.ui-button) {
				width: 100%;
			}

			@include mediamax(480) {
				grid-template-columns: 1fr;
			}
		}

		&__submit {
			width: 100%;
		}
	}
</style>
