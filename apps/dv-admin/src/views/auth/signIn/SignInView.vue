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
	import { storeToRefs } from "pinia";
	import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";
	import RoundedLoginButton from "@dv-admin/views/auth/signIn/components/RoundedLoginButton.vue";

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
	const loginButtonRef = ref<InstanceType<typeof RoundedLoginButton> | null>(null);

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
			if (isLoading.value || loginButtonRef.value?.isAnimating) return;
			formError.value = "";

			await login(form.value);
			await loginButtonRef.value?.playSuccess();
			await router.push({ name: quickStartGuideSetting.value?.value === "completed" ? "dashboard" : "quick-start" });
		} catch (error: any) {
			console.error(error);
			await loginButtonRef.value?.playError();

			if (error.response?.data?.errors[0]?.message === "no matches found") formError.value = t("No matches found");
		}
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
		if (!formRef.value || !(await formRef.value.validate()) || loginButtonRef.value?.isAnimating) return;
		await loginHandler();
	};

	onMounted(demoDvNetLogin);
</script>

<template>
	<ui-form ref="formRef" class="auth-form" :rules="rulesForm" :model="form" @submit.prevent="handleSubmit">
		<ui-form-item :error="formError" :label="$t('Email')" name="email">
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
			<RoundedLoginButton ref="loginButtonRef" class="auth-form__login-button" :disabled="isLoading" />

			<ui-button
				v-if="userRootSystemInfo?.registration_state === 'enabled'"
				type="outline"
				@click="registrationAnimationRef.play()"
				size="xxl"
				mode="neutral"
				:disabled="isLoading || Boolean(loginButtonRef?.isAnimating)"
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
