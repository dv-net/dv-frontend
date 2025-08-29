<script setup lang="ts">
	import { UiButton, UiIcon } from "@dv.net/ui-kit/dist";
	import { ref } from "vue";
	import { useRouter } from "vue-router";
	import bgAvif from "@dv-admin/assets/images/installer/bg-home.avif";
	import bgWebp from "@dv-admin/assets/images/installer/bg-home.webp";

	const router = useRouter();

	const technologies = ref([
		{ id: 1, icon: "check-circle", text: "PostgreSQL" },
		{ id: 2, icon: "check-circle", text: "Redis" }
	]);
</script>

<template>
	<div class="page">
		<div class="page__inner">
			<div class="page__photo">
				<picture>
					<source :srcset="bgAvif" type="image/avif" />
					<source :srcset="bgWebp" type="image/webp" />
					<img :src="bgWebp" alt="Background" loading="lazy" />
				</picture>
			</div>
			<h1 class="page__title">{{ $t("Welcome to the DaVinci Project") }}</h1>
			<div class="page__block">
				<div class="technologies">
					<div v-for="item in technologies" :key="item.id" class="technologies__item">
						<span>{{ item.text }}</span>
						<ui-icon color="#1F9649" type="400" :name="item.icon" size="lg" />
					</div>
				</div>
				<ui-button class="page__btn" mode="neutral" size="xl" @click="router.push({ name: 'installer-sign-up' })">
					{{ $t("Next") }}
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
		&__photo {
			display: flex;
			justify-content: center;
			align-items: flex-end;
			height: 332px;
			width: 600px;
			overflow: hidden;
			border-radius: 16px;
			background-color: $blue-light;
			& > img {
				flex-shrink: 0;
			}
		}
		&__title {
			text-align: center;
			color: $black;
			font-size: 40px;
			font-weight: 700;
			line-height: 48px;
			margin: 24px 0 40px;
		}
		&__inner {
			display: flex;
			flex-direction: column;
			max-width: 600px;
			width: 100%;
		}
		&__block {
			display: flex;
			align-items: center;
			flex-direction: column;
			gap: 32px;
			.technologies {
				width: 100%;
				display: flex;
				flex-direction: column;
				gap: 16px;
				&__item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 0 24px 0 12px;
					height: 52px;
					border: 1px solid $grey;
					background-color: #e6faed;
					border-radius: 8px;
					font-size: 14px;
					font-weight: 500;
					line-height: 20px;
				}
			}
		}
	}
</style>
