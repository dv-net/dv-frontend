<script setup lang="ts">
	import { UiIcon, UiLink } from "@dv.net/ui-kit";
	import { computed } from "vue";
	import { useI18n } from "vue-i18n";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";

	const { t } = useI18n();

	const isMediaMax1024 = useMediaQuery("(max-width: 1024px)");

	const labelList = computed(() => [
		{ id: 1, title: "Open Source" },
		{ id: 2, title: t("No commissions") },
		{ id: 3, title: t("All cryptocurrencies") }
	]);
</script>

<template>
	<wrapper-block>
		<div class="banner">
			<div class="content">
				<img class="content__img" src="/static/squareLogo.png" alt="logo" loading="lazy" />
				<div class="content__inner">
					<h3 class="content__title">
						<ui-link href="https://dv.net/" target="_blank">DV.net</ui-link> - {{ $t("Crypto Processing") }} DaVinci
					</h3>
					<p class="content__text">
						{{ $t("Accept cryptocurrency on your website without commission and intermediaries") }}
					</p>
				</div>
			</div>
			<div class="labels">
				<div v-for="item in labelList" :key="item.id" class="labels__item">
					<ui-icon name="check-circle" type="filled" :size="isMediaMax1024 ? 'sm' : 'md'" />
					<span>{{ item.title }}</span>
				</div>
			</div>
		</div>
	</wrapper-block>
</template>

<style scoped lang="scss">
	.banner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		@include mediamax(1024) {
			grid-template-columns: 1fr 300px;
		}
		@include mediamax(768) {
			grid-template-columns: 1fr;
		}
		.content {
			display: flex;
			align-items: center;
			gap: 24px;
			@include mediamax(1024) {
				gap: 16px;
			}
			&__img {
				width: 64px;
				height: 64px;
				flex-shrink: 0;
				@include mediamax(1024) {
					width: 54px;
					height: 54px;
				}
				@include mediamax(480) {
					width: 40px;
					height: 40px;
				}
			}
			&__inner {
				display: flex;
				flex-direction: column;
				gap: 8px;
				@include mediamax(1024) {
					gap: 6px;
				}
			}
			&__title {
				font-size: 20px;
				font-weight: 600;
				line-height: 24px;
				color: $main-title-color;
				@include mediamax(1024) {
					font-size: 18px;
				}
				@include mediamax(480) {
					font-size: 16px;
				}
				&:deep(.ui-link) {
					font-size: 20px;
					font-weight: 600;
					@include mediamax(1024) {
						font-size: 18px;
					}
					@include mediamax(480) {
						font-size: 16px;
					}
				}
			}
			&__text {
				color: $main-text-grey-color;
				font-size: 16px;
				font-weight: 400;
				line-height: 20px;
				max-width: 350px;
				width: 100%;
				@include mediamax(1024) {
					font-size: 14px;
				}
				@include mediamax(480) {
					font-size: 14px;
				}
			}
		}
		.labels {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 8px;
			flex-wrap: wrap;
			@include mediamax(1024) {
				justify-content: flex-end;
			}
			@include mediamax(768) {
				justify-content: center;
			}
			&__item {
				padding: 6px 12px;
				display: flex;
				align-items: center;
				gap: 4px;
				border-radius: 100px;
				background-color: rgba(31, 150, 73, 0.08);
				color: #1f9649;
				font-size: 16px;
				font-weight: 400;
				@include mediamax(1024) {
					padding: 4px 8px;
					font-size: 14px;
				}
				@include mediamax(480) {
					font-size: 12px;
				}
			}
		}
	}
</style>
