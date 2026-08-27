import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
	getApiRefundCabinet,
	postApiRefundClaim,
	postApiRefundLookup,
	postApiRefundVerify
} from "@pay/utils/services/refund";
import type { IRefundCabinetItem, IRefundCabinetResponse, IRefundLookupRequest } from "@pay/utils/types/refund";
import {
	REFUND_CABINET_BUCKET_ORDER,
	REFUND_RESEND_COOLDOWN_SEC,
	REFUND_TOKEN_COOKIE_TTL,
	REFUND_TOKEN_KEY
} from "@pay/utils/constants/refund";
import { getCookie, removeCookie, setCookie } from "@shared/utils/helpers/cookie";

export const useRefundStore = defineStore("refund", () => {
	const walletId = ref("");
	const storeId = ref("");
	const email = ref("");
	const code = ref("");
	const token = ref<string | null>(getCookie(REFUND_TOKEN_KEY));
	const entryStep = ref<"lookup" | "verify">("lookup");
	const cabinet = ref<IRefundCabinetResponse | null>(null);
	const isLoadingLookup = ref(false);
	const isLoadingVerify = ref(false);
	const isLoadingCabinet = ref(false);
	const isLoadingClaim = ref(false);
	const resendCooldownSec = ref(0);
	let resendTimer: ReturnType<typeof setInterval> | null = null;

	const isAuthenticated = computed(() => Boolean(token.value));

	const cabinetSections = computed(() => {
		if (!cabinet.value) return [];
		return REFUND_CABINET_BUCKET_ORDER.map((bucket) => ({
			bucket,
			items: cabinet.value?.[bucket] ?? []
		})).filter((section) => section.items.length > 0);
	});

	const startResendCooldown = () => {
		resendCooldownSec.value = REFUND_RESEND_COOLDOWN_SEC;
		if (resendTimer) clearInterval(resendTimer);
		resendTimer = setInterval(() => {
			if (resendCooldownSec.value <= 1) {
				resendCooldownSec.value = 0;
				if (resendTimer) {
					clearInterval(resendTimer);
					resendTimer = null;
				}
				return;
			}
			resendCooldownSec.value -= 1;
		}, 1000);
	};

	const persistToken = (value: string | null) => {
		token.value = value;
		if (value) {
			removeCookie(REFUND_TOKEN_KEY);
			setCookie(REFUND_TOKEN_KEY, value, REFUND_TOKEN_COOKIE_TTL);
		} else {
			removeCookie(REFUND_TOKEN_KEY);
		}
	};

	const lookupPayload = (): IRefundLookupRequest => ({
		wallet_id: walletId.value.trim(),
		store_id: storeId.value.trim(),
		email: email.value.trim()
	});

	const sendCode = async () => {
		try {
			isLoadingLookup.value = true;
			await postApiRefundLookup(lookupPayload());
			entryStep.value = "verify";
			startResendCooldown();
		} catch (error) {
			throw error;
		} finally {
			isLoadingLookup.value = false;
		}
	};

	const verifyCode = async () => {
		try {
			isLoadingVerify.value = true;
			const data = await postApiRefundVerify({
				...lookupPayload(),
				code: code.value.trim()
			});
			persistToken(data.token);
			code.value = "";
		} catch (error) {
			throw error;
		} finally {
			isLoadingVerify.value = false;
		}
	};

	const loadCabinet = async () => {
		if (!token.value) return;
		try {
			isLoadingCabinet.value = true;
			cabinet.value = await getApiRefundCabinet(token.value);
		} catch (error: any) {
			if (error?.response?.status === 401) {
				logout();
			}
			throw error;
		} finally {
			isLoadingCabinet.value = false;
		}
	};

	const claimRefund = async (item: IRefundCabinetItem, destinationAddress: string) => {
		if (!token.value) return;
		try {
			isLoadingClaim.value = true;
			await postApiRefundClaim(
				item.blocked_transaction_id,
				{ destination_address: destinationAddress.trim() },
				token.value
			);
			await loadCabinet();
		} catch (error) {
			throw error;
		} finally {
			isLoadingClaim.value = false;
		}
	};

	const logout = () => {
		persistToken(null);
		cabinet.value = null;
		entryStep.value = "lookup";
		code.value = "";
	};

	return {
		walletId,
		storeId,
		email,
		code,
		token,
		entryStep,
		cabinet,
		cabinetSections,
		isLoadingLookup,
		isLoadingVerify,
		isLoadingCabinet,
		isLoadingClaim,
		resendCooldownSec,
		isAuthenticated,
		sendCode,
		verifyCode,
		loadCabinet,
		claimRefund,
		logout
	};
});
