import { computed, onUnmounted, ref, watch, type Ref } from "vue";
import { storeToRefs } from "pinia";
import { postApiRefundEstimate, postApiRefundToSenderEstimate } from "@pay/utils/services/refund";
import type { IRefundEstimate } from "@pay/utils/types/refund";
import { useRefundStore } from "@pay/stores/refund";
import { usePolling } from "@shared/utils/composables/usePolling";

const MIN_ADDRESS_LENGTH = 20;
const ESTIMATE_DEBOUNCE_MS = 600;
export const ESTIMATE_REFRESH_MS = 10_000;

const readEstimateError = (error: unknown): { status?: number; message: string } => {
	if (!error || typeof error !== "object" || !("response" in error)) return { message: "" };
	const response = (error as { response?: { status?: number; data?: { errors?: { message?: string }[] } } }).response;
	return {
		status: response?.status,
		message: response?.data?.errors?.[0]?.message ?? ""
	};
};

const estimateErrorKey = (status: number | undefined, message: string): string | null => {
	if (status === 409) return "A refund request has already been submitted";
	if (status === 404) return "Not found";
	if (status === 403) return "Refund without email is no longer available";
	if (status !== 422) return null;
	if (message.includes("not a sender")) return "The address is not a sender of the deposit";
	if (message.includes("not enough native coin")) return "Refund fee unavailable";
	if (message.includes("not enough funds")) return "Not enough funds on the deposit address";
	if (message.includes("cannot be refunded")) return "The deposit cannot be refunded";
	if (message.includes("invalid destination address")) return "The address does not match the deposit blockchain";
	return "An unexpected error occurred";
};

export const useRefundEstimate = (blockedTransactionId: string, destinationAddress: Ref<string>, toSender = false) => {
	const { token, walletId } = storeToRefs(useRefundStore());

	const requestEstimate = (address: string): Promise<IRefundEstimate> | null => {
		const body = { destination_address: address };
		if (toSender) {
			return walletId.value ? postApiRefundToSenderEstimate(walletId.value, blockedTransactionId, body) : null;
		}
		return token.value ? postApiRefundEstimate(blockedTransactionId, body, token.value) : null;
	};
	const { startPolling, stopPolling } = usePolling();
	const estimate = ref<IRefundEstimate | null>(null);
	const isEstimating = ref(false);
	const isWaiting = ref(false);
	const errorKey = ref<string | null>(null);
	const quoteCycle = ref(0);
	let requestId = 0;
	let opened = false;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const clearDebounce = () => {
		if (!debounceTimer) return;
		clearTimeout(debounceTimer);
		debounceTimer = null;
	};

	const runEstimate = async () => {
		const address = destinationAddress.value.trim();
		const request = address.length < MIN_ADDRESS_LENGTH ? null : requestEstimate(address);
		if (!request) {
			stopPolling();
			isWaiting.value = false;
			isEstimating.value = false;
			return;
		}

		const currentRequest = ++requestId;
		const initial = !opened;
		opened = true;
		if (initial) isEstimating.value = true;

		try {
			const data = await request;
			if (currentRequest !== requestId) return;
			estimate.value = data;
			errorKey.value = null;
			quoteCycle.value += 1;
		} catch (error) {
			if (currentRequest !== requestId) return;
			const parsed = readEstimateError(error);
			const nextErrorKey = estimateErrorKey(parsed.status, parsed.message);
			if (nextErrorKey || initial) {
				estimate.value = null;
				errorKey.value = nextErrorKey;
				if (!nextErrorKey) console.error(error);
				stopPolling();
				return;
			}
			console.error(error);
			quoteCycle.value += 1;
		} finally {
			if (currentRequest === requestId) {
				isEstimating.value = false;
				isWaiting.value = false;
			}
		}
	};

	watch(
		destinationAddress,
		(value) => {
			stopPolling();
			clearDebounce();
			requestId += 1;
			opened = false;
			estimate.value = null;
			errorKey.value = null;
			isEstimating.value = false;

			const address = value.trim();
			if (address.length < MIN_ADDRESS_LENGTH) {
				isWaiting.value = false;
				return;
			}

			isWaiting.value = true;
			debounceTimer = setTimeout(() => {
				void startPolling(runEstimate, ESTIMATE_REFRESH_MS);
			}, ESTIMATE_DEBOUNCE_MS);
		},
		{ immediate: true }
	);

	onUnmounted(() => {
		clearDebounce();
		requestId += 1;
	});

	const canClaim = computed(() => {
		const address = destinationAddress.value.trim();
		if (address.length < MIN_ADDRESS_LENGTH) return false;
		if (isWaiting.value || isEstimating.value) return false;
		if (estimate.value) return estimate.value.fee_covered;
		return !errorKey.value;
	});

	return {
		estimate,
		isEstimating,
		isWaiting,
		errorKey,
		quoteCycle,
		canClaim
	};
};
