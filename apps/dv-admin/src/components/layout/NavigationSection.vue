<script setup lang="ts">
	import IconMonitor from "@dv-admin/components/icons/IconMonitor.vue";
	import { UiLayoutMenu } from "@dv.net/ui-kit/dist";
	import { useRouter } from "vue-router";
	import type { RouteItem } from "@dv.net/ui-kit/dist/components/UiLayoutMenu/types";
	import { storeToRefs } from "pinia";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { useAuthStore } from "@dv-admin/stores/auth";

	interface NavigationSectionProps {
		title: string;
		routesList: RouteItem[];
		collapse: boolean;
	}

	const router = useRouter();
	const { quickStartGuideSetting } = storeToRefs(useUserSettingsStore());
	const { isRootUser } = storeToRefs(useAuthStore());

	const props = withDefaults(defineProps<NavigationSectionProps>(), {
		title: "",
		collapse: false
	});
	const emit = defineEmits<{
		(e: "change"): void;
	}>();

	const pagesRequireAdminRights: string[] = ['/settings/logs'];

	function onSelect(path: string) {
		router.push(path);
		emit("change");
	}
</script>

<template>
	<div class="navigation-section" :class="{ collapsed: props.collapse }">
		<UiLayoutMenu
			v-if="quickStartGuideSetting?.value === 'incompleted'"
			class="drawer-menu quick-start"
			:collapsed="props.collapse"
			:route-items="[
				{
					path: '/quick-start',
					meta: {
						title: $t('Quick start'),
						iconComponent: IconMonitor,
						iconComponentActive: IconMonitor
					}
				}
			]"
			@selected="onSelect"
		/>
		<div class="border" />
		<UiLayoutMenu
			class="drawer-menu"
			:collapsed="props.collapse"
			:route-items="
				props.routesList.map((item) => ({
					path: item.path,
					meta: {
						...item.meta,
						class: pagesRequireAdminRights.includes(item.path) && !isRootUser ? 'none' : '',
						title: $t(item.meta.title)
					},
					children:
						item.children && item.children.length
							? item.children.map((item) => ({ ...item, meta: {
								...item.meta,
								title: $t(item.meta.title),
								class: pagesRequireAdminRights.includes(item.path) && !isRootUser ? 'none' : '',
							} }))
							: []
				}))
			"
			@selected="onSelect"
		/>
	</div>
</template>

<style lang="scss">
	.ui-layout__sidebar {
		padding-left: 0;
	}
	.el-aside {
		overflow: visible !important;
	}
	.com-left-sidebar {
		&--links {
			&__wrapper {
				margin: 12px !important;
				border: 0 !important;
			}
			&__link {
				border-radius: 8px;
				&:focus-visible {
					background-color: var(--el-menu-hover-bg-color);
				}
				.el-icon {
					margin-right: 24px !important;
				}
				span {
					overflow: hidden;
					text-overflow: ellipsis;
				}
				&.is-active {
					background-color: var(--color-gray-2);
					pointer-events: none;
				}
			}
		}
	}

	.drawer-menu {
		&.quick-start {
			border-bottom: 1px solid $grey;
			padding-bottom: 8px;
			margin-bottom: 8px;
		}
	}
</style>

<style scoped lang="scss">
	.navigation-section {
		position: relative;
		overflow: visible;
		color: #303345;
		fill: #303345 !important;

		padding: 12px;

		&.collapsed {
			padding: 12px 4px;
		}

		.title {
			font-weight: 500;
			font-size: 16px;
			line-height: 20px;
			text-align: left;
			text-wrap: nowrap !important;

			&-wrapper {
				position: absolute;
				padding: 8px 12px;
				width: 200px;
			}
		}
	}

	.navigation-section + .navigation-section {
		border-top: 1px solid #e5e5e5;
	}

	//.v-enter-active,
	//.v-leave-active {
	//  transition: opacity var(--el-transition-duration);
	//}
	//
	//.v-enter-from,
	//.v-leave-to {
	//  opacity: 0;
	//}

	.expander {
		width: 100%;
		height: 36px;
		//transition: height var(--el-transition-duration);

		&.collapse {
			height: 0;
		}
	}
</style>
