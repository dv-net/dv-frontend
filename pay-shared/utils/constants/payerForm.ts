export const PAYER_STEP = {
	selectCurrency: 1,
	selectChain: 2,
	sendPayment: 3,
	confirmation: 4,
	result: 5
} as const;

export type TPayerStep = (typeof PAYER_STEP)[keyof typeof PAYER_STEP];
