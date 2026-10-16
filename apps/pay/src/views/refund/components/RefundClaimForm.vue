<script setup lang="ts">
	import { computed, ref } from "vue";
	import { UiButton, UiIcon, UiInput } from "@dv.net/ui-kit";
	import type { IRefundCabinetItem } from "@pay/utils/types/refund";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery";
	import { useI18n } from "vue-i18n";

	const { item, loading = false } = defineProps<{
		item: IRefundCabinetItem;
		loading?: boolean;
	}>();

	const emit = defineEmits<{
		claim: [destinationAddress: string];
		cancel: [];
	}>();

	const { t } = useI18n();
	const isCompact = useMediaQuery("(max-width: 768px)");
	const destinationAddress = ref("");
	const fillButtonSize = computed(() => (isCompact.value ? "lg" : "xl"));

	const canSubmit = computed(() => destinationAddress.value.trim().length > 0);

	const fillSenderAddress = () => {
		if (!item.from_address) return;
		destinationAddress.value = item.from_address;
	};

	const submit = () => {
		if (!canSubmit.value) return;
		emit("claim", destinationAddress.value.trim());
	};
</script>

<template>
	<form class="claim-form" @submit.prevent="submit">
		<p class="claim-form__hint">
			<ui-icon class="claim-form__hint-icon" name="info" type="400" size="sm" />
			<span>
				{{ $t("A refund to the sender address is sent automatically in about 6 hours") }}.
				{{ $t("A refund to another address is sent after the merchant reviews it") }}
			</span>
		</p>
		<div class="claim-form__address">
			<ui-input
				v-model="destinationAddress"
				class="claim-form__input"
				:label="$t('Destination address')"
				:placeholder="$t('Destination address')"
				size="md"
				name="destination_address"
				autocomplete="off"
			/>
			<ui-button
				v-if="item.from_address"
				class="claim-form__fill"
				native-type="button"
				:size="fillButtonSize"
				type="secondary"
				left-icon-name="arrow-back"
				left-icon-size="sm"
				:disabled="loading"
				@click="fillSenderAddress"
			>
				{{ $t("Return to the sender address") }}
			</ui-button>
		</div>
		<p class="claim-form__warning">
			{{ $t("Exchange refund warning") }}
		</p>
		<div class="claim-form__actions">
			<ui-button
				native-type="submit"
				size="lg-xl"
				mode="neutral"
				left-icon-name="account-balance-wallet"
				left-icon-size="sm"
				:loading="loading"
				:disabled="!canSubmit || loading"
			>
				{{ $t("Submit refund request") }}
			</ui-button>
			<ui-button
				native-type="button"
				size="lg-xl"
				type="secondary"
				left-icon-name="cancel"
				left-icon-size="sm"
				:disabled="loading"
				@click="emit('cancel')"
			>
				{{ t("Cancel") }}
			</ui-button>
		</div>
	</form>
</template>

<style scoped lang="scss">
	.claim-form {
		display: flex;
		flex-direction: column;
		gap: 12px;

		&__hint,
		&__warning {
			margin: 0;
			font-size: 13px;
			line-height: 1.4;
			color: $main-text-grey-color;
		}

		&__hint {
			display: flex;
			align-items: flex-start;
			gap: 8px;
		}

		&__hint-icon {
			flex-shrink: 0;
			margin-top: 1px;
			color: $main-text-grey-color;
		}

		&__address {
			display: flex;
			align-items: center;
			gap: 8px;

			@include mediamax(768) {
				flex-direction: column;
				align-items: stretch;
			}
		}

		&__input {
			flex: 1 1 auto;
			min-width: 0;
			width: 100%;
		}

		&__fill {
			flex-shrink: 0;

			@include mediamax(768) {
				width: 100%;
			}
		}

		&__warning {
			padding: 10px 12px;
			border-radius: 12px;
			background: rgba(255, 158, 0, 0.12);
			color: #8a5a00;
		}

		&__actions {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-end;
			gap: 8px;

			@include mediamax(768) {
				display: grid;
				grid-template-columns: 1fr 1fr;

				:deep(.ui-button) {
					width: 100%;
				}
			}

			@include mediamax(480) {
				grid-template-columns: 1fr;
			}
		}
	}
</style>
