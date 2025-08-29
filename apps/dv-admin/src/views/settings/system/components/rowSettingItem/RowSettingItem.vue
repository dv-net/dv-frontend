<script setup lang="ts">
	import { UiInput, UiSelect } from "@dv.net/ui-kit";
	import { getOptionsForUiSelect } from "@shared/utils/helpers/general";
	import type { IProps } from "@dv-admin/views/settings/system/components/rowSettingItem/types";

	defineProps<IProps>();
	const value = defineModel<string | null>("value", { required: true });
</script>

<template>
	<div class="row">
		<div class="row__content">
			<span class="row__content-title">{{ title }}</span>
			<span v-if="description" class="row__content-description">
				{{ description }}
			</span>
		</div>
		<div>
			<ui-select
				v-if="availableValues && availableValues.length"
				v-model="value"
				filled
				size="lg"
				:options="getOptionsForUiSelect(availableValues)"
				:disabled="isDisabled"
			/>
			<ui-input v-else size="lg" :disabled="isDisabled" filled v-model="value" />
		</div>
	</div>
</template>

<style scoped lang="scss">
	.row {
		display: grid;
		grid-template-columns: 292px 1fr;
		gap: 40px;
		&__content {
			display: flex;
			flex-direction: column;
			&-title {
				color: $black;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}
			&-description {
				color: $secondary;
				font-size: 14px;
				font-weight: 400;
				line-height: 20px;
			}
		}
	}
</style>
