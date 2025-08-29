<script setup lang="ts">
	import { toRefs, useSlots } from "vue";
	import type { IProps } from "@dv-admin/components/ui/BlockSection/types";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";

	const props = withDefaults(defineProps<IProps>(), {
		mode: "white",
		radius: "lg",
		padding: "xl",
		height: "auto"
	});
	const { radius, mode, padding, title, height, infoTitle, infoText, popperClass, isLoading } = toRefs(props);

	const slots = useSlots();
	const hasTitleSlot: boolean = !!slots.title;
	const hasTooltipSlots: boolean = !!(slots.infoTitle || slots.infoText);
</script>

<template>
	<div
		class="block-section"
		:class="[`radius-${radius}`, `mode-${mode}`, `padding-${padding}`, `${title || hasTitleSlot ? 'relative' : ''}`]"
	>
		<div v-if="!isLoading && title && !hasTitleSlot" class="block-section__title" :class="`mode-${mode}`">
			<h2 class="global-title-h3">{{ title }}</h2>

			<tooltip-helper
				v-if="infoTitle || infoText || hasTooltipSlots"
				:title="infoTitle || title"
				:text="infoText"
				:popperClass="popperClass"
			>
				<template #infoTitle><slot name="infoTitle" /></template>
				<template #infoText><slot name="infoText" /></template>
			</tooltip-helper>
		</div>
		<slot v-if="!isLoading && hasTitleSlot && !title" name="title" />
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.block-section {
		height: v-bind(height);
		&__title {
			display: flex;
			align-items: center;
			background-color: white;
			position: absolute;
			left: 56px;
			top: -12px;
			gap: 4px;
			padding: 0 16px;
			&.mode-transparent,
			&.mode-grey,
			&.mode-grey-border {
				background-color: transparent;
			}
			&.mode-white {
				background-color: $white;
			}
		}
		&.relative {
			position: relative;
		}
		&.padding-none {
			padding: 0;
		}
		&.padding-sm {
			padding: 8px;
		}
		&.padding-md {
			padding: 12px;
		}
		&.padding-lg {
			padding: 16px;
		}
		&.padding-l {
			padding: 20px;
		}
		&.padding-xl {
			padding: 24px;
		}
		&.padding-xxl {
			padding: 32px;
		}
		&.radius-none {
			border-radius: 0;
		}
		&.radius-sm {
			border-radius: 8px;
		}
		&.radius-md {
			border-radius: 12px;
		}
		&.radius-lg {
			border-radius: 16px;
		}
		&.mode-transparent {
			border: 1px solid $grey;
			background-color: transparent;
		}
		&.mode-white {
			border: 1px solid $grey;
			background-color: $white;
		}
		&.mode-grey {
			border: unset;
			background-color: $blue-opacity;
		}
		&.mode-grey-border {
			border: 1px solid $grey;
			background-color: $blue-opacity;
		}
		&.mode-white-border-green {
			border: 1px solid #1f9649;
			background-color: $white;
		}
		&.mode-white-border-red {
			border: 1px solid #d32f2f;
			background-color: $white;
		}
	}
</style>
