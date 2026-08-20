<script lang="ts" setup>
	import { computed } from "vue";
	import { UiIcon } from "@dv.net/ui-kit/dist";
	import IconArrowBack from "@dv-admin/components/icons/IconArrowBack.vue";
	import type { UiIconProps } from "@dv.net/ui-kit/dist/components/UiIcon/types";
	import { useRouter, type RouteLocationRaw, type RouteRecordName } from "vue-router";

	const {
		backRouteTitle,
		backNameRoute,
		preferBackRoute = false,
		currentRouteTitle,
		iconSettings
	} = defineProps<{
		backRouteTitle: string;
		backNameRoute?: RouteRecordName | RouteLocationRaw;
		preferBackRoute?: boolean;
		currentRouteTitle?: string;
		iconSettings?: UiIconProps;
	}>();

	const router = useRouter();

	const canGoBack = computed(() => Boolean(router.options.history.state.back));

	const resolvedBackRoute = computed<RouteLocationRaw | null>(() => {
		if (!backNameRoute) return null;

		if (typeof backNameRoute === "string" || typeof backNameRoute === "symbol") {
			const exists = router.getRoutes().some((route) => route.name === backNameRoute);
			return exists ? { name: backNameRoute } : null;
		}

		return backNameRoute;
	});

	const hasBackRoute = computed(() => Boolean(resolvedBackRoute.value));

	const isEnabled = computed(() => canGoBack.value || hasBackRoute.value);

	const goToBackRoute = () => {
		if (!resolvedBackRoute.value) return false;
		router.push(resolvedBackRoute.value);
		return true;
	};

	const handleBack = () => {
		if (!isEnabled.value) return;

		if (preferBackRoute && goToBackRoute()) return;

		if (canGoBack.value) {
			router.back();
			return;
		}

		goToBackRoute();
	};
</script>

<template>
	<div class="breadcrumbs">
		<button
			type="button"
			class="breadcrumbs__back"
			:class="{ 'breadcrumbs__back--disabled': !isEnabled }"
			:disabled="!isEnabled"
			@click="handleBack"
		>
			<span class="breadcrumbs__icon" aria-hidden="true">
				<icon-arrow-back />
			</span>
			<div class="breadcrumbs__title" :class="{ 'breadcrumbs__title--bold': !currentRouteTitle }">
				<ui-icon v-if="iconSettings" :type="iconSettings.type" :name="iconSettings.name" :size="iconSettings.size" />
				<p>{{ backRouteTitle }}</p>
			</div>
		</button>
		<div v-if="currentRouteTitle" class="breadcrumbs__current">
			<ui-icon type="400" name="chevron-right" size="lg" />
			<p>{{ currentRouteTitle }}</p>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.breadcrumbs {
		user-select: none;
		display: flex;
		align-items: center;

		&__back {
			display: inline-flex;
			align-items: center;
			align-self: flex-start;
			gap: 12px;
			max-width: 100%;
			margin: 0;
			padding: 4px 14px 4px 4px;
			border: 1px solid transparent;
			border-radius: 999px;
			background: transparent;
			cursor: pointer;
			font: inherit;
			text-align: left;
			color: inherit;
			transition:
				background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1),
				border-color 0.28s cubic-bezier(0.4, 0, 0.2, 1),
				box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1),
				transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
				opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1);

			@media (hover: hover) {
				&:hover:not(:disabled) {
					background: #f7f9fb;
					border-color: rgba(25, 104, 229, 0.08);
					box-shadow: 0 4px 16px rgba(51, 55, 66, 0.06);

					.breadcrumbs__icon {
						transform: translateX(-1px);
						box-shadow: 0 2px 10px rgba(25, 104, 229, 0.12);

						:deep(svg) {
							color: #fff;
						}
					}

					.breadcrumbs__title {
						color: $blue;
					}
				}

				&:active:not(:disabled) {
					transform: scale(0.98);
					transition-duration: 0.12s;
				}
			}

			&--disabled,
			&:disabled {
				cursor: not-allowed;
				opacity: 0.5;
			}
		}

		&__icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			border-radius: 999px;
			transition:
				transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
				box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);

			:deep(svg) {
				display: block;
				color: #ecf0f5;
				transition: color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
			}
		}

		&__title {
			display: flex;
			align-items: center;
			gap: 4px;
			min-width: 0;
			color: #828282;
			font-size: 16px;
			font-weight: 500;
			line-height: 20px;
			transition: color 0.28s cubic-bezier(0.4, 0, 0.2, 1);

			p {
				margin: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			&--bold {
				color: $black;
			}
		}

		&__current {
			display: flex;
			align-items: center;
			gap: 8px;
			min-width: 0;
			color: $black;
			font-size: 16px;
			font-weight: 500;
			line-height: 20px;

			p {
				margin: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}
</style>
