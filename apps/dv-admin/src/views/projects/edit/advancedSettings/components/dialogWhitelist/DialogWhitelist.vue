<script setup lang="ts">
	import { UiButton, UiForm, UiFormItem, UiInput, UiModal } from "@dv.net/ui-kit/dist";
	import { computed, ref } from "vue";
	import { useWhiteListProjectStore } from "@dv-admin/stores/projects/whiteList";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";
	import { IP_V4_REGEX } from "@shared/utils/constants/regex";
	import type { IWhitelistsPatchRequest } from "@dv-admin/utils/types/api/apiGo.ts";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";

	const { patchWhitelistsProject } = useWhiteListProjectStore();
	const { t } = useI18n();
	const { notify } = useNotifications();

	const { uuid } = defineProps<{ uuid: string }>();

	const isOpen = defineModel<boolean>("isOpen", { required: true, default: false });
	const isLoadingAddIpWhitelist = ref<boolean>(false);
	const formRef = ref<HTMLFormElement | null>(null);
	const whitelist = ref<IWhitelistsPatchRequest>({ ip: null });

	const rulesForm = computed<UiFormRules>(() => {
		return {
			ip: [
				{ required: true, message: t("Please enter a valid IP address") },
				{
					validator: () => (whitelist.value.ip ? IP_V4_REGEX.test(whitelist.value.ip) : false),
					message: t("Please enter a valid IP address")
				}
			]
		};
	});

	const handleAddIpWhitelist = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			isLoadingAddIpWhitelist.value = true;
			await patchWhitelistsProject(uuid, whitelist.value.ip!);
			whitelist.value.ip = null;
			isOpen.value = false;
			notify(t("IP address added to whitelist"), "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingAddIpWhitelist.value = false;
		}
	};
</script>

<template>
	<ui-modal v-model="isOpen" width="600">
		<ui-form
			ref="formRef"
			:rules="rulesForm"
			:model="whitelist"
			class="flex flex-column"
			@submit.prevent="handleAddIpWhitelist"
		>
			<h2 class="global-title-h2 mb-32">{{ $t("Adding an IP to the whitelist") }}</h2>
			<ui-form-item name="ip" :label="$t('IP address')">
				<ui-input v-model="whitelist.ip" is-empty-value-null placeholder="255.255.255.255" size="lg" />
			</ui-form-item>
			<ui-button mode="neutral" size="xl" native-type="submit" :loading="isLoadingAddIpWhitelist">
				{{ $t("Add") }} IP
			</ui-button>
		</ui-form>
	</ui-modal>
</template>
