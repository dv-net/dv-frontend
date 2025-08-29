<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { UiButton } from "@dv.net/ui-kit";
	import type { IProps } from "@dv-admin/components/common/listInfoItem/types";
	import { useRouter } from "vue-router";
	import { useSlots } from "vue";

	const props = withDefaults(defineProps<IProps>(), {
		isShowContent: false
	});
	const router = useRouter();
	const slots = useSlots();
	const hasSlotText: boolean = !!slots.text;
	const hasSlotContent: boolean = !!slots.default;

	const goToPage = async () => {
		if (props.setting?.isDisabled || props.isShowContent) return;
		await router.push({ path: props.setting.path });
	};
</script>

<template>
	<block-section
		v-if="setting.isShow"
		mode="grey-border"
		class="row"
		:class="[
			{ 'show-content': hasSlotContent && isShowContent },
			{ hover: !isShowContent && !setting?.isDisabled },
			{ 'not-allowed': setting?.isDisabled }
		]"
		@click.stop="goToPage"
	>
		<div class="row__inner" :class="[{ 'show-content': hasSlotContent && isShowContent }]">
			<div class="row__title">
				<span class="row__title-icon">
					<component :is="setting.icon" />
				</span>
				<p class="row__title-text">{{ setting.title }}</p>
			</div>
			<slot v-if="hasSlotText" name="text" />
			<p v-else class="row__content">
				{{ setting.text }}
			</p>
			<div class="row__btn">
				<ui-button type="secondary" @click="router.push({ path: setting.path })" :disabled="setting?.isDisabled">
					{{ setting.textBtn }}
				</ui-button>
			</div>
		</div>
		<slot />
	</block-section>
</template>

<style scoped lang="scss">
	.row {
		display: flex;
		flex-direction: column;
		transition: all 0.2s ease-in-out;
		&.not-allowed {
			cursor: not-allowed;
		}
		&.hover {
			@media (hover: hover) {
				&:hover {
					background-color: rgb(225, 232, 241);
					cursor: pointer;
				}
			}
		}
		&.show-content {
			padding: 0;
			overflow: hidden;
		}
		&__inner {
			display: grid;
			grid-template-columns: 354px 1fr max-content;
			gap: 32px;
			&.show-content {
				padding: 24px;
				border-bottom: 1px solid $grey;
			}
		}
		&__title {
			padding-right: 20px;
			display: flex;
			align-items: center;
			gap: 16px;
			border-right: 1px solid $grey-light;
			&-icon {
				flex-shrink: 0;
				display: flex;
				width: 56px;
				height: 56px;
				align-items: center;
				justify-content: center;
				border-radius: 100%;
				border: 1px solid $grey-light;
				background-color: $white;
			}
			&-text {
				color: $black;
				font-size: 22px;
				font-weight: 500;
				line-height: 32px;
			}
		}
		&__content {
			align-self: center;
			color: $secondary;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
		}
		&__btn {
			display: flex;
			justify-content: flex-end;
			align-items: center;
		}
	}
</style>
