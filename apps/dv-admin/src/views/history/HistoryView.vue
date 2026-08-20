<script setup lang="ts">
	import { UiBlockTitle } from "@dv.net/ui-kit";
	import { computed, onMounted, onUnmounted, ref } from "vue";
	import { useRoute } from "vue-router";
	import { useI18n } from "vue-i18n";
	import { useTransactionStore } from "@dv-admin/stores/history";
	import type { IUBlockTitleLinks } from "@dv-admin/utils/types/general";
	import { useProjectsStore } from "@dv-admin/stores/projects";

	const { t } = useI18n();
	const route = useRoute();
	const { resetDataTransaction } = useTransactionStore();
	const { getProjects } = useProjectsStore();

	const links = ref<IUBlockTitleLinks[]>([
		{ path: `/history/transactions`, title: "Transactions" },
		{ path: `/history/webhooks`, title: "Webhooks" }
	]);

	const translatedLinks = computed(() => links.value.map((item) => ({ ...item, title: t(item.title) })));

	const title = computed(() => {
		const activeLink = links.value.find((item) => route.path.startsWith(item.path));
		return t(activeLink?.title ?? "History");
	});

	onMounted(async () => {
		await getProjects();
	});

	onUnmounted(() => {
		resetDataTransaction();
	});
</script>

<template>
	<div class="page">
		<ui-block-title :title="title" :links="translatedLinks" />
		<router-view />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
	}
</style>
