<script setup lang="ts">
	import { UiLayout } from "@dv.net/ui-kit/dist";
	import NavigationLayout from "@dv-admin/components/layout/navigationLayout/NavigationLayout.vue";
	import HeaderLayout from "@dv-admin/components/layout/headerLayout/HeaderLayout.vue";
	import { useLayoutStore } from "@dv-admin/stores/layout";
	import { storeToRefs } from "pinia";
	import OtpGlobalModal from "@dv-admin/components/common/otpGlobalModal/OtpGlobalModal.vue";
	import { useGeneralStore } from "@dv-admin/stores/general";

	const { isMenuCollapse } = storeToRefs(useLayoutStore());
	const { isShowOtpGlobalModal } = storeToRefs(useGeneralStore());
</script>

<template>
	<ui-layout v-model="isMenuCollapse" :is-menu-collapsed="isMenuCollapse">
		<template #header>
			<HeaderLayout />
		</template>
		<template #sidebar-desktop>
			<NavigationLayout :collapse="isMenuCollapse" />
		</template>
		<template #sidebar-mobile>
			<NavigationLayout :collapse="false" isSidebarMobile />
		</template>
		<template #default>
			<div class="container-default-layout">
				<slot />
			</div>
			<otp-global-modal v-model:is-show="isShowOtpGlobalModal" />
		</template>
	</ui-layout>
</template>

<style lang="scss">
	.container-default-layout {
		flex-grow: 1;
		max-width: 1074px;
		width: 100%;
		margin: 0 auto;
	}
	.ui-layout {
		display: flex;
		flex-grow: 1;
		min-height: unset;
		&__sidebar {
			display: flex;
			background-color: white;
			z-index: 1000;
			padding: 24px 24px 16px 12px;
			overflow: auto;
			top: $header-height;
			min-height: calc(100vh - $header-height);
			@supports (min-height: 100dvh) {
				min-height: calc(100dvh - $header-height);
			}
			&-mobile {
				display: flex;
				margin-top: $header-height;
				min-height: calc(100vh - $header-height);
				@supports (min-height: 100dvh) {
					min-height: calc(100dvh - $header-height);
				}
			}
		}
		&__main {
			display: flex;
			padding: 24px 63px 32px;
			min-height: calc(100vh - $header-height);
			@supports (min-height: 100dvh) {
				min-height: calc(100dvh - $header-height);
			}
		}
	}
</style>
