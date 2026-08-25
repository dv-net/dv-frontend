<script setup lang="ts">
	import PayerFormHeader from "@pay-simple/views/payerForm/components/payerFormHeader/PayerFormHeader.vue";
	import PayerFormSidebar from "@pay-shared/components/payerForm/payerFormSidebar/PayerFormSidebar.vue";
	import { useRoute, useRouter } from "vue-router";
	import { type Component, computed, defineAsyncComponent, onMounted, onUnmounted, watch } from "vue";
	import { usePayerFormStore } from "@pay-simple/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import BlockAdvertising from "@pay-shared/components/payerForm/blockAdvertising/BlockAdvertising.vue";
	import { useI18n } from "vue-i18n";
	import AudioPayment from "@pay-simple/views/payerForm/components/audioPayment/AudioPayment.vue";

	import StepOne from "@pay-simple/views/payerForm/components/steps/stepOne/StepOne.vue";
	import StepTwo from "@pay-simple/views/payerForm/components/steps/stepTwo/StepTwo.vue";
	import StepThree from "@pay-simple/views/payerForm/components/steps/stepThree/stepThree.vue";
	import StepFour from "@pay-simple/views/payerForm/components/steps/stepFour/StepFour.vue";
	import StepFive from "@pay-simple/views/payerForm/components/steps/stepFive/StepFive.vue";

	const FormError = defineAsyncComponent(
		() => import("@pay-shared/components/payerForm/formError/FormError.vue")
	);

	const {
		currentStep,
		payerId,
		amount,
		isPoolingProgress,
		store,
		timeline,
		currentCurrency,
		currentChain,
		errorStore,
		isShowAdvertising,
		isShowBlockLatestTransactions,
		transactionsConfirmed,
		invoiceCurrency,
		stepMap,
		filteredBlockchains,
		filteredCurrencies,
		invoiceUuid
	} = storeToRefs(usePayerFormStore());
	const { getInvoiceStatusPoll, checkValidationCurrencyAndChain, getStartInfo } = usePayerFormStore();

	const route = useRoute();
	const router = useRouter();
	const { t } = useI18n();

	const currencyId = route.query.currency as string | undefined;
	const token = route.query.token as string | undefined;
	const chain = route.query.chain as string | undefined;
	const invoiceId = route.params.uuid as string | undefined;
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
		if (!isPoolingProgress.value) {
			if (timeout) clearTimeout(timeout);
			return;
		}
		if (invoiceUuid.value) await getInvoiceStatusPoll(invoiceUuid.value);
		timeout = setTimeout(() => startPolling(), 3000);
	};

	const updateQuery = () => {
		const query: Record<string, any> = {
			...route.query,
			...(currentCurrency.value && { token: currentCurrency.value }),
			...(currentChain.value && { chain: currentChain.value })
		};
		router.push({ query });
	};

	const getQueryParams = () => {
		if (token && checkValidationCurrencyAndChain(token)) currentCurrency.value = token;
		if (chain && checkValidationCurrencyAndChain(undefined, chain)) currentChain.value = chain;
		if (currencyId && checkValidationCurrencyAndChain(undefined, undefined, currencyId)) {
			currentCurrency.value = getCurrentCoin(currencyId);
			currentChain.value = getCurrentBlockchain(currencyId);
		}
		if (currentCurrency.value && currentChain.value) {
			currentStep.value = 3;
		} else if (currentCurrency.value) {
			if (filteredBlockchains.value.length === 1) {
				currentChain.value = getCurrentBlockchain(filteredBlockchains.value[0].currency.id);
				currentStep.value = 3;
				updateQuery();
			} else {
				currentStep.value = 2;
			}
			return;
		} else if (filteredCurrencies.value.length === 1) {
			currentCurrency.value = getCurrentCoin(filteredCurrencies.value[0].currency.id);
			currentChain.value =
				filteredBlockchains.value.length === 1
					? getCurrentBlockchain(filteredBlockchains.value[0].currency.id)
					: null;
			currentStep.value = currentChain.value ? 3 : 2;
			updateQuery();
		}
	};

	const parseStepFromQuery = (stepQuery: string | undefined): number => {
		if (!stepQuery) return 1;
		const step = parseFloat(stepQuery);
		if (!step || !(step in stepComponents)) return 1;
		return step;
	};

	watch(currentStep, (newValue: number) => {
		timeline.value.forEach((item) => {
			item.isActive = item.id <= (stepMap.value[currentStep.value] || currentStep.value);
			if ([4].includes(newValue) && [1, 2].includes(item.id)) item.isActive = false;
			if ([5].includes(newValue) && [1, 2, 3].includes(item.id)) item.isActive = false;
		});
		router.push({ query: { ...route.query, step: newValue } });
	});

	watch(
		() => route.query.step as string | undefined,
		(newValue) => {
			currentStep.value = parseStepFromQuery(newValue);
		}
	);

	onMounted(async () => {
		await getStartInfo(invoiceId);
		document.title = store.value?.name
			? `${t("Payment by cryptocurrency in")} ${store.value?.name}`
			: t("Payment by cryptocurrency");
		getQueryParams();
		void startPolling();
	});

	onUnmounted(() => {
		if (timeout) clearTimeout(timeout);
	});
</script>

<template>
	<audio-payment />
	<div class="form">
		<payer-form-header />
		<div class="form__inner">
			<div class="form__body">
				<form-error v-if="errorStore" :type="errorStore" />
				<component v-else :is="currentStepComponent" />
			</div>
			<payer-form-sidebar
				:payer-id="payerId"
				:store="store"
				:has-error="Boolean(errorStore)"
				:current-step="currentStep"
				:is-show-advertising="isShowAdvertising"
				:is-show-block-latest-transactions="isShowBlockLatestTransactions"
				:transactions="transactionsConfirmed"
				:amount="amount"
				:fiat-currency="invoiceCurrency"
			/>
			<block-advertising v-if="isShowAdvertising" class="form__advertising" />
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
