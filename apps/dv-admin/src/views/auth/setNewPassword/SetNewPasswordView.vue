<script setup lang="ts">
	import { UiButton, UiForm, UiFormItem, UiInput } from "@dv.net/ui-kit";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { storeToRefs } from "pinia";
	import { computed, onMounted, onUnmounted, ref } from "vue";
	import type { IResetPasswordRequest } from "@dv-admin/utils/types/api/apiGo";
	import { useRouter } from "vue-router";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";
	import { postApiResetPassword } from "@dv-admin/services/api/auth";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";

	const router = useRouter();
	const { notify } = useNotifications();
	const { t } = useI18n();
	const { isLoading, resetEmail } = storeToRefs(useAuthStore());

	const formRef = ref<HTMLFormElement | null>(null);
	const form = ref<IResetPasswordRequest>({
		code: null,
		password: "",
		password_confirmation: ""
	});
	const formError = ref<string>("");

	const rulesForm = computed<UiFormRules>(() => {
		return {
			code: [{ validator: () => String(form.value.code).length >= 6, message: t("Enter the code from email") }],
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
			]
		};
	});

	const handleSubmit = async () => {
		if (!formRef.value || !(await formRef.value.validate())) return;
		await postResetPassword(form.value);
	};

	const postResetPassword = async (body: IResetPasswordRequest) => {
		try {
			isLoading.value = true;
			if (!resetEmail.value) {
				return await router.push({ name: "reset-password" });
			}
			await postApiResetPassword({ ...body, email: resetEmail.value });
			await router.push({ name: "sign-in" });
			notify(t("Password successfully changed, login to your account"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	onMounted(async () => {
		if (!resetEmail.value) {
			return await router.push({ name: "reset-password" });
		}
	});

	onUnmounted(() => {
		resetEmail.value = null;
	});
</script>

<template>
	<ui-form ref="formRef" class="auth-form" :rules="rulesForm" :model="form" @submit.prevent="handleSubmit">
		<ui-form-item :error="formError" :label="$t('Code')" name="code">
			<ui-input type="number" :placeholder="$t('Enter the code from email')" size="lg" filled v-model="form.code" />
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

		<div class="auth-form__buttons row">
			<ui-button mode="neutral" native-type="submit" size="xxl" :loading="isLoading">
				{{ $t("Change password") }}
			</ui-button>
			<ui-button type="outline" mode="neutral" size="xxl" @click="router.push({ name: 'sign-in' })">
				{{ $t("Login to account") }}
			</ui-button>
		</div>
	</ui-form>
</template>
