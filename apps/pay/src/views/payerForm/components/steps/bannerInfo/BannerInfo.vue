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

	const goToLanding = () => {
		window.open("https://dv.net", "_blank");
	};
</script>

<template>
	<wrapper-block class="wrapper-block" @click="goToLanding">
		<div class="banner">
			<div class="content">
				<img class="content__img" src="/static/squareLogo.png" alt="logo" loading="lazy" />
				<div class="content__inner">
					<h3 class="content__title"><ui-link href="">DV.net</ui-link> - {{ $t("Crypto Processing") }} DaVinci</h3>
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
	.wrapper-block {
		border: 1px solid transparent;
		transition: all 0.3s ease-in-out;
		@media (hover: hover) {
			&:hover {
				cursor: pointer;
				border: 1px solid rgba(22, 126, 180, 0.44);
				box-shadow:
					0 4px 12px 1px rgba(171, 176, 187, 0.06),
					0 4px 24px 1px rgba(171, 176, 187, 0.24);
			}
		}
	}
	.banner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		@media (max-width: 1024px) {
			grid-template-columns: 1fr 300px;
		}
		@media (max-width: 768px) {
			grid-template-columns: 1fr;
		}
		.content {
			display: flex;
			align-items: center;
			gap: 24px;
			@media (max-width: 1024px) {
				gap: 16px;
			}
			&__img {
				width: 64px;
				height: 64px;
				flex-shrink: 0;
				@media (max-width: 1024px) {
					width: 54px;
					height: 54px;
				}
				@media (max-width: 480px) {
					width: 40px;
					height: 40px;
				}
			}
			&__inner {
				display: flex;
				flex-direction: column;
				gap: 8px;
				@media (max-width: 1024px) {
					gap: 6px;
				}
			}
			&__title {
				font-size: 20px;
				font-weight: 600;
				line-height: 24px;
				color: $main-title-color;
				@media (max-width: 1024px) {
					font-size: 18px;
				}
				@media (max-width: 480px) {
					font-size: 16px;
				}
				&:deep(.ui-link) {
					font-size: 20px;
					font-weight: 600;
					@media (max-width: 1024px) {
						font-size: 18px;
					}
					@media (max-width: 480px) {
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
				@media (max-width: 1024px) {
					font-size: 14px;
				}
				@media (max-width: 480px) {
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
			@media (max-width: 1024px) {
				justify-content: flex-end;
			}
			@media (max-width: 768px) {
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
				@media (max-width: 1024px) {
					padding: 4px 8px;
					font-size: 14px;
				}
				@media (max-width: 480px) {
					font-size: 12px;
				}
			}
		}
	}
</style>
