<script lang="ts" setup>
	import { toRefs } from "vue";
	import { UiIcon } from "@dv.net/ui-kit/dist";
	import IconArrowBack from "@dv-admin/components/icons/IconArrowBack.vue";
	import type { UiIconProps } from "@dv.net/ui-kit/dist/components/UiIcon/types";
	import { useRouter } from "vue-router";

	const router = useRouter();

	const props = defineProps<{
		backRouteTitle: string;
		backNameRoute?: string;
		currentRouteTitle?: string;
		iconSettings?: UiIconProps;
	}>();

	const { backRouteTitle, currentRouteTitle, iconSettings, backNameRoute } = toRefs(props);

	const handleRouter = () => {
		if (backNameRoute.value) {
			router.push({ name: backNameRoute.value });
		} else {
			window.history.state.back ? router.go(-1) : router.push({ name: "home" });
		}
	};
</script>

<template>
	<div class="breadcrumbs">
		<div class="breadcrumbs__back" @click="handleRouter">
			<icon-arrow-back />
			<div class="breadcrumbs__title" :class="{ 'breadcrumbs__title--bold': !currentRouteTitle }">
				<ui-icon v-if="iconSettings" :type="iconSettings.type" :name="iconSettings.name" :size="iconSettings.size" />
				<p>{{ backRouteTitle }}</p>
			</div>
		</div>
		<div v-if="currentRouteTitle" class="breadcrumbs__current">
			<ui-icon type="400" name="chevron-right" size="lg" />
			<p>{{ currentRouteTitle }}</p>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.breadcrumbs {
		@extend .no-select;
		display: flex;
		gap: 12px;
		align-items: center;

		&__back {
			display: flex;
			align-items: center;
			gap: 12px;
			cursor: pointer;

			svg {
				color: #ecf0f5;
			}

			@media (hover: hover) {
				&:hover svg {
					color: #e0e4e9;
				}
			}
		}

		&__title {
			display: flex;
			align-items: center;
			gap: 4px;
			color: #828282;
			font-size: 16px;
			font-weight: 500;
			line-height: 20px;

			&--bold {
				color: $black;
				font-size: 16px;
				font-weight: 500;
				line-height: 20px;
			}
		}

		&__current {
			display: flex;
			align-items: center;
			gap: 8px;
			color: $black;
			font-size: 16px;
			font-weight: 500;
			line-height: 20px;
		}
	}
</style>
