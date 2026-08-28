<script setup lang="ts">
	import { UiButton, UiForm, UiFormItem, UiInput } from "@dv.net/ui-kit";
	import { computed, onMounted, reactive, ref } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { storeToRefs } from "pinia";
	import { useRefundStore } from "@pay/stores/refund";
	import { REFUND_CODE_LENGTH } from "@pay/utils/constants/refund";
	import { parseRefundEntryPartialQuery, parseRefundEntryQuery, buildRefundCabinetRoute, buildRefundEntryPartialRoute } from "@pay/utils/helpers/refundEntry";
	import { EMAIL_REGEX } from "@shared/utils/constants/regex";
	import { loaderShutdown } from "@pay-shared/utils/helpers/general";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";

	const refundStore = useRefundStore();
	const {
		walletId,
		storeId,
		email,
		code,
		entryStep,
		isLoadingLookup,
		isLoadingVerify,
		resendCooldownSec,
		isAuthenticated
	} = storeToRefs(refundStore);
	const { sendCode, verifyCode, prefillFromQuery, prefillPartialFromQuery, syncTokenFromStore } = refundStore;

	const route = useRoute();
	const router = useRouter();
	const { t } = useI18n();

	const lookupFormRef = ref<HTMLFormElement | null>(null);
	const verifyFormRef = ref<HTMLFormElement | null>(null);
	const isPrefilledEntry = ref(false);
	const isAutoSendingCode = ref(false);

	const lookupForm = reactive({
		email: email
	});

	const verifyForm = reactive({
		code: code
	});

	const lookupRules = computed<UiFormRules>(() => ({
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

	const panelSubtitle = computed(() => {
		if (isPrefilledEntry.value) {
			return t("We sent a verification code to your email. Enter it below to access the refund cabinet");
		}
		return t("Enter the email used for this payment. We will send a verification code");
	});

	const goToLookup = async () => {
		const context = getRefundContext();
		if (!context) return;
		entryStep.value = "lookup";
		code.value = "";
		await router.push(buildRefundEntryPartialRoute(context));
	};

	const getRefundContext = () => {
		const fromQuery = parseRefundEntryPartialQuery(route.query);
		if (fromQuery) return fromQuery;
		if (walletId.value && storeId.value) {
			return { wallet_id: walletId.value, store_id: storeId.value };
		}
		return null;
	};

	const syncRefundContextToUrl = async () => {
		const context = getRefundContext();
		if (!context) return;
		await router.replace({
			name: "refund-entry",
			query: { wallet_id: context.wallet_id, store_id: context.store_id }
		});
	};

	const handleLookupBack = async () => {
		const context = getRefundContext();
		if (!context?.wallet_id) return;
		await router.push({ name: "payer-wallet", params: { payerId: context.wallet_id } });
	};

	const handleSendCode = async () => {
		if (!lookupFormRef.value || !(await lookupFormRef.value.validate())) return;
		try {
			await sendCode();
			await syncRefundContextToUrl();
		} catch (error) {
			console.error(error);
		}
	};

	const handleVerify = async () => {
		if (!verifyFormRef.value || !(await verifyFormRef.value.validate())) return;
		try {
			const context = getRefundContext();
			await verifyCode();
			await router.push(context ? buildRefundCabinetRoute(context) : { name: "refund-cabinet" });
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

	const initPrefilledEntry = async () => {
		const fullPayload = parseRefundEntryQuery(route.query);
		if (fullPayload) {
			isPrefilledEntry.value = true;
			prefillFromQuery(fullPayload);
			if (isAuthenticated.value) return;
			isAutoSendingCode.value = true;
			try {
				await sendCode();
				await syncRefundContextToUrl();
			} catch (error) {
				console.error(error);
				isPrefilledEntry.value = false;
				entryStep.value = "lookup";
			} finally {
				isAutoSendingCode.value = false;
			}
			return;
		}

		const partialPayload = parseRefundEntryPartialQuery(route.query);
		if (!partialPayload) return;

		prefillPartialFromQuery(partialPayload);
	};

	onMounted(async () => {
		loaderShutdown();
		await initPrefilledEntry();
		if (!getRefundContext()) {
			void router.back();
			return;
		}
		syncTokenFromStore();
		if (isAuthenticated.value) {
			const context = getRefundContext();
			await router.replace(context ? buildRefundCabinetRoute(context) : { name: "refund-cabinet" });
			return;
		}
	});
</script>

<template>
	<div class="refund-entry">
		<section class="panel">
			<header class="panel__header">
				<h1 class="panel__title">{{ $t("Refund blocked deposits") }}</h1>
				<p class="panel__subtitle">{{ panelSubtitle }}</p>
			</header>

			<div class="panel-card">
				<div v-if="isAutoSendingCode" class="form form--loading">
					<p class="form__hint">{{ $t("Sending verification code") }}</p>
				</div>

				<ui-form
					v-else-if="entryStep === 'lookup'"
					ref="lookupFormRef"
					class="form"
					:rules="lookupRules"
					:model="lookupForm"
					@submit.prevent="handleSendCode"
				>
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
					<div class="form__actions">
						<ui-button
							class="form__action-back"
							native-type="button"
							size="xl"
							type="outline"
							mode="neutral"
							left-icon-name="arrow-back"
							@click="handleLookupBack"
						>
							{{ $t("Back to payment") }}
						</ui-button>
						<ui-button
							class="form__action-primary"
							native-type="submit"
							size="xl"
							mode="neutral"
							left-icon-name="mail"
							left-icon-size="md"
							:loading="isLoadingLookup"
						>
							{{ $t("Send verification code") }}
						</ui-button>
					</div>
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
							class="form__action-back"
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
							class="form__action-secondary"
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

		&--loading {
			min-height: 120px;
			justify-content: center;
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

				.form__action-primary,
				.form__action-secondary {
					order: 1;
				}

				.form__action-back {
					order: 2;
				}
			}
		}

		&__submit {
			width: 100%;
		}
	}
</style>
