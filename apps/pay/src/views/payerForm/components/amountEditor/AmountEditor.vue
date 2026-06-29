<script setup lang="ts">
	import { computed, nextTick, ref } from "vue";
	import { useI18n } from "vue-i18n";
	import { formatDollars } from "@shared/utils/helpers/general.ts";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { useRoute, useRouter } from "vue-router";

	const { t } = useI18n();
	const route = useRoute();
	const router = useRouter();
	const { amount, store } = storeToRefs(usePayerFormStore());

	defineProps<{ size: "lg" | "md" }>();

	const isEdit = ref<boolean>(false);
	const amountDraft = ref<string>("");
	const amountInputRef = ref<HTMLInputElement | null>(null);
	const amountError = ref<string>("");

	const isAmountChanged = computed<boolean>(() => {
		const normalizedAmount = amountDraft.value.replace(",", ".").trim();
		const parsedAmount = parseFloat(normalizedAmount);
		if (!Number.isFinite(parsedAmount) || !Number.isFinite(Number(amount.value))) return false;
		return parsedAmount !== Number(amount.value);
	});

	const minimalPaymentValue = computed<string>(() => store.value?.minimal_payment || "0");

	const startEditAmount = async () => {
		amountError.value = "";
		amountDraft.value = amount.value ? amount.value.toString() : minimalPaymentValue.value;
		isEdit.value = true;
		await nextTick();
		amountInputRef.value?.focus();
		amountInputRef.value?.select();
	};

	const cancelEditAmount = () => {
		amountError.value = "";
		isEdit.value = false;
	};

	const sanitizeAmountDraft = () => {
		let nextValue = amountDraft.value.replace(/,/g, ".");
		nextValue = nextValue.replace(/[^0-9.]/g, "");
		const dotIndex = nextValue.indexOf(".");
		if (dotIndex !== -1) {
			nextValue = `${nextValue.slice(0, dotIndex + 1)}${nextValue.slice(dotIndex + 1).replace(/\./g, "")}`;
		}
		amountDraft.value = nextValue;
	};

	const updateAmountInQuery = async (newAmount: number) => {
		await router.replace({
			query: {
				...route.query,
				amount: newAmount.toString()
			}
		});
	};

	const saveEditAmount = async () => {
		if (!isAmountChanged.value) {
			cancelEditAmount();
			return;
		}
		const normalizedAmount = amountDraft.value.replace(",", ".").trim();
		const parsedAmount = parseFloat(normalizedAmount);
		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
			amountError.value = t("Invalid amount");
			return;
		}
		if (Number.isFinite(minimalPaymentValue.value) && parsedAmount < parseFloat(minimalPaymentValue.value)) {
			amountError.value = t("The minimum deposit amount is {amount}", {
				amount: `$${minimalPaymentValue.value}`
			});
			return;
		}
		amount.value = parsedAmount;
		await updateAmountInQuery(parsedAmount);
		amountError.value = "";
		isEdit.value = false;
	};
</script>

<template>
	<div class="amount-editor" :class="[`amount-editor--${size}`]">
		<template v-if="!isEdit">
			<span class="amount-editor__number">
				{{ formatDollars(amount, "$", "—", 2) }}
			</span>
			<button class="amount-editor__text" type="button" @click="startEditAmount">
				{{ $t("Change") }}
			</button>
		</template>
		<template v-else>
			<input
				ref="amountInputRef"
				v-model="amountDraft"
				type="tel"
				inputmode="decimal"
				class="amount-editor__input"
				@input="sanitizeAmountDraft"
				@keydown.enter.prevent="saveEditAmount"
				@keydown.esc.prevent="cancelEditAmount"
			/>
			<div class="amount-editor__actions">
				<button
					v-if="isAmountChanged"
					class="amount-editor__text amount-editor__text--active"
					type="button"
					@click="saveEditAmount"
				>
					{{ $t("Save") }}
				</button>
				<button class="amount-editor__text" type="button" @click="cancelEditAmount">
					{{ $t("Back") }}
				</button>
			</div>
			<span v-if="amountError" class="amount-editor__error">
				{{ amountError }}
			</span>
		</template>
	</div>
</template>

<style scoped lang="scss">
	.amount-editor {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
		&__number {
			color: $main-text-link-and-price-color;
			font-weight: 700;
		}
		&__text {
			padding: 0;
			border: none;
			background: transparent;
			color: #a4a5b1;
			font-size: 16px;
			font-weight: 400;
			line-height: 19px;
			text-decoration: underline;
			text-decoration-style: dotted;
			text-underline-offset: 3px;
			cursor: pointer;
			&--active {
				color: $main-text-link-and-price-color;
			}
		}
		&__input {
			width: 180px;
			padding: 0;
			border: none;
			outline: none;
			text-align: right;
			color: $main-text-link-and-price-color;
			font-weight: 700;
			background: transparent;
		}
		&__actions {
			display: flex;
			gap: 8px;
		}
		&__error {
			color: #dd4c1e;
			font-size: 12px;
			line-height: 16px;
		}
		&--lg {
			.amount-editor__number,
			.amount-editor__input {
				font-size: 32px;
				line-height: 40px;
				@include mediamax(480) {
					font-size: 24px;
				}
			}
		}
		&--md {
			.amount-editor__number,
			.amount-editor__input {
				font-size: 24px;
				line-height: 32px;
				font-weight: 600;
			}
			.amount-editor__text {
				font-size: 14px;
			}
		}
	}
</style>
