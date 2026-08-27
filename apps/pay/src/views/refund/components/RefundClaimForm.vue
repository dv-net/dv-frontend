<script setup lang="ts">
	import { computed, ref } from "vue";
	import { UiButton, UiInput } from "@dv.net/ui-kit";
	import type { IRefundCabinetItem } from "@pay/utils/types/refund";
	import { getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general";
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
	const destinationAddress = ref("");

	const canSubmit = computed(() => destinationAddress.value.trim().length > 0);

	const networkLabel = computed(() => {
		if (item.currency_id) {
			return getCurrentBlockchain(item.currency_id) || item.blockchain;
		}
		return item.blockchain;
	});

	const coinLabel = computed(() => {
		if (item.currency_id) {
			return getCurrentCoin(item.currency_id) || item.currency_id;
		}
		return item.currency_id;
	});

	const submit = () => {
		if (!canSubmit.value) return;
		emit("claim", destinationAddress.value.trim());
	};
</script>

<template>
	<form class="claim-form" @submit.prevent="submit">
		<p class="claim-form__text">
			{{
				$t("Enter the address where we should send the refund. The address must match the blockchain of the deposit")
			}}
		</p>
		<p class="claim-form__meta">
			{{ coinLabel }} · {{ networkLabel }}
		</p>
		<ui-input
			v-model="destinationAddress"
			:label="$t('Destination address')"
			:placeholder="$t('Destination address')"
			size="lg"
			name="destination_address"
			autocomplete="off"
		/>
		<div class="claim-form__actions">
			<ui-button
				native-type="submit"
				size="md"
				mode="neutral"
				left-icon-name="account-balance-wallet"
				left-icon-size="sm"
				:loading="loading"
				:disabled="!canSubmit || loading"
			>
				{{ $t("Submit refund request") }}
			</ui-button>
			<ui-button native-type="button" size="md" type="secondary" :disabled="loading" @click="emit('cancel')">
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

		&__text,
		&__meta {
			font-size: 13px;
			line-height: 1.4;
			color: $main-text-grey-color;
		}

		&__meta {
			font-weight: 500;
			color: $main-color;
		}

		&__actions {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
		}
	}
</style>
