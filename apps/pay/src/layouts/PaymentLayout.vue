<script setup lang="ts">
	import IconLogo from "@pay/components/icons/IconLogo.vue";
	import { useI18n } from "vue-i18n";
  import {computed} from "vue";
  import HamburgerMenu from "@pay/components/layouts/hamburgerMenu/HamburgerMenu.vue";
  import type {INavLinks} from "@pay/utils/types/schemas";

	const { locale, t } = useI18n()

  const navLinks = computed<INavLinks[]>(() => {
    return [
      { id: 1, iconName: "account-balance", link: `https://dv.net/${ !locale.value || locale.value === 'en' ? '' : locale.value }`, text: `${t('More about')} Merchant` },
      { id: 2, iconName: "description (1)", link: `https://docs.dv.net/${ locale.value || 'en' }`, text: `FAQ` },
      { id: 3, iconName: "support-agent", link: `https://dv.net/${ !locale.value || locale.value === 'en' ? '' : locale.value }#support`, text: t('Contacts') },
    ]
  })
</script>

<template>
	<div class="payment-layout">
		<header class="header">
			<div class="container">
				<div class="header__inner">
					<icon-logo />
					<nav class="nav">
						<a
                v-for="item in navLinks"
                :key="item.id"
                class="nav__link"
                target="_blank"
                :href="item.link"
            >
              {{ item.text }}
						</a>
					</nav>
          <hamburger-menu :nav-links="navLinks" />
				</div>
			</div>
		</header>
		<main class="main">
			<div class="container">
				<slot />
			</div>
		</main>
	</div>
</template>

<style scoped lang="scss">
	.payment-layout {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}
	.container {
		max-width: $max-width-container + px;
		width: 100%;
		margin: 0 auto;
		flex-grow: 1;
		display: flex;
		padding: 0 $padding-main + px;
	}
	.header {
		min-height: 56px;
    padding: 8px 0;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		&__inner {
			flex-grow: 1;
			display: flex;
			justify-content: space-between;
			align-items: center;
      gap: 12px;
			&:deep(.ui-languages--trigger) {
				height: 35px;
			}
		}
		.nav {
			display: flex;
			align-items: center;
			column-gap: 64px;
      flex-wrap: wrap;
      @include mediamax(1024) {
        column-gap: 32px;
      }
      @include mediamax(1024) {
        display: none !important;
      }
      &__link {
        width: max-content;
        color: $main-color;
        font-weight: 500;
        border-bottom: 2px solid transparent;
        margin-top: 2px;
        transition: border-bottom 0.3s ease-in-out;
        word-break: break-word;
        max-width: 500px;
        @media (hover: hover) {
          &:hover {
            cursor: pointer;
            border-bottom: 2px solid;
          }
        }
      }
		}
	}
	.main {
		flex-grow: 1;
		display: flex;
		padding: 40px 0;
	}
</style>
