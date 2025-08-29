<script setup lang="ts">
	import { UiBlockTitle } from "@dv.net/ui-kit";
	import { onMounted, onUnmounted, ref } from "vue";
	import { useTransactionStore } from "@dv-admin/stores/history";
	import type { IUBlockTitleLinks } from "@dv-admin/utils/types/general";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { useProjectsStore } from "@dv-admin/stores/projects";

	const { resetDataTransaction } = useTransactionStore();
	const { getProjects } = useProjectsStore();

	const links = ref<IUBlockTitleLinks[]>([
		{ path: `/history/transactions`, title: "Transactions" },
		{ path: `/history/webhooks`, title: "Webhooks" }
	]);

	onMounted(async () => {
		await getProjects();
	});

	onUnmounted(() => {
		resetDataTransaction();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Search')" back-name-route="search" />
		<ui-block-title
			class="page__title"
			:title="$t('History')"
			:links="links.map((item) => ({ ...item, title: $t(item.title) }))"
		/>
		<router-view />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		&__title {
			:deep(.ui-block-title__title) {
				font-size: 24px;
				font-weight: 600;
				line-height: 28px;
				margin-top: 24px;
			}
		}
	}
</style>
