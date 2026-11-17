import { PAYER_STEP } from "@pay-shared/utils/constants/payerForm";

/** The payer is on the payment screen or further: pre-payment UI (sidebar, ads, latest payments) is hidden */
export const isPaymentStage = (step: number): boolean => step >= PAYER_STEP.sendPayment;

/** A transaction is already found: the payer can no longer go back to currency / chain selection */
export const isPaymentDetected = (step: number): boolean => step >= PAYER_STEP.confirmation;
