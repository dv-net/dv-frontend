<script setup lang="ts">
	import { UiButton, UiInput, UiLink, UiForm, UiFormItem } from "@dv.net/ui-kit/dist";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { computed, ref } from "vue";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import type { ISignUpRequest } from "@dv-admin/utils/types/api/apiGo";
	import { storeToRefs } from "pinia";
	import { EMAIL_REGEX } from "@shared/utils/constants/regex";
	import { useRouter } from "vue-router";
	import VueTurnstile from "vue-turnstile";
	import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";
	import { useI18n } from "vue-i18n";
	import { LottieAnimation } from "lottie-web-vue";
	import registrationAnimation from "@dv-admin/assets/animations/register-white.json";
	import { loginAnimation } from "@dv.net/ui-kit/dist/helpers/animations-list";

	const { isLoading } = storeToRefs(useAuthStore());
	const { userRootSystemInfo } = storeToRefs(useSystemSettingsStore());
	const { registration } = useAuthStore();

	const router = useRouter();
	const { t } = useI18n();

	const formRef = ref<HTMLFormElement | null>(null);
	const formError = ref<string>("");
	const loginAnimationRef = ref();
	const form = ref<ISignUpRequest & { "cf-turnstile-response": string }>({
		email: "",
		password: "",
		password_confirmation: "",
		"cf-turnstile-response": ""
	});

	const rulesForm = computed<UiFormRules>(() => {
		return {
			email: [{ validator: () => EMAIL_REGEX.test(form.value.email), message: t("Email must be valid") }],
			password: [
				{
					validator: () => form.value.password.length >= 8,
					message: t("Minimum 8 characters")
				},
				{
					validator: () => form.value.password.length <= 32,
					message: t("Maximum 32 characters")
				}
			],
			password_confirmation: [
				{
					validator: () =>
						!!form.value.password_confirmation && form.value.password === form.value.password_confirmation,
					message: t("Passwords must match")
				}
			],
			captcha: [
				{
					validator: () =>
						!userRootSystemInfo.value?.is_captcha_enabled || Boolean(form.value["cf-turnstile-response"]),
					message: t("Pass captcha")
				}
			]
		};
	});

	const handleSubmit = async () => {
		if (!formRef.value || !(await formRef.value.validate())) return;
		const payload: ISignUpRequest = { ...form.value };
		if (!userRootSystemInfo.value?.is_captcha_enabled) delete payload["cf-turnstile-response"];
		await registration(payload);
	};
</script>

<template>
	<ui-form ref="formRef" class="auth-form" :rules="rulesForm" :model="form" @submit.prevent="handleSubmit">
		<ui-form-item :error="formError" :label="$t('Email')" name="email">
			<ui-input :placeholder="$t('Enter Email')" size="lg" filled v-model="form.email" />
		</ui-form-item>

		<ui-form-item :error="formError" :label="$t('Password')" name="password">
			<ui-input
				id="password"
				name="password"
				type="password"
				autocomplete="new-password"
				v-model="form.password"
				:placeholder="$t('Enter password')"
				size="lg"
				showPassword
				filled
			/>
		</ui-form-item>

		<ui-form-item :error="formError" :label="$t('Repeat password')" name="password_confirmation">
			<ui-input
				id="password"
				name="password"
				type="password"
				autocomplete="new-password"
				v-model="form.password_confirmation"
				:placeholder="$t('Repeat password')"
				size="lg"
				showPassword
				filled
			/>
		</ui-form-item>

		<ui-form-item>
			<p class="checkbox-text">
				{{ $t("By continuing registration you agree to") }} <br />
				<ui-link href="https://dv.net/files/End-User-Agreement.pdf" target="_blank">{{ $t("Terms of Use") }}</ui-link>
				{{ $t("and") }}
				<ui-link href="https://dv.net/files/Privacy-Policy.pdf" target="_blank">{{ $t("Privacy Policy") }}</ui-link>
			</p>
		</ui-form-item>

		<ui-form-item v-if="userRootSystemInfo?.is_captcha_enabled" :error="formError" name="captcha">
			<div class="center">
				<vue-turnstile :site-key="userRootSystemInfo.site_key" v-model="form['cf-turnstile-response']" />
			</div>
		</ui-form-item>

		<div class="auth-form__buttons">
			<ui-button mode="neutral" size="xxl" native-type="submit" :loading="isLoading">
				<lottie-animation
					v-show="registrationAnimation"
					:animation-data="registrationAnimation"
					class="reg-animation"
					:auto-play="false"
					:loop="false"
				/>
				<span class="text-animation">{{ $t("Sign up") }}</span>
			</ui-button>
			<ui-button
				type="outline"
				mode="neutral"
				size="xxl"
				:disabled="isLoading"
				@click="loginAnimationRef.play()"
			>
				<lottie-animation
					:animation-data="loginAnimation"
					class="reg-animation"
					ref="loginAnimationRef"
					@complete="router.push({ name: 'sign-in' })"
					:auto-play="false"
					:loop="false"
				/>
				<span class="text-animation">{{ $t("Login to account") }}</span>
			</ui-button>
		</div>
	</ui-form>
</template>
