<script setup lang="ts">
	import PayerFormHeader from "@pay/views/payerForm/components/payerFormHeader/PayerFormHeader.vue";
	import PayerFormSidebar from "@pay/views/payerForm/components/payerFormSidebar/PayerFormSidebar.vue";
	import StepOne from "@pay/views/payerForm/components/steps/stepOne/StepOne.vue";
	import { useRoute } from "vue-router";
	import { type Component, computed, onMounted, onUnmounted, watch } from "vue";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import StepTwo from "@pay/views/payerForm/components/steps/stepTwo/StepTwo.vue";
	import StepThree from "@pay/views/payerForm/components/steps/stepThree/stepThree.vue";
	import StepFour from "@pay/views/payerForm/components/steps/stepFour/StepFour.vue";
	import StepFive from "@pay/views/payerForm/components/steps/stepFive/StepFive.vue";
	import StepError from "@pay/views/payerForm/components/steps/stepError/StepError.vue";
	import BlockAdvertising from "@pay/views/payerForm/components/payerFormSidebar/blockAdvertising/BlockAdvertising.vue";

	const {
		currentStep,
		payerId,
		amount,
		isPoolingProgress,
		store,
		timeline,
		currentCurrency,
		currentChain,
		errorStore
	} = storeToRefs(usePayerFormStore());
	const { getWalletTxFind, getStoreTopup, getPayerInfo, checkValidationCurrencyAndChain } = usePayerFormStore();

	const route = useRoute();

	const isStoreForm: boolean = route.name === "payer-store";
	const price = route.query.amount as string | undefined;
	const currencyId = route.query.currency as string | undefined;
	const token = route.query.token as string | undefined;
	const chain = route.query.chain as string | undefined;
	const slug = route.params.slug as string | undefined;
	const payerIdQuery = route.params.payerId as string | undefined;
	const externalId = route.params.externalId as string | undefined;
	const email = route.query.email as string | undefined;
	let timeout: ReturnType<typeof setTimeout> | null = null;
	const stepComponents: Record<number, Component> = {
		1: StepOne,
		2: StepTwo,
		3: StepThree,
		4: StepFour,
		5: StepFive
	};

	const currentStepComponent = computed<Component>(() => {
		return stepComponents[currentStep.value];
	});

	const startPolling = async () => {
		if (!isPoolingProgress.value && timeout) return clearTimeout(timeout);
		if (payerId.value) await getWalletTxFind(payerId.value);
		timeout = setTimeout(() => startPolling(), 3000);
	};

	const getQueryParams = () => {
		amount.value = price || store.value?.minimal_payment || "1";
		if (token && checkValidationCurrencyAndChain(token)) currentCurrency.value = token;
		if (chain && checkValidationCurrencyAndChain(undefined, chain)) currentChain.value = chain;
		if (currencyId && checkValidationCurrencyAndChain(undefined, undefined, currencyId)) {
			currentCurrency.value = getCurrentCoin(currencyId);
			currentChain.value = getCurrentBlockchain(currencyId);
		}
		if (currentCurrency.value && currentChain.value) {
			currentStep.value = 3;
		} else if (currentCurrency.value) {
			currentStep.value = 2;
		}
	};

	watch(currentStep, (newValue: number) => {
		// Highlight current step
		timeline.value.forEach((item) => (item.isActive = item.id <= newValue));
	});

	onMounted(async () => {
		if (isStoreForm) {
			if (slug && externalId) await getStoreTopup(slug, externalId, email);
		} else {
			payerId.value = payerIdQuery || null;
			if (payerId.value) await getPayerInfo(payerId.value);
		}
		getQueryParams();
		void startPolling();
	});

	onUnmounted(() => {
		if (timeout) clearTimeout(timeout);
	});
</script>

<template>
	<div class="form">
		<payer-form-header />
		<div class="form__inner">
			<div class="form__body">
				<step-error v-if="errorStore" />
				<transition v-else name="fade" mode="out-in">
					<component :is="currentStepComponent" />
				</transition>
			</div>
			<payer-form-sidebar />
			<block-advertising class="form__advertising" />
		</div>
	</div>
</template>

<style scoped lang="scss">
	.form {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 24px;
		@include mediamax(480) {
			gap: 12px;
		}
		&__inner {
			display: flex;
			gap: 24px;
			@include mediamax(1024) {
				width: 100%;
				flex-direction: column;
			}
			@include mediamax(480) {
				gap: 12px;
			}
		}
		&__body {
			flex-grow: 1;
			@include mediamax(1024) {
				order: 2;
			}
		}
		&__advertising {
			display: none;
			@include mediamax(1024) {
				display: flex;
				order: 3;
			}
		}
	}
</style>
