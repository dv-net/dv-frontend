<script setup lang="ts">
	import StepTwoShared from "@pay-shared/components/payerForm/steps/stepTwo/StepTwo.vue";
	import { usePayerFormStore } from "@pay-simple/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { getCurrentBlockchain } from "@shared/utils/helpers/general.ts";
	import { useRouter, useRoute } from "vue-router";
	import type { CurrencyType } from "@shared/utils/types/blockchain";
	import { computed } from "vue";

	const { filteredBlockchains, isLoading, currentStep, currentCurrency, currentChain, addresses } =
		storeToRefs(usePayerFormStore());
	const { getAmountRate } = usePayerFormStore();

	const router = useRouter();
	const route = useRoute();

	const amountRate = computed(() =>
		getAmountRate((filteredBlockchains.value[0]?.currency.id || currentCurrency.value) as CurrencyType)
	);

	const setBlockchain = async (currencyId: string) => {
		if (!currencyId) return;
		const chain = getCurrentBlockchain(currencyId);
		currentChain.value = chain;
		const query = { ...route.query, chain, step: 3 };
		await router.push({ query });
		currentStep.value = 3;
	};

	const changeCurrency = () => {
		currentStep.value = 1;
	};
</script>

<template>
	<step-two-shared
		:filtered-blockchains="filteredBlockchains"
		:is-loading="isLoading"
		:current-currency="currentCurrency"
		:current-chain="currentChain"
		:addresses="addresses"
		:amount-rate="amountRate"
		:currency-id="filteredBlockchains[0]?.currency.id"
		@select-blockchain="setBlockchain"
		@change-currency="changeCurrency"
	/>
</template>
