<script setup lang="ts">
	import { UiInput } from "@dv.net/ui-kit/dist";
	import type { IProps } from "@dv-admin/views/projects/edit/main/components/rowActionInput/types";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";

	withDefaults(defineProps<IProps>(), {
		isEmptyValueNull: false,
		readonly: false,
		placeholder: "",
		typeInput: "text"
	});

	const modelValue = defineModel<string | null>("modelValue", { required: true });
</script>

<template>
	<div class="row">
		<div class="row__label">
			<span>{{ label }}</span>
			<tooltip-helper class="flex flex-y-start" v-if="iconText || iconTitle" :title="iconTitle" :text="iconText" />
		</div>
		<div class="flex flex-column gap-4">
			<ui-input
				v-model="modelValue"
				:is-empty-value-null="isEmptyValueNull"
				:placeholder="placeholder"
				:readonly="readonly"
				:type="typeInput"
			>
				<template #append> </template>
			</ui-input>
			<span v-if="subtitle" class="row__subtitle">
				{{ subtitle }}
			</span>
		</div>
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.row {
		display: grid;
		grid-template-columns: 275px 1fr auto auto;
		gap: 8px;
		&__label {
			display: flex;
			color: $secondary;
			justify-content: space-between;
			align-items: center;
			gap: 4px;
			width: 275px;
			height: 44px;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
		&__subtitle {
			color: $secondary;
			font-size: 12px;
			font-weight: 400;
			line-height: 16px;
		}
	}
</style>
