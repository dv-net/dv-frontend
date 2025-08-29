<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { storeToRefs } from "pinia";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { computed, onMounted } from "vue";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { UiButton, UiTable } from "@dv.net/ui-kit";
	import { useI18n } from "vue-i18n";

	const { t } = useI18n();
	const { isLoading, archivedProjects } = storeToRefs(useProjectsStore());
	const { getStoreArchivedList, postStoreUnarchive } = useProjectsStore();

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Created") },
		{ name: "name", label: t("Name") },
		{ name: "actions", label: t("Actions") }
	]);

	onMounted(async () => {
		await getStoreArchivedList();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Projects')" back-name-route="projects" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Archive.one") }}</h1>

		<ui-table :loading="isLoading" :headers="headers" :data="archivedProjects" table-layout="fixed">
			<template #body-cell-created_at="{ row }">
				{{ formatDate(row.created_at) }}
			</template>
			<template #body-cell-actions="{ row }">
				<ui-button
					type="tertiary"
					size="sm"
					left-icon-name="unarchive"
					left-icon-type="filled"
					left-icon-size="md"
					@click="postStoreUnarchive(row.id)"
				>
					{{ $t("Unarchive") }}
				</ui-button>
			</template>
		</ui-table>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
	}
</style>
