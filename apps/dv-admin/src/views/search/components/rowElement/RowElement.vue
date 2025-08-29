<script setup lang="ts">
	import type { IProps } from "@dv-admin/views/search/components/rowElement/types";
	import { UiCopyText } from "@dv.net/ui-kit";

	defineProps<IProps>();
</script>

<template>
	<div class="row">
		<div class="row__inner">
			<div class="row__label">{{ label }}</div>
			<div class="row__value">
				<span class="row__content">{{ value || "—" }}</span>
				<ui-copy-text v-if="isCopyValue && value" :copied-text="value" color-icon="#6B6D80" size-icon="sm" />
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.row {
		&__inner {
			display: grid;
			grid-template-columns: 120px 1fr;
			column-gap: 20px;
			border-bottom: 1px solid #e9ecef;
			align-content: center;
			padding: 12px 0;
			word-break: break-word;
			height: 100%;
		}
		&__label {
			align-content: center;
			color: $secondary;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
		}
		&__value {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 4px;
		}
		&__content {
			color: $black;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
	}
</style>
