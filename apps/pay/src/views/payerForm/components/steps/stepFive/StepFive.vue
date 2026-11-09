<script setup lang="ts">
	import StepFiveShared from "@pay-shared/components/payerForm/steps/stepFive/StepFive.vue";
	import StepFiveAmlChecking from "@pay/views/payerForm/components/steps/stepFive/StepFiveAmlChecking.vue";
	import StepFiveAmlBlocked from "@pay/views/payerForm/components/steps/stepFive/StepFiveAmlBlocked.vue";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { computed } from "vue";
	import { formatDollars } from "@shared/utils/helpers/general.ts";
	import { AML_PAYMENT_PHASE } from "@pay/utils/constants/aml";
	import loaderAmlSuccess from "@pay-shared/assets/animations/loaderAmlSuccess.json";

	const { currentTransaction, addresses, payerId, store, amlPaymentPhase, amlScore, amlBlockReasons } =
		storeToRefs(usePayerFormStore());

	const formattedFiatAmount = computed(() =>
		formatDollars(currentTransaction.value?.amount_usd, { countPartMoreOneDollar: 2 })
	);
</script>

<template>
	<step-five-aml-checking
		v-if="amlPaymentPhase === AML_PAYMENT_PHASE.checking"
		:current-transaction="currentTransaction"
		:addresses="addresses"
		:store="store"
		:formatted-fiat-amount="formattedFiatAmount"
	/>
	<step-five-aml-blocked
		v-else-if="amlPaymentPhase === AML_PAYMENT_PHASE.blocked"
		:current-transaction="currentTransaction"
		:addresses="addresses"
		:payer-id="payerId"
		:store-id="store?.id ?? null"
		:store="store"
		:formatted-fiat-amount="formattedFiatAmount"
		:risk-score="amlScore"
		:block-reasons="amlBlockReasons"
	/>
	<step-five-shared
		v-else
		:current-transaction="currentTransaction"
		:addresses="addresses"
		:store="store"
		:formatted-fiat-amount="formattedFiatAmount"
		:success-animation="loaderAmlSuccess"
	/>
</template>
