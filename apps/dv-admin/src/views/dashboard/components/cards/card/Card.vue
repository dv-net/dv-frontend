<script setup lang="ts">
	import { formatDollars } from "@shared/utils/helpers/general";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import type { Component } from "vue";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";

	defineProps<{
		icon: Component;
		title: string;
		amount?: string;
		color?: string;
		tooltipText: string;
		noCurrentExchange: boolean;
	}>();
</script>

<template>
	<block-section :class="{ card: true, 'one-card': noCurrentExchange }" mode="white" padding="xl">
		<div class="card__top">
			<div
				class="card__icon"
				:class="[{ 'card__icon--green': color === 'green' }, { 'card__icon--blue': color === 'blue' }]"
			>
				<component :is="icon" />
			</div>
			<div class="card__content">
				<div class="flex gap-4">
					<span class="card__text">{{ title }}</span>
					<tooltip-helper :title="title" :text="tooltipText" />
				</div>
				<span class="card__amount">
					{{ formatDollars(amount) }}
				</span>
			</div>
		</div>
		<slot />
	</block-section>
</template>

<style scoped lang="scss">
	.card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;

		&.one-card {
			flex-direction: inherit;
			justify-content: space-between;
			align-items: center;
		}

		&__top {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		&__content {
			display: flex;
			flex-direction: column;
		}

		&__text {
			color: $secondary;
			font-size: 16px;
			font-weight: 500;
			line-height: 20px;
		}

		&__amount {
			color: #000;
			font-size: 32px;
			font-weight: 600;
			line-height: 40px;
		}

		&__icon {
			display: flex;
			width: 60px;
			height: 60px;
			justify-content: center;
			align-items: center;
			flex-shrink: 0;
			border-radius: 100px;
			background-color: #fff3e0;

			&--green {
				background-color: #e6faed;
			}

			&--blue {
				background-color: $blue-light;
			}
		}
	}
</style>
