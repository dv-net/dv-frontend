import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { USER } from "@dv-admin/utils/constants/user";
import { postApiInitEmailConfirmation, postApiUserInitEmailChange } from "@dv-admin/services/api/auth.ts";
import { useNotifications } from "@shared/utils/composables/useNotifications.ts";

const { notify } = useNotifications();

export const useAuthEmailSectionStore = defineStore("authEmailSection", () => {
	const resendTimeoutSeconds: number = 60;
	let emailCodeTimerId: number | null = null;
	const flagChangeEmail = ref<boolean>(false);
	const emailCodeLastSentAt = ref<number | null>(null);
	const emailCodeRemainingSec = ref<number>(0);

	const isEmailCodeTimerActive = computed<boolean>(() => emailCodeRemainingSec.value > 0);
	const hasEmailCodeLastSent = computed<boolean>(() => {
		return emailCodeLastSentAt.value !== null || readWhenEmailCodeSent() !== null;
	});

	const readWhenEmailCodeSent = (): number | null => {
		const raw = localStorage.getItem(USER.EMAIL_CODE_LAST_SENT_AT);
		const num = raw ? Number(raw) : null;
		return num && Number.isFinite(num) && num > 0 ? num : null;
	};

	const setEmailCodeTime = (time: number) => {
		localStorage.setItem(USER.EMAIL_CODE_LAST_SENT_AT, String(time));
		emailCodeLastSentAt.value = time;
	};

	const stopEmailCodeTimer = () => {
		if (emailCodeTimerId !== null) {
			clearInterval(emailCodeTimerId);
			emailCodeTimerId = null;
		}
	};

	const calculateRemaining = (lastSentAt: number | null): number => {
		if (!lastSentAt) return 0;
		const elapsedSec = Math.floor((Date.now() - lastSentAt) / 1000);
		return Math.max(0, resendTimeoutSeconds - elapsedSec);
	};

	const startEmailCodeTimer = (lastSentAt: number | null) => {
		stopEmailCodeTimer();
		emailCodeRemainingSec.value = calculateRemaining(lastSentAt);
		if (emailCodeRemainingSec.value === 0) return;
		emailCodeTimerId = window.setInterval(() => {
			const remaining = calculateRemaining(emailCodeLastSentAt.value);
			emailCodeRemainingSec.value = remaining;
			if (remaining === 0) {
				stopEmailCodeTimer();
			}
		}, 1000);
	};

	const startEmailCodeSentHandler = () => {
		const now = Date.now();
		setEmailCodeTime(now);
		startEmailCodeTimer(now);
	};

	const checkEmailCodeSent = async (type: "confirm" | "change", message = "Code sent"): Promise<boolean> => {
		emailCodeLastSentAt.value = readWhenEmailCodeSent();
		const remaining = calculateRemaining(emailCodeLastSentAt.value);
		if (remaining > 0) {
			startEmailCodeTimer(emailCodeLastSentAt.value);
			return false;
		}
		if (type === "confirm") await postApiInitEmailConfirmation();
		else await postApiUserInitEmailChange();
		notify(message, "success");
		startEmailCodeSentHandler();
		return true;
	};

	const resumeEmailCodeTimer = (): "empty" | "resume" | "cleared" => {
		emailCodeLastSentAt.value = readWhenEmailCodeSent();
		if (!emailCodeLastSentAt.value) {
			startEmailCodeTimer(null);
			return "empty";
		}
		const remaining = calculateRemaining(emailCodeLastSentAt.value);
		if (remaining > 0) {
			startEmailCodeTimer(emailCodeLastSentAt.value);
			return "resume";
		}
		stopEmailCodeTimer();
		clearEmailCodeTimer();
		return "cleared";
	};

	const clearEmailCodeTimer = () => {
		localStorage.removeItem(USER.EMAIL_CODE_LAST_SENT_AT);
		emailCodeLastSentAt.value = null;
		emailCodeRemainingSec.value = 0;
	};

	return {
		emailCodeRemainingSec,
		isEmailCodeTimerActive,
		hasEmailCodeLastSent,
		emailCodeLastSentAt,
		flagChangeEmail,
		checkEmailCodeSent,
		resumeEmailCodeTimer,
		stopEmailCodeTimer,
		calculateRemaining,
		startEmailCodeTimer,
		readWhenEmailCodeSent,
		clearEmailCodeTimer
	};
});
