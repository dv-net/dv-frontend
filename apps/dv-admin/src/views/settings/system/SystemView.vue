<script setup lang="ts">
	import { computed, markRaw, onMounted } from "vue";
	import IconGeneral from "@dv-admin/components/icons/systemSettings/IconGeneral.vue";
	import { useI18n } from "vue-i18n";
	import IconMail from "@dv-admin/components/icons/systemSettings/IconMail.vue";
	import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import type { ISettingsItem } from "@dv-admin/utils/types/general";
	import ListInfoItem from "@dv-admin/components/common/listInfoItem/ListInfoItem.vue";
	// import IconProcessing from "@dv-admin/components/icons/systemSettings/IconProcessing.vue";
	import IconSystem from "@dv-admin/components/icons/systemSettings/IconSystem.vue";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { storeToRefs } from "pinia";

	const { t } = useI18n();
	const { getRootSettings } = useSystemSettingsStore();
	const { isRootUser } = storeToRefs(useAuthStore());

	const settings = computed<ISettingsItem[]>(() => [
		{
			id: 1,
			isShow: true,
			icon: markRaw(IconGeneral),
			title: t("General settings"),
			text: t(
				"In this section you can configure general settings for your merchant: enable or disable registration of new clients, specify the merchant domain and change other key settings"
			),
			textBtn: t("Set"),
			path: "/settings/system/general"
		},
		// {
		// 	id: 2,
		//  isShow: true,
		// 	icon: markRaw(IconProcessing),
		// 	title: t("Processing settings"),
		// 	text,
		// 	textBtn: t("Set"),
		// 	path: "/settings/system/processing"
		// },
		{
			id: 3,
			isShow: isRootUser.value,
			icon: markRaw(IconMail),
			title: t("Email settings"),
			text: t("Specify how you will send emails to your payers"),
			textBtn: t("Set"),
			path: "/settings/system/mail"
		},
		{
			id: 4,
			isShow: isRootUser.value,
			icon: markRaw(IconSystem),
			title: t("Update.noun"),
			text: t("Ability to configure automatic project update to the latest version"),
			textBtn: t("Set"),
			path: "/settings/system/update"
		}
	]);

	onMounted(async () => {
		if (isRootUser.value) await getRootSettings();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Settings')" back-name-route="settings" />
		<h1 class="global-title-h2 mt-24 mb-32">
			{{ $t("System settings") }}
		</h1>
		<div class="flex flex-column gap-24">
			<list-info-item v-for="item in settings" :key="item.id" :setting="item" />
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
	}
</style>
