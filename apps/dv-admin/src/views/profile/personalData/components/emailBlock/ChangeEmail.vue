<script setup lang="ts">
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";
	import { UiInput, UiLink, UiForm, UiFormItem } from "@dv.net/ui-kit";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import { useI18n } from "vue-i18n";
	import { storeToRefs } from "pinia";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { ref, onMounted, computed } from "vue";
	import type { IProfileUserChangeEmail } from "@dv-admin/utils/types/schemas";
	import SendCodeInfoBlock from "@dv-admin/views/profile/personalData/components/emailBlock/components/SendCodeInfoBlock.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { EMAIL_REGEX } from "@shared/utils/constants/regex";
	import { useAuthEmailSectionStore } from "@dv-admin/stores/auth/authEmailSection";

	const { notify } = useNotifications();
	const { t } = useI18n();

	const { hasEmailCodeLastSent, flagChangeEmail } = storeToRefs(useAuthEmailSectionStore());
	const { checkEmailCodeSent, resumeEmailCodeTimer, clearEmailCodeTimer, stopEmailCodeTimer } =
		useAuthEmailSectionStore();
	const { user } = storeToRefs(useAuthStore());
	const { postUserChangeEmail, getUser } = useAuthStore();

	const isEditingEmail = ref<boolean>(false);
	const changeEmail = ref<IProfileUserChangeEmail>({ code: "", email: "" });
	const formRef = ref<HTMLFormElement | null>(null);

	const rulesForm = computed<UiFormRules>(() => {
		return {
			email: [{ validator: () => EMAIL_REGEX.test(changeEmail.value.email), message: t("Email must be valid") }],
			code: [{ validator: () => Boolean(changeEmail.value.code), message: t("Enter the code") }]
		};
	});

	const handleInitChangeEmail = async () => {
		try {
			await checkEmailCodeSent("change", t("Code sent"));
			if (!isEditingEmail.value) isEditingEmail.value = true;
		} catch (error: any) {
			console.error(error);
		}
	};

	const handleChangeEmail = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			await postUserChangeEmail(changeEmail.value);
			handleCancelChangeEmail();
			await getUser();
			notify(t("Email has been changed, please confirm it now"), "success");
		} catch (error: any) {
			console.error(error);
		}
	};

	const handleCancelChangeEmail = () => {
		clearEmailCodeTimer();
		stopEmailCodeTimer();
		changeEmail.value.email = "";
		changeEmail.value.code = "";
		flagChangeEmail.value = true;
		isEditingEmail.value = false;
	};

	onMounted(async () => {
		if (!hasEmailCodeLastSent.value) return;
		const state = resumeEmailCodeTimer();
		isEditingEmail.value = state === "resume";
	});
</script>

<template>
	<ui-form
		class="email-change"
		ref="formRef"
		:rules="rulesForm"
		:model="changeEmail"
		:class="{ 'pb-16': !isEditingEmail }"
	>
		<global-input v-if="user" title="Email" is-no-translation>
			<block-section v-if="!isEditingEmail" class="user-email-input" radius="sm">
				<div class="flex flex-x-between">
					<div>{{ user.email }}</div>

					<ui-link @click.stop="handleInitChangeEmail">{{ $t("Change") }}</ui-link>
				</div>
			</block-section>

			<ui-form-item v-else name="email">
				<ui-input v-model="changeEmail.email" type="email" :placeholder="$t('Enter new email')" size="lg" />
			</ui-form-item>
		</global-input>

		<template v-if="isEditingEmail">
			<send-code-info-block @send-code="handleInitChangeEmail" />

			<ui-form-item name="code" class="mt-24">
				<ui-input v-model="changeEmail.code" :placeholder="$t('Enter the code sent to your old email')" size="lg">
					<template #append>
						<ui-link @click="handleChangeEmail">{{ $t("Change") }}</ui-link>

						<ui-link @click.stop="handleCancelChangeEmail">{{ $t("Cancel.noun") }}</ui-link>
					</template>
				</ui-input>
			</ui-form-item>
		</template>
	</ui-form>
</template>

<style scoped lang="scss">
	.email-change {
		display: flex;
		flex-direction: column;
		padding: 24px 24px 0;

		&__inner {
			display: flex;
			flex-direction: column;
		}
	}

	.block-section.user-email-input {
		padding: 16px 12px;
		font-size: 14px;
		line-height: 20px;
	}
</style>
