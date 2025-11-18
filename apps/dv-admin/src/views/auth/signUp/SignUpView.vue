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

	const { isLoading } = storeToRefs(useAuthStore());
	const { userRootSystemInfo } = storeToRefs(useSystemSettingsStore());
	const { registration } = useAuthStore();

	const router = useRouter();
	const { t } = useI18n();

	const formRef = ref<HTMLFormElement | null>(null);
	const formError = ref<string>("");
	const form = ref<ISignUpRequest>({
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
						Boolean(userRootSystemInfo.value?.is_captcha_enabled && !form.value["cf-turnstile-response"]),
					required: true,
					message: t("Pass captcha")
				}
			]
		};
	});

	const handleSubmit = async () => {
		if (!formRef.value || !(await formRef.value.validate())) return;
		await registration(form.value);
	};
</script>

<template>
	<ui-form ref="formRef" class="auth-form" :rules="rulesForm" :model="form" @submit.prevent="handleSubmit">
		<ui-form-item :error="formError" :label="$t('E-mail')" name="email">
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

		<div class="auth-form__buttons row">
			<ui-button mode="neutral" size="xxl" native-type="submit" :loading="isLoading">
				{{ $t("Sing up") }}
			</ui-button>
			<ui-button type="outline" mode="neutral" size="xxl" @click="router.push({ name: 'sign-in' })">
				{{ $t("Login to account") }}
			</ui-button>
		</div>
	</ui-form>
</template>
