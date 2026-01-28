<script setup lang="ts">
	import { UiIcon, UiTooltip } from "@dv.net/ui-kit";
	import { isDesktopDevice } from "@shared/utils/helpers/media.ts";

	defineProps<{ label: string; descriptionTitle?: string; descriptionText?: string }>();
</script>

<template>
	<div class="row">
		<div class="row__top">
			<span class="row__label">{{ label }}</span>
			<ui-tooltip
				v-if="descriptionTitle || descriptionText"
				:show-event="isDesktopDevice() ? 'hover' : 'click'"
				:title="descriptionTitle"
				:text="descriptionText"
			>
				<ui-icon class="flex-shrink-0" name="help" type="filled" color="#CDD4DD" />
			</ui-tooltip>
		</div>
		<slot />
	</div>
</template>

<style lang="scss" scoped>
	.row {
		display: flex;
		flex-direction: column;
		gap: 16px;
		&__top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
		}
		&__label {
			color: #303345;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
	}
</style>