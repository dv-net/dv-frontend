<script setup lang="ts">
	import IconLogo from "@pay/components/icons/IconLogo.vue";
	import LangSelect from "@pay/components/ui/langSelect/LangSelect.vue";
	import { useI18n } from "vue-i18n";

	const { locale } = useI18n()
</script>

<template>
	<div class="payment-layout">
		<header class="header">
			<div class="container">
				<div class="header__inner">
					<icon-logo />
					<nav class="header__nav">
						<a class="header__link" target="_blank" :href="`https://dv.net/${ !locale || locale === 'en' ? '' : locale }`">
							{{ $t('More about') }} Merchant
						</a>
						<a class="header__link" target="_blank" :href="`https://docs.dv.net/${ locale || 'en' }`">
							FAQ
						</a>
						<a class="header__link" target="_blank" :href="`https://dv.net/${ !locale || locale === 'en' ? '' : locale }#support`">
							{{ $t('Contacts') }}
						</a>
					</nav>
					<lang-select for-header />
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
		flex-shrink: 0;
		display: flex;
		align-items: center;
		&__inner {
			flex-grow: 1;
			display: flex;
			justify-content: space-between;
			align-items: center;
			&:deep(.ui-languages--trigger) {
				height: 35px;
			}
		}
		&__nav {
			display: flex;
			align-items: center;
			gap: 64px;
		}
		&__link {
			width: max-content;
			color: $main-color;
			font-weight: 500;
			border-bottom: 2px solid transparent;
			margin-top: 2px;
			transition: border-bottom 0.3s ease-in-out;
			@media (hover: hover) {
				&:hover {
					cursor: pointer;
					border-bottom: 2px solid;
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
