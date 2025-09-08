<script setup lang="ts">
	import { UiIcon } from "@dv.net/ui-kit";
	import LangSelect from "@pay/components/ui/langSelect/LangSelect.vue";
	import { ref } from "vue";
	import type { INavLinks } from "@pay/utils/types/schemas";

	defineProps<{ navLinks: INavLinks[] }>()

	const isOpenMenu = ref<boolean>(false)

	const goToSite = (link: string) => {
		if (!link) return;
		window.open(link, "_blank");
	}

	const toggleModal = () => {
		isOpenMenu.value = !isOpenMenu.value
		document.body.style.overflow = isOpenMenu.value ? "hidden" : "visible"
	}
</script>

<template>
	<div class="hamburger-menu">
		<lang-select for-header />
		<div class="burger" @click="toggleModal">
			<ui-icon v-if="isOpenMenu" name="close" type="400" size="lg" />
			<ui-icon v-else name="menu" type="400" size="lg" />
		</div>
		<div v-if="isOpenMenu" class="menu">
			<nav class="menu__nav">
				<div
					v-for="item in navLinks"
					:key="item.id"
					class="item"
					@click="goToSite(item.link)"
				>
					<div class="item__inner">
						<ui-icon :name="item.iconName" color="rgb(22, 126, 180)" type="400" />
						<a class="item__link" target="_blank" href="">
							{{ item.text }}
						</a>
					</div>
					<ui-icon name="chevron-right" color="rgb(164, 165, 177)" type="400" />
				</div>
			</nav>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.hamburger-menu {
		display: flex;
		align-items: center;
		gap: 12px;
		.burger {
			display: none;
			@extend .center;
			border-radius: 50%;
			height: 40px;
			width: 40px;
			flex-shrink: 0;
			transition: background-color 0.3s ease-in-out;
			@media (hover: hover) {
				&:hover {
					cursor: pointer;
					background-color: color(srgb 0.92 0.92 0.92);
				}
			}
			@include mediamax(1024) {
				display: flex;
			}
		}
		.menu {
			z-index: 1000;
			display: none;
			justify-content: flex-end;
			position: absolute;
			width: 100%;
			top: 56px;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: #f3f4f6;
			padding: 24px $padding-main + px;
			@include mediamax(1024) {
				display: flex;
			}
			&__nav {
				display: flex;
				flex-direction: column;
				gap: 24px;
				.item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 12px 0;
					gap: 12px;
					&__inner {
						display: flex;
						align-items: center;
						gap: 4px;
						min-width: 250px;
						word-break: break-word;
						max-width: 350px;
					}
					&__link {
						color: $main-color;
						font-weight: 500;
					}
				}
			}
		}
	}
</style>
