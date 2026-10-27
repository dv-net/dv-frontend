<script setup lang="ts">
	import { UiButton, UiForm, UiFormItem, UiInput, UiModal } from "@dv.net/ui-kit";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { computed, nextTick, ref, watch, type ComponentPublicInstance } from "vue";
	import { useI18n } from "vue-i18n";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import { postApiWithdrawExternal } from "@dv-admin/utils/services/hotWallets";
	import type { IHotWalletsItem } from "@dv-admin/utils/types/api/apiGo";
	import {
		convertCurrencyInUsd,
		formatAmountBlockchain,
		formatDollars,
		getCurrentCoin
	} from "@shared/utils/helpers/general";
	import { useNotifications } from "@shared/utils/composables/useNotifications";

	const { wallet } = defineProps<{ wallet: IHotWalletsItem }>();
	const isOpen = defineModel<boolean>({ required: true });

	const { t } = useI18n();
	const { notify } = useNotifications();

	const formRef = ref<HTMLFormElement | null>(null);
	const amountInputRef = ref<ComponentPublicInstance | null>(null);
	const totpInputRef = ref<ComponentPublicInstance | null>(null);
	const isSubmitting = ref(false);
	const form = ref({ addressTo: "", amount: "", totp: "" });

	const nativeInput = (instance: ComponentPublicInstance | null) => {
		const root = instance?.$el;
		return root instanceof HTMLElement ? root.querySelector("input") : null;
	};

	const writeInputValue = (instance: ComponentPublicInstance | null, value: string) => {
		const input = nativeInput(instance);
		if (input && input.value !== value) input.value = value;
	};

	const sanitizeAmount = (value: string) => {
		const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
		const dotIndex = normalized.indexOf(".");
		if (dotIndex === -1) return normalized;
		return `${normalized.slice(0, dotIndex + 1)}${normalized.slice(dotIndex + 1).replace(/\./g, "")}`;
	};

	const sanitizeTotp = (value: string) => value.replace(/\D/g, "").slice(0, 6);

	const amountValue = computed(() => Number(form.value.amount.trim()));
	const amountUsd = computed(() => {
		const balance = Number(wallet.amount);
		if (!Number.isFinite(amountValue.value) || amountValue.value <= 0 || !balance) return null;
		return convertCurrencyInUsd(amountValue.value, Number(wallet.amount_usd) / balance);
	});

	const rules = computed<UiFormRules>(() => ({
		addressTo: [
			{ required: true, message: t("Enter address") },
			{ min: 16, message: t("Minimum 16 characters") },
			{ max: 255, message: t("Maximum 255 characters") }
		],
		amount: [
			{ required: true, message: t("Enter the amount") },
			{
				validator: () =>
					Number.isFinite(amountValue.value) && amountValue.value > 0 && amountValue.value <= Number(wallet.amount),
				message: t("Enter correct amount")
			}
		],
		totp: [
			{ required: true, message: t("Enter the code") },
			{ validator: () => /^\d{6}$/.test(form.value.totp), message: t("6-digit 2FA code") }
		]
	}));

	const resetForm = () => {
		form.value = { addressTo: "", amount: "", totp: "" };
		formRef.value?.resetValidate();
	};

	const withdrawalErrorText = (error: unknown) => {
		const response = (
			error as { response?: { data?: { errors?: { message?: string }[] } } }
		).response;
		const message = response?.data?.errors?.[0]?.message ?? "";
		if (message.includes("invalid destination address")) return t("Invalid destination address");
		if (message.includes("amount must be greater than zero")) return t("Amount must be greater than zero");
		if (message.includes("not enough funds")) return t("Not enough funds for the withdrawal and the network fee");
		if (message.includes("two-factor authentication must be enabled"))
			return t("Enable two-factor authentication for this withdrawal");
		if (message.includes("invalid two-factor")) return t("invalid OTP");
		if (message.includes("another transfer in progress")) return t("This wallet already has a transfer in progress");
		return message || t("Failed to create the withdrawal");
	};

	const submitWithdrawal = async () => {
		const amount = form.value.amount.trim();
		try {
			isSubmitting.value = true;
			const transfer = await postApiWithdrawExternal({
				wallet_address_id: wallet.id,
				address_to: form.value.addressTo.trim(),
				amount,
				totp: form.value.totp
			});
			if (transfer.message) {
				notify(t("Withdrawal result is unknown"), "error");
			} else {
				notify(t("Withdrawal to an external address created"), "success");
			}
			isOpen.value = false;
			resetForm();
		} catch (error: unknown) {
			notify(withdrawalErrorText(error));
		} finally {
			isSubmitting.value = false;
		}
	};

	const selectAllAmount = () => {
		form.value.amount = sanitizeAmount(wallet.amount);
	};

	const handleWithdraw = async () => {
		if (!formRef.value || !(await formRef.value.validate())) return;
		await submitWithdrawal();
	};

	watch(isOpen, (open) => {
		if (!open) resetForm();
	});

	watch(
		() => form.value.amount,
		(value) => {
			const amount = sanitizeAmount(value);
			if (amount !== value) form.value.amount = amount;
			writeInputValue(amountInputRef.value, amount);
			nextTick(() => writeInputValue(amountInputRef.value, form.value.amount));
		}
	);

	watch(
		() => form.value.totp,
		(value) => {
			const digits = sanitizeTotp(value);
			if (digits !== value) form.value.totp = digits;
			const input = nativeInput(totpInputRef.value);
			if (input) {
				input.inputMode = "numeric";
				input.maxLength = 6;
				input.autocomplete = "one-time-code";
				if (input.value !== digits) input.value = digits;
			}
			nextTick(() => writeInputValue(totpInputRef.value, form.value.totp));
		}
	);
</script>

<template>
	<ui-modal v-model="isOpen" width="480" padding="0">
		<div class="dialog">
			<div class="dialog__header">{{ $t("Withdraw to an external address") }}</div>
			<div class="dialog__body">
				<div class="source">
					<blockchain-card :type="wallet.currency_id" />
					<div class="source-price">
						<span>{{ formatDollars(wallet.amount_usd, { countPartMoreOneDollar: 2 }) }}</span>
						<span>•</span>
						<span class="source-price__muted">
							{{ formatAmountBlockchain(wallet.amount, { currencyId: wallet.currency_id }) }}
						</span>
						<span class="source-price__muted">{{ getCurrentCoin(wallet.currency_id) }}</span>
					</div>
				</div>
				<ui-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleWithdraw">
					<ui-form-item name="amount" :label="$t('Transfer amount')">
						<ui-input ref="amountInputRef" v-model="form.amount" size="lg" :placeholder="$t('Enter the amount')">
							<template #append>
								<div class="amount-append">
									<span v-if="amountUsd !== null" class="amount-usd">
										≈ {{ formatDollars(amountUsd, { countPartMoreOneDollar: 2 }) }}
									</span>
									<ui-button
										type="secondary"
										size="lg"
										native-type="button"
										:disabled="!Number(wallet.amount)"
										@click="selectAllAmount"
									>
										{{ $t("All") }}
									</ui-button>
								</div>
							</template>
						</ui-input>
					</ui-form-item>
					<ui-form-item name="addressTo" :label="$t('Where to withdraw')">
						<ui-input v-model="form.addressTo" size="lg" :placeholder="$t('Enter address')" />
					</ui-form-item>
					<ui-form-item name="totp" :label="$t('6-digit 2FA code')">
						<ui-input ref="totpInputRef" v-model="form.totp" size="lg" :placeholder="$t('Enter the code')" />
					</ui-form-item>
					<ui-button
						class="w-full"
						native-type="submit"
						mode="neutral"
						size="xl"
						left-icon-name="send"
						left-icon-type="400"
						:loading="isSubmitting"
					>
						{{ $t("Withdraw") }}
					</ui-button>
				</ui-form>
			</div>
		</div>
	</ui-modal>
</template>

<style scoped lang="scss">
	.dialog {
		display: flex;
		flex-direction: column;

		&__header {
			display: flex;
			align-items: center;
			min-height: 56px;
			padding: 16px;
			border-bottom: 1px solid $grey;
			color: $black;
			font-size: 18px;
			font-weight: 400;
		}

		&__body {
			display: flex;
			flex-direction: column;
			gap: 16px;
			padding: 16px;
		}
	}

	.source {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.source-price {
		display: flex;
		align-items: center;
		gap: 4px;
		color: $black;
		font-size: 14px;
		font-weight: 400;
		line-height: 20px;

		&__muted {
			color: $secondary;
			text-transform: uppercase;
		}
	}

	.amount-append {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.amount-usd {
		color: $secondary;
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
	}
</style>
