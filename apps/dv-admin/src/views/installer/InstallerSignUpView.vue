<script setup lang="ts">
	import { UiButton, UiInput } from "@dv.net/ui-kit/dist";
	import { computed, ref } from "vue";
	import type { ISignUpRequest } from "@dv-admin/utils/types/api/apiGo";
	import { EMAIL_REGEX } from "@shared/utils/constants/regex";
	import { storeToRefs } from "pinia";
	import { useInstallerStore } from "@dv-admin/stores/installer";
	import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";
	import { UiForm, UiFormItem, UiLink } from "@dv.net/ui-kit";
	import termsFile from "@dv-admin/assets/docs/End-User-Agreement.pdf";
	import policyFile from "@dv-admin/assets/docs/Privacy-Policy.pdf";

	const { t } = useI18n();

	const { isLoading } = storeToRefs(useInstallerStore());
	const { userRootSystemInfo } = storeToRefs(useSystemSettingsStore());
	const { registrationInstaller, loginInstaller } = useInstallerStore();

	const formRef = ref<HTMLFormElement | null>(null);
	const formError = ref<string>("");
	const form = ref<Omit<ISignUpRequest, "terms" | "cf-turnstile-response">>({
		email: "",
		password: "",
		password_confirmation: ""
	});

	const isAuthentication = computed<boolean>(() => !!userRootSystemInfo.value?.root_user_exists);

	const rulesForm = computed<UiFormRules>(() => {
		const baseRules = {
			email: [{ validator: () => EMAIL_REGEX.test(form.value.email), message: t("Email must be valid") }],
			password: [
				{ validator: () => form.value.password.length >= 8, message: t("Minimum 8 characters") },
				{ validator: () => form.value.password.length <= 32, message: t("Maximum 32 characters") }
			]
		};
		if (isAuthentication.value) {
			return baseRules as UiFormRules;
		} else {
			return {
				...baseRules,
				password_confirmation: [
					{
						validator: () => form.value.password === form.value.password_confirmation,
						message: t("Passwords must match")
					}
				]
			};
		}
	});

	const handleSubmitForm = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			if (isAuthentication.value) {
				await loginInstaller(form.value);
			} else {
				await registrationInstaller(form.value);
			}
		} catch (error: any) {
			console.error(error);
		}
	};
</script>

<template>
	<div class="page">
		<div class="page__inner">
			<h1 class="page__title">
				{{ isAuthentication ? $t("Log in") : $t("Create a system administrator") }}
			</h1>
			<ui-form ref="formRef" :rules="rulesForm" :model="form" class="w-full" @submit.prevent="handleSubmitForm">
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
				<ui-form-item
					v-if="!isAuthentication"
					:error="formError"
					:label="$t('Repeat password')"
					name="password_confirmation"
				>
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
						<ui-link :href="termsFile" target="_blank">{{ $t("Terms of Use") }}</ui-link>
						{{ $t("and") }}
						<ui-link :href="policyFile" target="_blank">{{ $t("Privacy Policy") }}</ui-link>
					</p>
				</ui-form-item>
				<ui-button class="mt-8 w-full" native-type="submit" mode="neutral" size="xxl" :loading="isLoading">
					{{ $t("Next") }}
				</ui-button>
			</ui-form>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		&__inner {
			display: flex;
			align-items: center;
			flex-direction: column;
			gap: 40px;
			max-width: 506px;
			width: 100%;
		}
		&__title {
			text-align: center;
			color: $black;
			font-size: 40px;
			font-weight: 700;
			line-height: 48px;
		}
	}
</style>
