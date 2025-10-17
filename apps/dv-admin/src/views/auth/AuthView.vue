<script setup lang="ts">
	import IconLogo from "@dv-admin/components/icons/IconLogo.vue";
	import { useRoute } from "vue-router";
	import LangSelect from "@dv-admin/components/ui/langSelect/LangSelect.vue";
	import { DESCRIPTIONS_AUTH, TITLES_AUTH } from "@dv-admin/utils/constants/auth";
	import successLoginLogoAnimation from "@dv-admin/assets/animations/success-login-logo.json";
	import { LottieAnimation } from "lottie-web-vue";
	import hiHand from "@dv-admin/assets/images/auth/hi-hand.png";

	const route = useRoute();
</script>

<template>
	<!--	placeholder for login animation curve to work-->
	<lottie-animation style="position: absolute; z-index: -1" :animation-data="successLoginLogoAnimation" />

	<div class="auth">
		<div class="img-container">
			<video src="/static/video/login-1360x1800.webm" autoplay muted loop playsinline />
		</div>
		<div class="content">
			<div class="content__header">
				<icon-logo class="content__header-logo" />
				<div class="content__header-title">
					<div class="flex gap-8">
						<h1>{{ route.name && route.name in TITLES_AUTH ? $t(TITLES_AUTH[route.name as string]) : "" }}</h1>
						<img v-if="route.name === 'sign-in'" :src="hiHand" alt=" " loading="lazy" class="h-40" />
					</div>
					<p v-if="route.name === 'sign-in' || route.name === 'sign-up'">
						{{ route.name && route.name in DESCRIPTIONS_AUTH ? $t(DESCRIPTIONS_AUTH[route.name as string]) : "" }}
					</p>
				</div>
			</div>
			<RouterView />
			<div class="content__locale">
				<lang-select />
			</div>
			<div class="content__rights">{{ new Date().getFullYear() }} DV.net, {{ $t("All rights reserved") }}</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.auth {
		display: flex;
		height: fit-content;
		background-color: #fff;
		max-width: 1400px;
		border-radius: 32px;
		margin: 24px;
		gap: 24px;
		padding-right: 24px;
		width: 100%;

		.img-container {
			display: flex;
			background-color: #ecf0f5;
			border-radius: 32px 40px 40px 32px;
			width: 680px;
			height: 900px;
			overflow: hidden;
			video {
				width: 100%;
				height: 100%;
				object-fit: cover;
				object-position: center;
				display: block;
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			margin: auto;
			max-width: 456px;
			gap: 32px;
			width: 100%;

			&__header {
				display: flex;
				flex-direction: column;
				gap: 20px;
			}

			&__header-title {
				display: flex;
				flex-direction: column;
				gap: 8px;

				h1 {
					color: $black;
					font-size: 32px;
					line-height: 40px;
					font-weight: 700;
				}

				p {
					color: $secondary;
					font-size: 16px;
					line-height: 20px;
					font-weight: 500;
				}

				img {
					max-height: 40px;
				}
			}

			&__locale {
				border: 1px solid var(--color-separator-border-inactive);
				background: var(--color-background-secondary);
				padding: 16px;
				border-radius: 12px;
				width: 100%;
			}

			&__rights {
				align-self: center;
				color: $grey-opacity;
				font-size: 12px;
				font-weight: 500;
				line-height: 16px;
				margin-top: 4px;
			}
		}
	}
</style>
