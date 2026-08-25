<script setup lang="ts">
	import StepFourShared from "@pay-shared/components/payerForm/steps/stepFour/StepFour.vue";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { computed } from "vue";
	import { formatDollars } from "@shared/utils/helpers/general.ts";

	const { currentTransaction, addresses, payerId } = storeToRefs(usePayerFormStore());

	const formattedFiatAmount = computed(() =>
		formatDollars(currentTransaction.value?.amount_usd, { countPartMoreOneDollar: 2 })
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
