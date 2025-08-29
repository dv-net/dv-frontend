<script setup lang="ts">
	import { UiInput, UiButton, UiLink } from "@dv.net/ui-kit/dist";
	import { computed, onMounted, ref } from "vue";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import type { ISignInRequest } from "@dv-admin/utils/types/api/apiGo";
	import { EMAIL_REGEX } from "@shared/utils/constants/regex";
	import { useRouter } from "vue-router";
	import { UiCheckbox, UiForm, UiFormItem } from "@dv.net/ui-kit";
	import { LottieAnimation } from "lottie-web-vue";
	import registrationAnimation from "@dv-admin/assets/animations/registration.json";
	import successLoginLogoAnimation from "@dv-admin/assets/animations/success-login-logo.json";
	import successLoginBorderAnimation from "@dv-admin/assets/animations/success-login-border.json";
	import errorLoginLogoAnimation from "@dv-admin/assets/animations/error-login-logo.json";
	import errorLoginBorderAnimation from "@dv-admin/assets/animations/error-login-border.json";
	import { storeToRefs } from "pinia";
	import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";

	const { login } = useAuthStore();
	const { isShowMainLoader, isLoading } = storeToRefs(useAuthStore());
	const { userRootSystemInfo } = storeToRefs(useSystemSettingsStore());
	const { quickStartGuideSetting } = storeToRefs(useUserSettingsStore());
	const router = useRouter();
	const { t } = useI18n();

	const formRef = ref<HTMLFormElement | null>(null);
	const form = ref<ISignInRequest>({ email: "", password: "", remember_me: true });
	const formError = ref<string>("");
	const registrationAnimationRef = ref();
	const loginBorderSuccessAnimationRef = ref();
	const loginLogoSuccessAnimationRef = ref();
	const loginBorderErrorAnimationRef = ref();
	const loginLogoErrorAnimationRef = ref();
	const isShowLoginSuccessAnimation = ref<boolean>(true);
	const loginButtonTextState = ref<number>(0);

	const rulesForm = computed<UiFormRules>(() => {
		return {
			email: [{ validator: () => EMAIL_REGEX.test(form.value.email), message: t("Email must be valid") }],
			password: [
				{ validator: () => form.value.password.length >= 8, message: t("Minimum 8 characters") },
				{ validator: () => form.value.password.length <= 32, message: t("Maximum 32 characters") }
			]
		};
	});

	const loginHandler = async () => {
		try {
			if (isLoading.value || loginButtonTextState.value !== 0) return;
			formError.value = "";

			await login(form.value);
			isShowLoginSuccessAnimation.value = true;
			loginBorderSuccessAnimationRef.value.play();
			loginLogoSuccessAnimationRef.value.play();
			loginButtonTextState.value = 1;
		} catch (error: any) {
			console.error(error);
			isShowLoginSuccessAnimation.value = false;
			loginBorderErrorAnimationRef.value.play();
			loginLogoErrorAnimationRef.value.play();
			loginButtonTextState.value = 2;

			if (error.response?.data?.errors[0]?.message === "no matches found") formError.value = t("No matches found");
		}
	};

	const successLoginCompleteHandler = async () => {
		await router.push({ name: quickStartGuideSetting.value?.value === "completed" ? "dashboard" : "quick-start" });
	};

	const errorLoginCompleteHandler = () => {
		setTimeout(() => {
			isShowLoginSuccessAnimation.value = true;
			loginBorderErrorAnimationRef.value.goToAndStop(0);
			loginLogoErrorAnimationRef.value.goToAndStop(0);
			loginButtonTextState.value = 0;
		}, 2000);
	};

	const demoDvNetLogin = async () => {
		if (location.host === "demo.dv.net") {
			isShowMainLoader.value = true;
			try {
				await login({ email: "demo@dv.net", password: "demo@dv.net" });
				await router.push({ name: "dashboard" });
			} catch (error: any) {
				console.error(error);
				return router.push({ name: "sign-in" });
			} finally {
				isShowMainLoader.value = false;
			}
		}
	};

	const handleSubmit = async () => {
		if (!formRef.value || !(await formRef.value.validate())) return;
		await loginHandler();
	};

	onMounted(demoDvNetLogin);
</script>

<template>
	<ui-form ref="formRef" class="auth-form" :rules="rulesForm" :model="form" @submit.prevent="handleSubmit">
		<ui-form-item :error="formError" :label="$t('E-mail')" name="email">
			<ui-input :placeholder="$t('Enter Email')" size="lg" filled v-model="form.email" />
		</ui-form-item>

		<ui-form-item :label="$t('Password')" name="password" class="with-link">
			<ui-link :to="{ name: 'reset-password' }" tabindex="-1" poperClass="forgot-password-link">
				{{ $t("Forgot your password") }}?
			</ui-link>
			<ui-input
				id="password"
				name="password"
				v-model="form.password"
				:placeholder="$t('Enter password')"
				size="lg"
				type="password"
				showPassword
				filled
			/>
		</ui-form-item>

		<ui-checkbox v-model="form.remember_me!" size="sm" class="mb-24">
			<p class="checkbox-text">
				{{ $t("Remember me") }}
			</p>
		</ui-checkbox>

		<div class="auth-form__buttons">
			<ui-button mode="neutral" size="xxl" nativeType="submit" class="auth-form__login-button">
				<lottie-animation
					v-show="successLoginLogoAnimation && isShowLoginSuccessAnimation"
					:animation-data="successLoginLogoAnimation"
					ref="loginLogoSuccessAnimationRef"
					@complete="successLoginCompleteHandler"
					:auto-play="false"
					:loop="false"
				/>

				<lottie-animation
					v-show="successLoginBorderAnimation && loginButtonTextState === 1 && isShowLoginSuccessAnimation"
					:animation-data="successLoginBorderAnimation"
					class="absolute login-animation-border"
					ref="loginBorderSuccessAnimationRef"
					@complete="successLoginCompleteHandler"
					:auto-play="false"
					:loop="false"
				/>

				<lottie-animation
					v-show="errorLoginLogoAnimation && loginButtonTextState === 2"
					:animation-data="errorLoginLogoAnimation"
					ref="loginLogoErrorAnimationRef"
					@complete="errorLoginCompleteHandler"
					:auto-play="false"
					:loop="false"
				/>

				<lottie-animation
					v-show="errorLoginBorderAnimation && loginButtonTextState === 2"
					class="login-animation-border"
					:animation-data="errorLoginBorderAnimation"
					ref="loginBorderErrorAnimationRef"
					@complete="errorLoginCompleteHandler"
					:auto-play="false"
					:loop="false"
				/>

				<span class="text-animation">
					<span class="text-animation" v-if="loginButtonTextState === 0">{{ $t("Login to account") }}</span>
					<span class="text-animation" v-else-if="loginButtonTextState === 1">{{ $t("Success. Redirecting") }}...</span>
					<span class="text-animation" v-else-if="loginButtonTextState === 2">{{ $t("Error") }}</span>
				</span>
			</ui-button>

			<ui-button
				v-if="userRootSystemInfo?.registration_state === 'enabled'"
				type="outline"
				@click="registrationAnimationRef.play()"
				size="xxl"
				mode="neutral"
				:disabled="isLoading || loginButtonTextState !== 0"
			>
				<lottie-animation
					v-show="registrationAnimation"
					:animation-data="registrationAnimation"
					class="reg-animation"
					ref="registrationAnimationRef"
					@complete="router.push({ name: 'sign-up' })"
					:auto-play="false"
					:loop="false"
				/>
				<span class="text-animation">{{ $t("Create an account") }}</span>
			</ui-button>
		</div>
	</ui-form>
</template>
