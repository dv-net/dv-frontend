<script setup lang="ts">
	import { markRaw, type Component } from "vue";
	import IconUsers from "@dv-admin/components/icons/admin/IconUsers.vue";
	import IconProjects from "@dv-admin/components/icons/admin/IconProjects.vue";
	import IconTurnover from "@dv-admin/components/icons/admin/IconTurnover.vue";

	const stats: { title: string; value: string; icon: Component }[] = [
		{
			title: "Number of users",
			value: "12 343",
			icon: markRaw(IconUsers)
		},
		{
			title: "Number of projects",
			value: "2 242",
			icon: markRaw(IconProjects)
		},
		{
			title: "Turnover today",
			value: "$100 000",
			icon: markRaw(IconTurnover)
		}
	];
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("Admin") }}</h1>
		<section class="stats">
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
