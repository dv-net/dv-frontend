import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import {
	getApiRefundCabinet,
	postApiRefundClaim,
	postApiRefundLookup,
	postApiRefundToSender,
	postApiRefundVerify
} from "@pay/utils/services/refund";
import { getApiWalletBlockedTransactions } from "@pay/utils/services/payerForm";
import type { IRefundCabinetItem, IRefundCabinetResponse, IRefundEntryPartialQuery, IRefundLookupRequest } from "@pay/utils/types/refund";
import {
	REFUND_CABINET_BUCKET_ORDER,
	REFUND_RESEND_COOLDOWN_SEC,
	REFUND_TOKEN_COOKIE_TTL,
	getRefundTokenCookieKey
} from "@pay/utils/constants/refund";
import { getCookie, removeCookie, setCookie } from "@shared/utils/helpers/cookie";

export const useRefundStore = defineStore("refund", () => {
	const walletId = ref("");
	const storeId = ref("");
	const email = ref("");
	const code = ref("");
	const token = ref<string | null>(null);
	const entryStep = ref<"choice" | "lookup" | "verify">("lookup");
	const cabinet = ref<IRefundCabinetResponse | null>(null);
	const isLoadingLookup = ref(false);
	const isLoadingVerify = ref(false);
	const isLoadingCabinet = ref(false);
	const isLoadingClaim = ref(false);
	const resendCooldownSec = ref(0);
	const senderRefundItems = ref<IRefundCabinetItem[]>([]);
	const isLoadingSenderRefundItems = ref(false);
	const claimingSenderRefundId = ref<string | null>(null);
	let resendTimer: ReturnType<typeof setInterval> | null = null;

	const isAuthenticated = computed(() => Boolean(token.value));

	const canRefundToSender = computed(() =>
		senderRefundItems.value.some((item) => item.refund_to_sender_without_auth)
	);

	const sortCabinetItemsByDateDesc = (items: IRefundCabinetItem[]) =>
		[...items].sort((a, b) => {
			const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
			const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
			return bTime - aTime;
		});

	const cabinetSections = computed(() => {
		if (!cabinet.value) return [];
		return REFUND_CABINET_BUCKET_ORDER.map((bucket) => ({
			bucket,
			items: sortCabinetItemsByDateDesc(cabinet.value?.[bucket] ?? [])
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

	const getTokenCookieKey = (): string | null => {
		const storeIdValue = storeId.value.trim();
		const walletIdValue = walletId.value.trim();
		if (!storeIdValue || !walletIdValue) return null;
		return getRefundTokenCookieKey(storeIdValue, walletIdValue);
	};

	const syncTokenFromStore = () => {
		const cookieKey = getTokenCookieKey();
		token.value = cookieKey ? getCookie(cookieKey) : null;
	};

	const persistToken = (value: string | null) => {
		const cookieKey = getTokenCookieKey();
		if (!cookieKey) {
			token.value = value;
			return;
		}

		token.value = value;
		if (value) {
			setCookie(cookieKey, value, REFUND_TOKEN_COOKIE_TTL);
		} else {
			removeCookie(cookieKey);
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

	const loadSenderRefundItems = async () => {
		const walletIdValue = walletId.value.trim();
		if (!walletIdValue) {
			senderRefundItems.value = [];
			return;
		}
		try {
			isLoadingSenderRefundItems.value = true;
			senderRefundItems.value = await getApiWalletBlockedTransactions(walletIdValue);
		} catch (error) {
			senderRefundItems.value = [];
			console.error(error);
		} finally {
			isLoadingSenderRefundItems.value = false;
		}
	};

	const claimRefundToSender = async (item: IRefundCabinetItem, destinationAddress: string) => {
		const walletIdValue = walletId.value.trim();
		if (!walletIdValue) return;
		try {
			claimingSenderRefundId.value = item.blocked_transaction_id;
			const request = await postApiRefundToSender(walletIdValue, item.blocked_transaction_id, {
				destination_address: destinationAddress.trim()
			});
			senderRefundItems.value = senderRefundItems.value.map((current) =>
				current.blocked_transaction_id === item.blocked_transaction_id
					? {
							...current,
							refund_status: request.status,
							destination_address: request.destination_address,
							refund_execute_after: request.execute_after ?? null
						}
					: current
			);
		} catch (error) {
			throw error;
		} finally {
			claimingSenderRefundId.value = null;
		}
	};

	const logout = () => {
		persistToken(null);
		cabinet.value = null;
		entryStep.value = "lookup";
		code.value = "";
	};

	const prefillFromQuery = (payload: IRefundLookupRequest) => {
		walletId.value = payload.wallet_id;
		storeId.value = payload.store_id;
		email.value = payload.email;
		syncTokenFromStore();
	};

	const prefillPartialFromQuery = (payload: IRefundEntryPartialQuery) => {
		walletId.value = payload.wallet_id;
		storeId.value = payload.store_id;
		email.value = "";
		entryStep.value = "lookup";
		syncTokenFromStore();
	};

	watch([storeId, walletId], () => {
		cabinet.value = null;
		senderRefundItems.value = [];
		syncTokenFromStore();
	});

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
		senderRefundItems,
		isLoadingSenderRefundItems,
		claimingSenderRefundId,
		canRefundToSender,
		sendCode,
		verifyCode,
		loadCabinet,
		claimRefund,
		loadSenderRefundItems,
		claimRefundToSender,
		logout,
		prefillFromQuery,
		prefillPartialFromQuery,
		syncTokenFromStore
	};
});
