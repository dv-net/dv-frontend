import { defineStore } from "pinia";
import {
	getApiMyDvAuthLink,
	getApiInfoUser2Fa,
	getApiOwnerData,
	getApiUser,
	postApiForgotPassword,
	postApiUser2FaConfirm,
	postApiUser2FaDisable,
	postApiUserChangeEmail,
	postApiUserEmailConfirmation,
	postAuthUser,
	postRegisterUser,
	putApiUser
} from "@dv-admin/services/api/auth";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type {
	IOwnerDataResponse,
	ISignInRequest,
	ISignUpRequest,
	IUser2FaRequest,
	IUser2FaResponse,
	IUserResponse
} from "@dv-admin/utils/types/api/apiGo";
import Cookies from "js-cookie";
import { USER, USER_ROLES } from "@dv-admin/utils/constants/user";
import { getStartDataProject } from "@dv-admin/utils/helpers/init";
import { getLocaleUser, getTimeZoneUser } from "@shared/utils/helpers/locale";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import { splitDomain } from "@shared/utils/helpers/general.ts";
import type { IProfileUserChangeEmail } from "@dv-admin/utils/types/schemas";

const { notify } = useNotifications();

export const useAuthStore = defineStore("auth", () => {
	const router = useRouter();
	const isLoggedIn = ref<boolean>(!!Cookies.get(USER.TOKEN_KEY_LS));
	const isLoading = ref<boolean>(false);
	const isLoadingOwnerData = ref<boolean>(false);
	const isLoading2fa = ref<boolean>(false);
	const user = ref<IUserResponse | null>(null);
	const userData2Fa = ref({} as IUser2FaResponse);
	const ownerData = ref<IOwnerDataResponse | null>(null);
	const verificationCode2Fa = ref<string>("");
	const resetEmail = ref<string | null>(null);
	const isCodeEntryMode = ref<boolean>(false);
	const isShowMainLoader = ref<boolean>(false);
	const myDvAuthLink = ref<string>("");

	const isRootUser = computed<boolean>(() => {
		if (!user.value) return false;
		return user.value.roles.includes(USER_ROLES.ROOT);
	});

	const isConfirmSeedUser = computed<boolean>(() => {
		if (!user.value) return false;
		return Boolean(user.value.processing_owner_id);
	});

	// Authorization
	const login = async (body: ISignInRequest) => {
		try {
			isLoading.value = true;
			const token = await postAuthUser(body);
			setToken(token, body.remember_me);
			await initStore();
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};
	const registration = async (form: ISignUpRequest) => {
		try {
			isLoading.value = true;
			isShowMainLoader.value = true;
			form.location = getTimeZoneUser() || "Europe/Moscow";
			form.language = getLocaleUser() || "en";
			const token = await postRegisterUser(form);
			setToken(token);
			await getUser();
			await router.push({ name: "confirmation-mnemonics" });
		} catch (error: any) {
			isShowMainLoader.value = false;
			throw error;
		} finally {
			isLoading.value = false;
		}
	};
	const initStore = async () => {
		try {
			if (router.currentRoute.value.path.includes("installer")) return;
			if (!user.value) await getUser();
			if (!isConfirmSeedUser.value) return;
			void getStartDataProject();
		} catch (error: any) {
			removeToken();
			throw error;
		}
	};
	const logout = () => {
		try {
			removeToken();
		} catch (error: any) {
			throw error;
		}
	};
	const getToken = (): string | null => {
		const token: string | undefined = Cookies.get(USER.TOKEN_KEY_LS);
		return token || null;
	};
	const setToken = (token: string, isRememberMe?: boolean): void => {
		Cookies.set(USER.TOKEN_KEY_LS, token, {
			expires: isRememberMe ? 365 * 20 : 1,
			secure: false
		});
	};
	const removeToken = () => {
		Cookies.remove(USER.TOKEN_KEY_LS);
		isLoggedIn.value = false;
		window.location.href = "/";
	};

	// Endpoints related to email and password changes
	const postForgotPassword = async (email: string) => {
		try {
			isLoading.value = true;
			await postApiForgotPassword(email);
			resetEmail.value = email;
			await router.push({ name: "set-new-password" });
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const postUserChangeEmail = async ({ code, email }: IProfileUserChangeEmail) => {
		try {
			await postApiUserChangeEmail({ code, new_email: email, new_email_confirmation: email });
		} catch (error: any) {
			throw error;
		}
	};

	const postUserEmailConfirmation = async (code: number | null) => {
		try {
			await postApiUserEmailConfirmation(code);
			localStorage.removeItem(USER.EMAIL_CODE_LAST_SENT_AT);
		} catch (error: any) {
			throw error;
		}
	};

	// Endpoints related to user
	const getUser = async () => {
		try {
			const data = await getApiUser();
			if (data) {
				user.value = data;
				isLoggedIn.value = !!user.value;
			}
		} catch (error: any) {
			throw error;
		}
	};
	const getOwnerData = async () => {
		try {
			isLoadingOwnerData.value = true;
			const data = await getApiOwnerData();
			if (data) ownerData.value = data;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingOwnerData.value = false;
		}
	};
	const setOwnerDataPolling = async () => {
		try {
			await getOwnerData();
			setTimeout(setOwnerDataPolling, 10_000);
		} catch (error: any) {
			console.error(error);
		}
	};
	const putUser = async (message: string) => {
		try {
			if (!user.value) return;
			const data = await putApiUser(user.value);
			if (data) user.value = data;
			notify(message, "success");
		} catch (error: any) {
			throw error;
		}
	};
	const getInfoUser2Fa = async () => {
		try {
			const data = await getApiInfoUser2Fa();
			if (data) userData2Fa.value = data;
		} catch (error: any) {
			throw error;
		}
	};
	const postUser2FaChange = async () => {
		try {
			isLoading2fa.value = true;
			const body: IUser2FaRequest = {
				otp: verificationCode2Fa.value
			};
			userData2Fa.value?.is_confirmed ? await postApiUser2FaDisable(body) : await postApiUser2FaConfirm(body);
			await getInfoUser2Fa();
			verificationCode2Fa.value = "";
			isCodeEntryMode.value = false;
		} catch (error: any) {
			throw error;
		} finally {
			isLoading2fa.value = false;
		}
	};

	const getMyDvAuthLink = async () => {
		try {
			isLoading.value = true;
			if (!ownerData.value) return;
			if (!myDvAuthLink.value) {
				myDvAuthLink.value = await getApiMyDvAuthLink();
			}
			if (ownerData.value.is_authorized) {
				window.open(splitDomain(myDvAuthLink.value)?.base, "_blank");
			} else {
				if (myDvAuthLink.value) window.open(myDvAuthLink.value, "_blank");
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	return {
		user,
		isLoading2fa,
		isConfirmSeedUser,
		userData2Fa,
		verificationCode2Fa,
		isLoggedIn,
		isLoading,
		isLoadingOwnerData,
		isCodeEntryMode,
		ownerData,
		resetEmail,
		isShowMainLoader,
		isRootUser,
		getToken,
		postForgotPassword,
		postUser2FaChange,
		getInfoUser2Fa,
		postUserChangeEmail,
		putUser,
		setToken,
		removeToken,
		initStore,
		login,
		registration,
		logout,
		getOwnerData,
		getUser,
		postUserEmailConfirmation,
		getMyDvAuthLink,
		setOwnerDataPolling
	};
});
