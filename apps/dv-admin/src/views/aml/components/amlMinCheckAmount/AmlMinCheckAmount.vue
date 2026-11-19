<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { storeToRefs } from "pinia";
	import { UiButton, UiForm, UiFormItem, UiInput, UiSkeleton } from "@dv.net/ui-kit";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";
	import { useAmlStore } from "@dv-admin/stores/aml";
	import { postApiAmlSettings } from "@dv-admin/utils/services/aml.ts";

	const { isLoading = false } = defineProps<{
		isLoading?: boolean;
	}>();

	const { t } = useI18n();
	const amlStore = useAmlStore();
	const { amlSettings, formAmlScoreTransaction } = storeToRefs(amlStore);

	const formRef = ref<HTMLFormElement | null>(null);
	const form = ref({ amount: "0" });
	const savedAmount = ref("0");
	const isSaving = ref(false);

	const normalizeAmount = (value: number | string | null | undefined): string => {
		if (value === null || value === undefined || value === "") return "0";
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) return "0";
		return String(numeric);
	};

	const providerSlug = computed(
		() => amlSettings.value?.provider_slug || formAmlScoreTransaction.value.provider_slug || ""
	);

	const isUnchanged = computed(() => normalizeAmount(form.value.amount) === savedAmount.value);

	const parsedAmount = computed(() => {
		const raw = String(form.value.amount).trim();
		if (!raw) return null;
		const numeric = Number(raw);
		if (!Number.isFinite(numeric) || numeric < 0) return null;
		return numeric;
	});

	const rules = computed<UiFormRules>(() => ({
		amount: [
			{
				validator: () => parsedAmount.value !== null,
				message: t("Enter an amount of 0 or more")
			}
		]
	}));

	const saveAmount = async () => {
		if (isSaving.value || isUnchanged.value || !providerSlug.value) return;
		if (!formRef.value || !(await formRef.value.validate())) return;
		const nextAmount = parsedAmount.value;
		if (nextAmount === null) return;

		try {
			isSaving.value = true;
			const data = await postApiAmlSettings({
				enabled: Boolean(amlSettings.value?.enabled),
				provider_slug: providerSlug.value,
				min_check_amount_usd: nextAmount
			});
			if (data) amlStore.amlSettings = data;
		} catch (error) {
			console.error(error);
		} finally {
			isSaving.value = false;
		}
	};

	watch(
		() => amlSettings.value?.min_check_amount_usd,
		(value) => {
			const next = normalizeAmount(value);
			if (normalizeAmount(form.value.amount) === savedAmount.value) form.value.amount = next;
			savedAmount.value = next;
		},
		{ immediate: true }
	);
</script>

<template>
	<ui-skeleton v-if="isLoading" :row-height="108" :rows="1" :item-border-radius="24" />
	<section v-else class="min-check">
		<div class="min-check__card">
			<div class="min-check__copy">
				<h2 class="min-check__title">{{ $t("Minimum check amount") }}</h2>
				<p class="min-check__hint">{{ $t("AML min check amount hint") }}</p>
			</div>
			<ui-form
				ref="formRef"
				class="min-check__form"
				:model="form"
				:rules="rules"
				@submit.prevent="saveAmount"
			>
				<ui-form-item name="amount" class="min-check__field">
					<ui-input v-model="form.amount" type="number" size="md" :disabled="isSaving || !providerSlug">
						<template #append>$</template>
					</ui-input>
				</ui-form-item>
				<ui-button
					mode="neutral"
					size="xl"
					native-type="submit"
					left-icon-name="check-circle"
					left-icon-type="400"
					left-icon-size="md"
					:loading="isSaving"
					:disabled="isUnchanged || !providerSlug"
				>
					{{ $t("Save") }}
				</ui-button>
			</ui-form>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.min-check {
		padding: 6px;
		border-radius: 24px;
		background-color: $blue-opacity;

		&__card {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 24px;
			min-height: 82px;
			padding: 24px;
			border-radius: 20px;
			background-color: $white;
			box-shadow: 0 0 8px rgba(0, 0, 0, 0.04);

			@include mediamax(768) {
				flex-direction: column;
				align-items: stretch;
			}
		}

		&__copy {
			display: flex;
			flex-direction: column;
			gap: 4px;
			min-width: 0;
		}

		&__title {
			margin: 0;
			color: $black;
			font-size: 20px;
			font-weight: 500;
			line-height: 24px;
		}

		&__hint {
			margin: 0;
			color: $secondary;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
			white-space: pre-line;
		}

		&__form {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-shrink: 0;

			:deep(.ui-button) {
				height: 44px;
				padding: 0 14px;
				border-radius: 12px;
			}

			@include mediamax(768) {
				flex-direction: column;
				align-items: stretch;
			}
		}

		&__field {
			position: relative;
			width: 120px;
			margin-bottom: 0;

			:deep(.ui-input) {
				padding: 0 12px;
				border-radius: 12px;
			}

			:deep(.ui-input__input) {
				appearance: textfield;

				&::-webkit-outer-spin-button,
				&::-webkit-inner-spin-button {
					margin: 0;
					appearance: none;
				}
			}

			:deep(.ui-input__append) {
				flex-shrink: 0;
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}

			:deep(.ui-form-item__footer) {
				position: absolute;
				top: 100%;
				left: 0;
				min-height: 0;
			}

			@include mediamax(768) {
				width: 100%;
			}
		}
	}
</style>
