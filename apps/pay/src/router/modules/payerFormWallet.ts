import { APP_LAYOUT } from "@pay/layouts";
import PayerFormView from "@pay/views/payerForm/PayerFormView.vue";
import StepTwo from "@pay/views/payerForm/components/steps/stepTwo/StepTwo.vue";
import StepOne from "@pay/views/payerForm/components/steps/stepOne/StepOne.vue";
import StepThree from "@pay/views/payerForm/components/steps/stepThree/stepThree.vue";
import StepFour from "@pay/views/payerForm/components/steps/stepFour/StepFour.vue";
import StepFive from "@pay/views/payerForm/components/steps/stepFive/StepFive.vue";

export default [
	{
		path: "/wallet/:payerId",
		name: "payer-wallet",
		component: PayerFormView,
		redirect: () => ({ name: "payer-wallet-step1" }),
		meta: { layout: APP_LAYOUT.PAYMENT },
		children: [
			{ path: 'step1', name: 'payer-wallet-step1', component: StepOne },
			{ path: 'step2', name: 'payer-wallet-step2', component: StepTwo },
			{ path: 'step3', name: 'payer-wallet-step3', component: StepThree },
			{ path: 'step4', name: 'payer-wallet-step4', component: StepFour },
			{ path: 'step5', name: 'payer-wallet-step5', component: StepFive },
		]
	}
];
