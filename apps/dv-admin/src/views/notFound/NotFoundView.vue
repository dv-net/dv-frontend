<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit/dist";
	import { useRouter } from "vue-router";
	import errorAvif from "@dv-admin/assets/images/404/404.avif";
	import errorWebp from "@dv-admin/assets/images/404/404.webp";

	const router = useRouter();
</script>

<template>
	<div class="page">
		<div class="page__inner">
			<picture>
				<source :srcset="errorAvif" type="image/avif" />
				<source :srcset="errorWebp" type="image/webp" />
				<img :src="errorWebp" alt="404" loading="lazy" />
			</picture>
			<h1 class="page__title">{{ $t("Page not found") }}</h1>
			<div class="page__actions">
				<ui-button type="secondary" @click="router.go(-1)" size="xl">
					{{ $t("Back") }}
				</ui-button>
				<ui-button mode="neutral" @click="router.push({ name: 'home' })" size="xl">
					{{ $t("To main") }}
				</ui-button>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		&__inner {
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		&__title {
			color: $black;
			font-size: 60px;
			font-weight: 700;
			line-height: 125%;
			text-align: center;
			margin: 40px 0 20px;
		}
		&__actions {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
		}
	}
</style>
