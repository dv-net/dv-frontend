<script setup lang="ts">
	import { mainMenuList } from "@dv-admin/utils/constants/menu";
	import { storeToRefs } from "pinia";
	import AccountManagement from "@dv-admin/components/layout/navigationLayout/accountManagement/AccountManagement.vue";
	import { UiLayoutMenu } from "@dv.net/ui-kit";
	import IconMonitor from "@dv-admin/components/icons/IconMonitor.vue";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { computed } from "vue";

	const { collapse = false, isSidebarMobile = false } = defineProps<{
		collapse: boolean;
		isSidebarMobile?: boolean;
	}>();

	const { quickStartGuideSetting } = storeToRefs(useUserSettingsStore());
	const { isRootUser } = storeToRefs(useAuthStore());

	const pagesRequireAdminRights: string[] = ["/settings/logs"];

	const isShowQuickStartGuide = computed<boolean>(() => {
		return quickStartGuideSetting.value?.value === "incompleted";
	});
</script>

<template>
	<div class="navigation">
		<div class="navigation__menu">
			<div v-if="isShowQuickStartGuide" class="navigation__quick-start">
				<UiLayoutMenu
					:class="{ 'drawer-menu': isSidebarMobile }"
					:collapsed="collapse"
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
				/>
			</div>
			<UiLayoutMenu
				:class="{ 'drawer-menu': isSidebarMobile }"
				:collapsed="collapse"
				:route-items="
					mainMenuList.map((item) => ({
						path: item.path,
						meta: {
							...item.meta,
							class: pagesRequireAdminRights.includes(item.path) && !isRootUser ? 'none' : '',
							title: $t(item.meta.title)
						},
						children:
							item.children && item.children.length
								? item.children.map((item) => ({
										...item,
										meta: {
											...item.meta,
											title: $t(item.meta.title),
											class: pagesRequireAdminRights.includes(item.path) && !isRootUser ? 'none' : ''
										}
									}))
								: []
					}))
				"
			/>
		</div>
		<account-management v-if="!collapse" class="navigation__plate" />
	</div>
</template>

<style scoped lang="scss">
	.navigation {
		display: flex;
		flex-direction: column;
		gap: 24px;
		flex-grow: 1;
		position: relative;
		min-height: 0;
		&__menu {
			flex: 1 1 auto;
			min-height: 0;
			overflow: auto;
		}
		&__quick-start {
			display: flex;
			flex-direction: column;
			width: max-content;
			padding-bottom: 8px;
			margin-bottom: 8px;
			border-bottom: 1px solid #e1e8f1;
		}
		&__plate {
			flex-shrink: 0;
		}
	}
</style>
