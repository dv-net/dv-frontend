<script setup lang="ts">
	import StepFiveShared from "@pay-shared/components/payerForm/steps/stepFive/StepFive.vue";
	import { usePayerFormStore } from "@pay-simple/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { computed } from "vue";
	import { formatFiatAmount } from "@pay-shared/utils/helpers/fiat";

	const { currentTransaction, addresses, payerId, invoiceCurrency } = storeToRefs(usePayerFormStore());

	const formattedFiatAmount = computed(() =>
		formatFiatAmount(
			currentTransaction.value?.amount_usd,
			currentTransaction.value?.fiat_currency || invoiceCurrency.value
		)
	);
</script>

<template>
	<step-five-shared
		:current-transaction="currentTransaction"
		:addresses="addresses"
		:payer-id="payerId"
		:formatted-fiat-amount="formattedFiatAmount"
	/>
</template>
