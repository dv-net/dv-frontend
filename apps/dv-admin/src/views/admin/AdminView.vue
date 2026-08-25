<script setup lang="ts">
	import { computed, markRaw, onMounted, type Component } from "vue";
	import { storeToRefs } from "pinia";
	import { UiSkeleton } from "@dv.net/ui-kit";
	import IconUsers from "@dv-admin/components/icons/admin/IconUsers.vue";
	import IconProjects from "@dv-admin/components/icons/admin/IconProjects.vue";
	import IconTurnover from "@dv-admin/components/icons/admin/IconTurnover.vue";
	import { useRootStore } from "@dv-admin/stores/root";
	import { formatDollars } from "@shared/utils/helpers/general";

	const { rootStatistics, isLoadingStatistics } = storeToRefs(useRootStore());
	const { getRootStatistics } = useRootStore();

	const stats = computed<{ title: string; value: string; icon: Component }[]>(() => [
		{
			title: "Number of users",
			value: rootStatistics.value ? String(rootStatistics.value.users_count) : "—",
			icon: markRaw(IconUsers)
		},
		{
			title: "Number of projects",
			value: rootStatistics.value ? String(rootStatistics.value.projects_count) : "—",
			icon: markRaw(IconProjects)
		},
		{
			title: "Turnover today",
			value: rootStatistics.value ? formatDollars(rootStatistics.value.turnover_today_usd) : "—",
			icon: markRaw(IconTurnover)
		}
	]);

	onMounted(getRootStatistics);
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("Admin") }}</h1>
		<ui-skeleton v-if="isLoadingStatistics" :rows="1" :row-height="102" :item-border-radius="24" />
		<section v-else class="stats">
			<article v-for="item in stats" :key="item.title" class="stats__card">
				<div class="stats__icon">
					<component :is="item.icon" />
				</div>
				<div class="stats__content">
					<p class="stats__label">{{ $t(item.title) }}</p>
					<p class="stats__value">{{ item.value }}</p>
				</div>
			</article>
		</section>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.stats {
		display: flex;
		gap: 4px;
		padding: 4px;
		border-radius: 24px;
		background-color: $blue-opacity;

		&__card {
			display: flex;
			align-items: center;
			gap: 16px;
			flex: 1;
			min-width: 0;
			padding: 24px;
			border-radius: 20px;
			background-color: $white;
			box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
		}

		&__icon {
			@extend .center;
			width: 44px;
			height: 44px;
			flex-shrink: 0;
			border-radius: 12px;
			background-color: rgba(22, 126, 180, 0.07);
			box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
			color: rgb(22, 126, 180);
		}

		&__content {
			display: flex;
			flex-direction: column;
			gap: 6px;
			min-width: 0;
		}

		&__label {
			margin: 0;
			color: $grey-opacity;
			font-size: 14px;
			font-weight: 500;
			line-height: 16px;
		}

		&__value {
			margin: 0;
			color: $black;
			font-size: 24px;
			font-weight: 500;
			line-height: 24px;
		}
	}
</style>
