<script setup lang="ts">
	import { UiLayout } from "@dv.net/ui-kit/dist";
	import Navigation from "@dv-admin/components/layout/Navigation.vue";
	import Header from "@dv-admin/components/layout/Header.vue";
	import { useLayoutStore } from "@dv-admin/stores/layout";
	import { storeToRefs } from "pinia";
	import OtpGlobalModal from "@dv-admin/components/common/otpGlobalModal/OtpGlobalModal.vue";
	import { useGeneralStore } from "@dv-admin/stores/general";

	const { toggleMenu } = useLayoutStore();
	const { isMenuCollapse } = storeToRefs(useLayoutStore());
	const { isShowOtpGlobalModal } = storeToRefs(useGeneralStore());
</script>

<template>
	<ui-layout v-model="isMenuCollapse">
		<template #header>
			<Header />
		</template>
		<template #sidebar-desktop>
			<Navigation :collapse="isMenuCollapse" />
		</template>
		<template #sidebar-mobile>
			<Navigation :collapse="false" @change="toggleMenu" />
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
		}
		&__main {
			display: flex;
			padding: 24px 63px 32px;
			min-height: calc(100% - $header-height);
		}
	}
</style>
