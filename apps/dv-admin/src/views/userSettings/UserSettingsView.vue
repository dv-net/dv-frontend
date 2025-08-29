<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { onMounted } from "vue";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { storeToRefs } from "pinia";
	import { getOptionsForUiSelect } from "@shared/utils/helpers/general";
	import { UiInput, UiSelect } from "@dv.net/ui-kit";
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";
	import { USER_SETTING_LABELS } from "@dv-admin/utils/constants/settings";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { useI18n } from "vue-i18n";

	const { isLoading, userSettings } = storeToRefs(useUserSettingsStore());
	const { getUserSettings, postUserSettings } = useUserSettingsStore();

	const { t } = useI18n();

	onMounted(async () => {
		await getUserSettings();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Dashboard')" back-name-route="dashboard" />

		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Settings") }}</h1>

		<block-section :is-loading="isLoading" class="page__settings">
			<global-input
				v-for="item in userSettings"
				:title="item.name in USER_SETTING_LABELS ? USER_SETTING_LABELS[item.name] : item.name"
				:key="item.name"
			>
				<ui-select
					v-if="item.available_values && item.available_values.length"
					v-model="item.value"
					:options="getOptionsForUiSelect(item.available_values)"
					:disabled="!item.is_editable"
					@update:modelValue="postUserSettings(item, t('Saved'))"
				>
					<template #default="{ option }">
						<p>{{ option.label }}</p>
					</template>
				</ui-select>
				<ui-input
					v-else
					v-model="item.value"
					:disabled="!item.is_editable"
					@blur="postUserSettings(item, t('Saved'))"
				/>
			</global-input>
		</block-section>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		&__settings {
			display: flex;
			flex-direction: column;
			gap: 20px;
			max-width: 720px;
			width: 100%;
			min-height: 200px;
		}
	}
</style>
