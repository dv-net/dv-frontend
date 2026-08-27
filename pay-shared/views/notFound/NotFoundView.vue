<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import { useRouter } from "vue-router";
	import { UiButton, UiLink } from "@dv.net/ui-kit";
	import { loaderShutdown } from "@pay-shared/utils/helpers/general";
	import { useI18n } from "vue-i18n";

	const router = useRouter();
	const { t } = useI18n();
	const errorImgSrc = ref("");

	onMounted(() => {
		loaderShutdown();
		document.title = t("Page not found");
		void import("@pay-shared/assets/images/error.webp").then((module) => {
			errorImgSrc.value = module.default;
		});
	});
</script>

<template>
	<div class="page">
		<div class="card">
			<div class="card__media">
				<span class="card__code" aria-hidden="true">404</span>
				<img v-if="errorImgSrc" class="card__img" :src="errorImgSrc" alt="" />
			</div>
			<div class="card__content">
				<h1 class="card__title">{{ $t("Page not found") }}</h1>
				<p class="card__text">{{ $t("This page does not exist or was moved") }}</p>
				<div class="card__actions">
					<ui-button type="primary" size="lg" @click="router.go(-1)">
						{{ $t("Back") }}
					</ui-button>
					<ui-link href="https://dv.net/#support" target="_blank">
						{{ $t("Helpdesk") }}
					</ui-link>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		width: 100%;
		max-width: 520px;
		padding: 16px;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding: 24px;
		border-radius: 16px;
		background-color: $form-background;
		box-shadow: 0 1px 2px rgb(16 24 40 / 4%);

		&__media {
			position: relative;
			@extend .center;
			min-height: 180px;
			border-radius: 12px;
			background: $main-background;
			overflow: hidden;
		}

		&__code {
			position: absolute;
			z-index: 1;
			color: $main-title-color;
			font-family: $font-family-main;
			font-size: 72px;
			font-weight: 700;
			line-height: 1;
			letter-spacing: -0.04em;
			opacity: 0.12;
			user-select: none;
			@include mediamax(480) {
				font-size: 56px;
			}
		}

		&__img {
			position: relative;
			z-index: 2;
			max-width: 160px;
			width: 40%;
			height: auto;
		}

		&__content {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		&__title {
			color: $main-title-color;
			font-family: $font-family-main;
			font-size: 22px;
			font-weight: 600;
			line-height: 120%;
			@include mediamax(480) {
				font-size: 18px;
			}
		}

		&__text {
			color: $main-text-grey-color;
			font-size: 14px;
			font-weight: 400;
			line-height: 140%;
		}

		&__actions {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 16px;
			margin-top: 4px;
		}
	}
</style>
