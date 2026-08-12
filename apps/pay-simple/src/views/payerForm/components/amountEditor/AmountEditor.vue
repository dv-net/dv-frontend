<script setup lang="ts">
	import { computed } from "vue";
	import { storeToRefs } from "pinia";
	import { usePayerFormStore } from "@pay-simple/stores/payerForm";
	import { formatFiatAmount } from "@pay-simple/utils/helpers/fiat";

	defineProps<{ size: "lg" | "md" }>();

	const { amount, store, invoice } = storeToRefs(usePayerFormStore());

	const fiatCurrency = computed<string>(() => invoice.value?.currency || store.value?.currency_id || "USD");
</script>

<template>
	<span class="amount-editor__number" :class="[`amount-editor--${size}`]">
		{{ formatFiatAmount(amount, fiatCurrency) }}
	</span>
</template>

<style scoped lang="scss">
	.amount-editor {
		&__number {
			color: $main-text-link-and-price-color;
			font-weight: 700;
		}
		&--lg {
			.amount-editor__number {
				font-size: 32px;
				line-height: 40px;
				@include mediamax(480) {
					font-size: 24px;
				}
			}
		}
		&--md {
			.amount-editor__number {
				font-size: 24px;
				line-height: 32px;
				font-weight: 600;
			}
		}
	}
</style>
