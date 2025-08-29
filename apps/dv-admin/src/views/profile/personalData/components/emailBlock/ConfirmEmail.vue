<script setup lang="ts">
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";
	import { UiInput, UiLink } from "@dv.net/ui-kit";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import { useI18n } from "vue-i18n";
	import { storeToRefs } from "pinia";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { ref, onMounted } from "vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import SendCodeInfoBlock from "@dv-admin/views/profile/personalData/components/emailBlock/components/SendCodeInfoBlock.vue";
	import { useAuthEmailSectionStore } from "@dv-admin/stores/auth/authEmailSection";

	const { notify } = useNotifications();
	const { t } = useI18n();

	const { user } = storeToRefs(useAuthStore());
	const { getUser, postUserEmailConfirmation } = useAuthStore();
	const { hasEmailCodeLastSent, flagChangeEmail } = storeToRefs(useAuthEmailSectionStore());
	const { checkEmailCodeSent, resumeEmailCodeTimer, stopEmailCodeTimer, clearEmailCodeTimer } =
		useAuthEmailSectionStore();

	const isConfirming = ref<boolean>(false);
	const codeConfirmation = ref<number | null>(null);

	const handleConfirmationEmail = async () => {
		try {
			await postUserEmailConfirmation(codeConfirmation.value);
			await getUser();
			handleCancelConfirmationEmail();
			notify(t("Mail confirmed"), "success");
		} catch (error: any) {
			console.error(error);
		}
	};

	const handleSendCodeEmail = async () => {
		isConfirming.value = true;
		await checkEmailCodeSent("confirm", t("Code sent"));
	};

	const handleCancelConfirmationEmail = () => {
		isConfirming.value = false;
		codeConfirmation.value = null;
	};

	onMounted(async () => {
		if (!hasEmailCodeLastSent.value) return;
		if (flagChangeEmail) {
			flagChangeEmail.value = false;
			stopEmailCodeTimer();
			clearEmailCodeTimer();
			return;
		}
		const state = await resumeEmailCodeTimer();
		isConfirming.value = state === "resume";
	});
</script>

<template>
	<div class="flex flex-column px-24 pt-24 pb-16 gap-12">
		<global-input v-if="user" title="Email" is-no-translation>
			<block-section class="user-email-input" radius="sm">
				<div class="flex flex-x-between">
					<div>{{ user.email }}</div>

					<ui-link v-if="!isConfirming" @click.stop="handleSendCodeEmail">
						{{ $t("Confirm") }}
					</ui-link>
				</div>
			</block-section>
		</global-input>

		<template v-if="isConfirming">
			<send-code-info-block @send-code="handleSendCodeEmail" />

			<ui-input v-model="codeConfirmation" type="number" :placeholder="$t('Enter the code')" size="lg" isEmptyValueNull>
				<template #append>
					<ui-link @click.stop="handleConfirmationEmail" :disabled="codeConfirmation == null">
						{{ $t("Confirm") }}
					</ui-link>

					<ui-link @click.stop="handleCancelConfirmationEmail">
						{{ $t("Cancel.noun") }}
					</ui-link>
				</template>
			</ui-input>
		</template>
	</div>
</template>

<style scoped lang="scss">
	.block-section.user-email-input {
		padding: 16px 12px;
		font-size: 14px;
		line-height: 20px;
	}
</style>
