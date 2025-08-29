<script setup lang="ts">
	import NavigationSection from "@dv-admin/components/layout/NavigationSection.vue";
	import { mainMenuList } from "@dv-admin/utils/constants/menu";
	import { storeToRefs } from "pinia";
	import { useLayoutStore } from "@dv-admin/stores/layout";
	import AccountManagement from "@dv-admin/components/layout/accountManagement/AccountManagement.vue";

	const { isMenuCollapse } = storeToRefs(useLayoutStore());

	const props = withDefaults(defineProps<{ collapse: boolean }>(), {
		collapse: false
	});
</script>

<template>
	<div class="navigation">
		<div class="navigation__menu">
			<NavigationSection
				:title="$t('Basic')"
				:routes-list="mainMenuList"
				:collapse="props.collapse"
				@change="$emit('change')"
			/>
		</div>
		<account-management v-if="!isMenuCollapse" class="navigation__plate" />
	</div>
</template>

<style lang="scss" scoped>
	.navigation {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		flex-grow: 1;
		position: relative;

		&__plate {
			margin: 16px 12px;
			min-height: fit-content;
		}
	}
</style>
