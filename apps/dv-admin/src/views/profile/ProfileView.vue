<script setup lang="ts">
	import { UiBlockTitle } from "@dv.net/ui-kit/dist";
	import { ref } from "vue";
	import type { IUBlockTitleLinks } from "@dv-admin/utils/types/general";

	const links = ref<IUBlockTitleLinks[]>([
		{ path: `/profile/personal-data`, title: "Email, password and 2FA" },
		{ path: `/profile/settings`, title: "Profile" },
		{ path: `/profile/notifications`, title: "Notifications" }
	]);
</script>

<template>
	<div class="page">
		<ui-block-title :title="$t('Settings.plural')" :links="links.map((item) => ({ ...item, title: $t(item.title) }))" />
		<router-view />
	</div>
</template>
