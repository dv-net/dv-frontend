<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit";
	import { computed, ref } from "vue";
	import type { IChangePasswordRequest } from "@dv-admin/utils/types/api/apiGo";
	import { postApiUserChangePassword } from "@dv-admin/services/api/auth";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";

	const { notify } = useNotifications();
	const { t } = useI18n();

	const props = defineProps<{ cancel: (save?: boolean) => void }>();

	const currentStep = defineModel("currentStep", { default: 0 });
	const passwords = defineModel<IChangePasswordRequest>("passwords", { default: {} });

	const isLoading = ref<boolean>(false);

	const disabledChangePassword = computed<boolean>(
		() =>
			passwords.value.password_new.length < 8 || passwords.value.password_new !== passwords.value.password_confirmation
	);

	const handleChangePassword = async () => {
		try {
			isLoading.value = true;
			await postApiUserChangePassword(passwords.value);
			props.cancel(true);
			notify(t("Password changed"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};
</script>

<template>
	<div class="flex flex-y-center">
		<ui-button
			v-if="currentStep < 2"
			type="tertiary"
			@click="currentStep++"
			size="sm"
			:disabled="
				(currentStep === 0 && passwords.password_old.length < 8) ||
				(currentStep === 1 && passwords.password_new.length < 8)
			"
		>
			{{ $t("Next") }}
		</ui-button>
		<ui-button
			v-else
			type="tertiary"
			@click="handleChangePassword"
			size="sm"
			:disabled="disabledChangePassword"
			:loading="isLoading"
		>
			{{ $t("Save") }}
		</ui-button>
		<ui-button type="tertiary" @click="cancel()" size="sm">
			{{ $t(currentStep === 0 ? "Cancel.noun" : "Back") }}
		</ui-button>
	</div>
</template>

<style scoped lang="scss"></style>
