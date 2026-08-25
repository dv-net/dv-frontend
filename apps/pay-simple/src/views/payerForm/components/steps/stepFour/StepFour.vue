<script setup lang="ts">
	import StepFourShared from "@pay-shared/components/payerForm/steps/stepFour/StepFour.vue";
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
	<step-four-shared
		:current-transaction="currentTransaction"
		:addresses="addresses"
		:payer-id="payerId"
		:formatted-fiat-amount="formattedFiatAmount"
	/>
</template>
