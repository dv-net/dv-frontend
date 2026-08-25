<script setup lang="ts">
	import StepOneShared from "@pay-shared/components/payerForm/steps/stepOne/StepOne.vue";
	import { usePayerFormStore } from "@pay-simple/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import { useRoute, useRouter } from "vue-router";

	const { currentCurrency, currentStep, currentChain, isLoading, filteredBlockchains, filteredCurrencies, addresses } =
		storeToRefs(usePayerFormStore());
	const { getAmountRate } = usePayerFormStore();

	const router = useRouter();
	const route = useRoute();

	const setCurrency = async (currencyId: string) => {
		if (!currencyId) return;
		const token = getCurrentCoin(currencyId);
		currentCurrency.value = token;
		currentChain.value = null;
		const query: Record<string, any> = { ...route.query, token };

		if (filteredBlockchains.value.length === 1) {
			const chain = getCurrentBlockchain(currencyId);
			currentChain.value = chain;
			query.chain = chain;
			query.step = 3;
		} else {
			query.step = 2;
			delete query.chain;
		}
		await router.push({ query });
		currentStep.value = filteredBlockchains.value.length === 1 ? 3 : 2;
	};
</script>

<template>
	<step-one-shared
		:filtered-currencies="filteredCurrencies"
		:addresses="addresses"
		:is-loading="isLoading"
		:current-currency="currentCurrency"
		:get-amount-rate="getAmountRate"
		@select-currency="setCurrency"
	/>
</template>
