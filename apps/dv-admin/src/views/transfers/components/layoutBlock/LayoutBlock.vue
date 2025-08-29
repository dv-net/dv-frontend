<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import type { IProps } from "@dv-admin/views/transfers/components/layoutBlock/type";
	import { getTaskDeclension } from "@dv-admin/utils/helpers/transfer";
	import { toRefs } from "vue";
	import { UiLink } from "@dv.net/ui-kit/dist";

	const props = withDefaults(defineProps<IProps>(), {
		showCount: 4,
		isShowButton: true
	});
	const emits = defineEmits(["update:is-show-all"]);
	const { isShowAll, count, showCount, title, isShowButton } = toRefs(props);

	const handleClickToggle = () => {
		emits("update:is-show-all", !isShowAll.value);
	};
</script>

<template>
	<block-section class="block">
		<template v-slot:title>
			<div class="block__title">
				<h2 class="global-title-h3">{{ title }}</h2>
				<div v-if="count" class="block__label">
					<span class="block__label-bold">{{ count }}</span>
					<span>{{ $t(getTaskDeclension(count)) }}</span>
				</div>
			</div>
		</template>
		<div class="flex flex-column">
			<slot name="tabs" />
			<slot />
			<div v-if="count > showCount && isShowButton" class="block__link">
				<ui-link @click.stop="handleClickToggle" size="md" class="global-link-dashed">
					{{ isShowAll ? $t("Hide") : $t("Show all") }}
				</ui-link>
			</div>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.block {
		display: flex;
		flex-direction: column;
		&__title {
			display: flex;
			align-items: center;
			gap: 8px;
			width: max-content;
			position: absolute;
			left: 56px;
			top: -12px;
			padding: 0 16px;
			background-color: $white;
		}
		&__label {
			display: flex;
			padding: 4px 8px;
			align-items: center;
			gap: 8px;
			border-radius: 8px;
			border: 1px solid $grey;
			background-color: $blue-opacity;
			color: $secondary;
			font-size: 12px;
			font-weight: 400;
			line-height: 16px;
			&-bold {
				color: $black;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}
		}
		&__link {
			display: flex;
			justify-content: center;
			margin-top: 18px;
		}
	}
</style>
