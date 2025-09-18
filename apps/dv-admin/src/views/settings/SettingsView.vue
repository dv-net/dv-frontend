<script setup lang="ts">
	import { computed, markRaw } from "vue";
	import type { ISettingsItem } from "@dv-admin/utils/types/general";
	import { useI18n } from "vue-i18n";
	import IconKey from "@dv-admin/components/icons/systemSettings/IconKey.vue";
	import IconSystem from "@dv-admin/components/icons/systemSettings/IconSystem.vue";
	import IconExchange from "@dv-admin/components/icons/systemSettings/IconExchange.vue";
	import ListInfoItem from "@dv-admin/components/common/listInfoItem/ListInfoItem.vue";
	import { storeToRefs } from "pinia";
	import { useAuthStore } from "@dv-admin/stores/auth";

	const { t } = useI18n();

	const { isRootUser } = storeToRefs(useAuthStore());

	const settingsList = computed<ISettingsItem[]>(() => [
		// {
		// 	id: 1,
		// 	icon: markRaw(IconUsers),
		// 	title: t("Users"),
		//  text: t('Configure the level of rights for registered users'),
		// 	textBtn: t("Read more"),
		// 	path: "/settings/users"
		// },
		{
			id: 2,
			isShow: isRootUser.value,
			icon: markRaw(IconKey),
			title: t("Logs"),
			text: t("The current status of your services is displayed here"),
			textBtn: t("Read more"),
			path: "/settings/logs"
		},
		{
			id: 3,
			isShow: true,
			icon: markRaw(IconSystem),
			title: t("System"),
			text: t(
				"You can edit system settings - change the application domain and payment methods, enable or suspend withdrawals and manage other functions"
			),
			textBtn: t("Read more"),
			path: "/settings/system"
		},
		{
			id: 4,
			isShow: true,
			icon: markRaw(IconExchange),
			title: t("Exchange rates"),
			text: t(
				"Here you can select the source of the exchange rate and the amount of the adjustment. You can lower the cryptocurrency rates by a few percent, which will allow you to compensate for rate fluctuations and cover withdrawal fees"
			),
			textBtn: t("Read more"),
			path: "/settings/exchange-rates"
		}
	]);
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("Settings") }}</h1>
		<div class="flex flex-column gap-24">
			<list-info-item v-for="item in settingsList" :key="item.id" :setting="item" />
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}
</style>
