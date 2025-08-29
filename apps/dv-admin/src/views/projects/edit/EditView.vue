<script setup lang="ts">
	import { UiBlockTitle } from "@dv.net/ui-kit/dist";
	import { useRoute } from "vue-router";
	import { onMounted, onUnmounted, ref } from "vue";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import type { IUBlockTitleLinks } from "@dv-admin/utils/types/general";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";

	const { resetCurrentProject, getAllInfoProjects } = useProjectsStore();

	const route = useRoute();
	const uuid = route.params.id as string;

	const links = ref<IUBlockTitleLinks[]>([
		{ path: `/projects/${uuid}/main`, title: "Main.one" },
		{ path: `/projects/${uuid}/advanced-settings`, title: "Advanced settings" }
	]);

	onMounted(async () => {
		await getAllInfoProjects(uuid);
	});

	onUnmounted(() => {
		resetCurrentProject();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Projects')" back-name-route="projects" class="mb-24" />
		<ui-block-title
			:title="$t('Project Settings')"
			:links="links.map((item) => ({ ...item, title: $t(item.title) }))"
		/>
		<router-view />
	</div>
</template>
