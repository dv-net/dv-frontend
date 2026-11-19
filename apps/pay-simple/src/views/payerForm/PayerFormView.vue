<script setup lang="ts">
	import PayerFormHeader from "@pay-shared/components/payerForm/payerFormHeader/PayerFormHeader.vue";
	import PayerFormSidebar from "@pay-shared/components/payerForm/payerFormSidebar/PayerFormSidebar.vue";
	import AmountEditor from "@pay-shared/components/payerForm/amountEditor/AmountEditor.vue";
	import { useRoute, useRouter } from "vue-router";
	import { type Component, computed, onMounted, onUnmounted, watch } from "vue";
	import { usePayerFormStore } from "@pay-simple/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import BlockAdvertising from "@pay-shared/components/payerForm/blockAdvertising/BlockAdvertising.vue";
	import { useI18n } from "vue-i18n";
	import AudioPayment from "@pay-shared/components/payerForm/audioPayment/AudioPayment.vue";
	import { PAYER_STEP } from "@pay-shared/utils/constants/payerForm";
	import { isPaymentStage } from "@pay-shared/utils/helpers/payerStep";
	import { getPendingAnimationName, prefetchLottieAnimations } from "@pay-shared/utils/helpers/lottie";
	import StepTransition from "@pay-shared/components/ui/stepTransition/StepTransition.vue";

	import StepOne from "@pay-simple/views/payerForm/components/steps/stepOne/StepOne.vue";
	import StepTwo from "@pay-simple/views/payerForm/components/steps/stepTwo/StepTwo.vue";
	import StepThree from "@pay-simple/views/payerForm/components/steps/stepThree/stepThree.vue";
	import StepFour from "@pay-simple/views/payerForm/components/steps/stepFour/StepFour.vue";
	import StepFive from "@pay-simple/views/payerForm/components/steps/stepFive/StepFive.vue";
	import FormError from "@pay-shared/components/payerForm/formError/FormError.vue";

	const {
		currentStep,
		payerId,
		amount,
		isPoolingProgress,
		isPreparingWallets,
		store,
		timeline,
		currentCurrency,
		currentChain,
		currentCurrencyChainId,
		errorStore,
		isShowAdvertising,
		isShowBlockLatestTransactions,
		transactionsConfirmed,
		invoice,
		invoiceCurrency,
		stepMap,
		filteredBlockchains,
		invoiceUuid,
		moneyCameAudioRef,
		paymentFoundAudioRef
	} = storeToRefs(usePayerFormStore());
	const { getInvoiceStatusPoll, checkValidationCurrencyAndChain, getStartInfo, pollWalletsInfo } = usePayerFormStore();

	const route = useRoute();
	const router = useRouter();
	const { t } = useI18n();

	const price = route.query.amount as string | undefined;
	const currencyId = route.query.currency as string | undefined;
	const token = route.query.token as string | undefined;
	const chain = route.query.chain as string | undefined;
	const invoiceId = route.params.uuid as string | undefined;
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let walletsTimeout: ReturnType<typeof setTimeout> | null = null;
	const stepComponents: Record<number, Component> = {
		[PAYER_STEP.selectCurrency]: StepOne,
		[PAYER_STEP.selectChain]: StepTwo,
		[PAYER_STEP.sendPayment]: StepThree,
		[PAYER_STEP.confirmation]: StepFour,
		[PAYER_STEP.result]: StepFive
	};

	const currentStepComponent = computed<Component>(() => {
		return stepComponents[currentStep.value];
	});

	/** The sidebar is hidden on payment stages, so the whole form fades when the layout changes */
	const formLayout = computed<string>(() => (isPaymentStage(currentStep.value) ? "payment" : "select"));

	const startPolling = async () => {
		if (!isPoolingProgress.value) {
			if (timeout) clearTimeout(timeout);
			return;
		}
		if (invoiceUuid.value) await getInvoiceStatusPoll(invoiceUuid.value);
		timeout = setTimeout(() => startPolling(), 3000);
	};

	const startWalletsPolling = () => {
		if (!isPreparingWallets.value) {
			if (walletsTimeout) clearTimeout(walletsTimeout);
			return;
		}
		walletsTimeout = setTimeout(async () => {
			try {
				const ready = await pollWalletsInfo();
				if (ready) {
					getQueryParams();
					void startPolling();
					return;
				}
			} catch {
				return;
			}
			startWalletsPolling();
		}, 3000);
	};

	const toPositiveNumber = (val: unknown, fallback = 0): number => {
		if (!val) return fallback;
		const num = parseFloat(String(val));
		return num > 0 ? num : fallback;
	};

	const updateQuery = () => {
		const query = {
			...route.query,
			...(amount.value && { amount: amount.value }),
			...(currentCurrency.value && { token: currentCurrency.value }),
			...(currentChain.value && { chain: currentChain.value })
		};
		router.push({ query });
	};

	const getQueryParams = () => {
		amount.value = toPositiveNumber(
			price,
			toPositiveNumber(invoice.value?.amount, toPositiveNumber(store.value?.minimal_payment, 1))
		);
		if (token && checkValidationCurrencyAndChain(token)) currentCurrency.value = token;
		if (chain && checkValidationCurrencyAndChain(undefined, chain)) currentChain.value = chain;
		if (currencyId && checkValidationCurrencyAndChain(undefined, undefined, currencyId)) {
			currentCurrency.value = getCurrentCoin(currencyId);
			currentChain.value = getCurrentBlockchain(currencyId);
		}
		if (currentCurrency.value && currentChain.value) {
			currentStep.value = PAYER_STEP.sendPayment;
		} else if (currentCurrency.value) {
			if (filteredBlockchains.value.length === 1) {
				currentChain.value = getCurrentBlockchain(filteredBlockchains.value[0].currency.id);
				currentStep.value = PAYER_STEP.sendPayment;
				updateQuery();
			} else {
				currentStep.value = PAYER_STEP.selectChain;
			}
		}
	};

	const parseStepFromQuery = (stepQuery: string | undefined): number => {
		if (!stepQuery) return PAYER_STEP.selectCurrency;
		const step = parseFloat(stepQuery);
		if (!step || !(step in stepComponents)) return PAYER_STEP.selectCurrency;
		return step;
	};

	watch(currentStep, (newValue: number) => {
		timeline.value.forEach((item) => {
			item.isActive = item.id <= (stepMap.value[currentStep.value] || currentStep.value);
			if (newValue === PAYER_STEP.sendPayment && item.id === PAYER_STEP.selectChain) {
				item.isActive = filteredBlockchains.value.length > 1;
			}
			if (newValue === PAYER_STEP.confirmation && [1, 2].includes(item.id)) item.isActive = false;
			if (newValue === PAYER_STEP.result && [1, 2, 3].includes(item.id)) item.isActive = false;
		});
		router.push({ query: { ...route.query, step: newValue } });
	});

	watch(currentCurrencyChainId, (currencyChainId) => {
		if (currencyChainId) prefetchLottieAnimations([getPendingAnimationName(currencyChainId)]);
	});

	watch(
		() => route.query.step as string | undefined,
		(newValue) => {
			currentStep.value = parseStepFromQuery(newValue);
		}
	);

	onMounted(async () => {
		await getStartInfo(invoiceId);
		if (!errorStore.value) {
			prefetchLottieAnimations(["waitingConfirmation", "mainLoader", "successfulPayment"]);
		}
		document.title = store.value?.name
			? `${t("Payment by cryptocurrency in")} ${store.value?.name}`
			: t("Payment by cryptocurrency");
		if (isPreparingWallets.value) {
			startWalletsPolling();
			return;
		}
		getQueryParams();
		void startPolling();
	});

	onUnmounted(() => {
		if (timeout) clearTimeout(timeout);
		if (walletsTimeout) clearTimeout(walletsTimeout);
	});
</script>

<template>
	<audio-payment
		v-model:money-came-audio-ref="moneyCameAudioRef"
		v-model:payment-found-audio-ref="paymentFoundAudioRef"
	/>
	<div class="form">
		<payer-form-header :timeline="timeline" :current-step="currentStep" :step-map="stepMap" />
		<step-transition :step="formLayout">
			<div class="form__inner">
				<div class="form__body">
					<form-error v-if="errorStore" :type="errorStore" />
					<step-transition v-else :step="currentStep">
						<component :is="currentStepComponent" />
					</step-transition>
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
				>
					<amount-editor
						v-model:amount="amount"
						size="lg"
						:fiat-currency="invoiceCurrency"
						:minimal-payment="store?.minimal_payment"
					/>
				</payer-form-sidebar>
				<block-advertising v-if="isShowAdvertising" class="form__advertising" />
			</div>
		</step-transition>
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
