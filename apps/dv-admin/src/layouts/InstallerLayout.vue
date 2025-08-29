<script setup lang="ts">
	import LangSelect from "@dv-admin/components/ui/langSelect/LangSelect.vue";
	import { useRouter } from "vue-router";
	import { UiButton } from "@dv.net/ui-kit/dist";
	import IconLogo from "@dv-admin/components/icons/IconLogo.vue";

	const router = useRouter();

	const goToSupport = () => {
		window.open("https://t.me/dv_net_support_bot", "_blank");
	};
</script>

<template>
	<div class="installer-layout">
		<header class="header">
			<icon-logo class="header__logo" @click="router.push({ name: 'installer' })" />
			<div class="header__nav">
				<lang-select for-header />
				<ui-button
					class="header__select"
					type="secondary"
					leftIconName="support-agent"
					leftIconSize="md"
					size="xl"
					@click="goToSupport"
				>
					{{ $t("Support") }}
				</ui-button>
			</div>
		</header>
		<slot />
	</div>
</template>

<style scoped lang="scss">
	.installer-layout {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		padding: 50px;

		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;

			&__logo {
				transition: transform 0.3s ease-in-out;
				@media (hover: hover) {
					&:hover {
						cursor: pointer;
						transform: scale(1.1);
					}
				}
			}

			&__nav {
				display: flex;
				align-items: center;
				gap: 16px;
			}
		}
	}
</style>
