<script setup lang="ts">
	import { UiButton, UiForm, UiFormItem, UiInput } from "@dv.net/ui-kit";
	import { computed, ref } from "vue";
	import { EMAIL_REGEX } from "@shared/utils/constants/regex";
	import { useRouter } from "vue-router";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { storeToRefs } from "pinia";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";

	const router = useRouter();
	const { isLoading } = storeToRefs(useAuthStore());
	const { postForgotPassword } = useAuthStore();

	const { t } = useI18n();

	const formRef = ref<HTMLFormElement | null>(null);
	const form = ref({ email: "" });
	const formError = ref<string>("");

	const rulesForm = computed<UiFormRules>(() => {
		return { email: [{ validator: () => EMAIL_REGEX.test(form.value.email), message: t("Email must be valid") }] };
	});

	const handleSubmit = async () => {
		if (!formRef.value || !(await formRef.value.validate())) return;
		await postForgotPassword(form.value.email);
	};
</script>

<template>
	<ui-form ref="formRef" class="auth-form" :rules="rulesForm" :model="form" @submit.prevent="handleSubmit">
		<ui-form-item :error="formError" :label="$t('E-mail')" name="email">
			<ui-input :placeholder="$t('Enter Email')" size="lg" filled v-model="form.email" />
		</ui-form-item>

		<div class="auth-form__buttons row">
			<ui-button mode="neutral" size="xxl" native-type="submit" :loading="isLoading">
				{{ $t("Recover password") }}
			</ui-button>
			<ui-button type="outline" mode="neutral" size="xxl" @click="router.push({ name: 'sign-in' })">
				{{ $t("Login to account") }}
			</ui-button>
		</div>
	</ui-form>
</template>
