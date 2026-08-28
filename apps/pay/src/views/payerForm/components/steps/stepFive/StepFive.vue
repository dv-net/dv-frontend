<script setup lang="ts">
	import StepFiveShared from "@pay-shared/components/payerForm/steps/stepFive/StepFive.vue";
	import StepFiveAmlChecking from "@pay/views/payerForm/components/steps/stepFive/StepFiveAmlChecking.vue";
	import StepFiveAmlBlocked from "@pay/views/payerForm/components/steps/stepFive/StepFiveAmlBlocked.vue";
	import StepFiveAmlFailed from "@pay/views/payerForm/components/steps/stepFive/StepFiveAmlFailed.vue";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { computed } from "vue";
	import { formatDollars } from "@shared/utils/helpers/general.ts";
	import { AML_PAYMENT_PHASE } from "@pay/utils/constants/aml";

	const { currentTransaction, addresses, payerId, store, amlPaymentPhase } = storeToRefs(usePayerFormStore());

	const formattedFiatAmount = computed(() =>
		formatDollars(currentTransaction.value?.amount_usd, { countPartMoreOneDollar: 2 })
	);
</script>

<template>
	<step-five-aml-checking
		v-if="amlPaymentPhase === AML_PAYMENT_PHASE.checking"
		:current-transaction="currentTransaction"
		:addresses="addresses"
		:payer-id="payerId"
		:formatted-fiat-amount="formattedFiatAmount"
	/>
	<step-five-aml-blocked
		v-else-if="amlPaymentPhase === AML_PAYMENT_PHASE.blocked"
		:current-transaction="currentTransaction"
		:addresses="addresses"
		:payer-id="payerId"
		:store-id="store?.id ?? null"
		:formatted-fiat-amount="formattedFiatAmount"
	/>
	<step-five-aml-failed
		v-else-if="amlPaymentPhase === AML_PAYMENT_PHASE.failed"
		:current-transaction="currentTransaction"
		:addresses="addresses"
		:payer-id="payerId"
		:store-id="store?.id ?? null"
		:formatted-fiat-amount="formattedFiatAmount"
	/>
	<step-five-shared
		v-else
		:current-transaction="currentTransaction"
		:addresses="addresses"
		:payer-id="payerId"
		:formatted-fiat-amount="formattedFiatAmount"
	/>
</template>
