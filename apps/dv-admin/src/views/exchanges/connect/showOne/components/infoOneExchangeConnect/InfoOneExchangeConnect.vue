<script setup lang="ts">
	import { exchangeLogo } from "@dv-admin/utils/constants/exchange";
	import { UiButton, UiCopyText, UiLink } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import type { ExchangeSlugType } from "@dv-admin/utils/types/api/apiGo";
	import { storeToRefs } from "pinia";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { useRouter } from "vue-router";
	import { useI18n } from "vue-i18n";

	const router = useRouter();
	const { locale } = useI18n();
	const { dictionary } = storeToRefs(useGeneralStore());

	defineProps<{ slug: ExchangeSlugType }>();
</script>

<template>
	<block-section class="info">
		<div class="info__top">
			<div class="flex-grow-1 center">
				<component :is="exchangeLogo[slug]" />
			</div>
			<ui-button
				type="secondary"
				left-icon-name="autorenew 1"
				left-icon-size="lg"
				@click="router.push({ name: 'exchanges-connect' })"
			>
				{{ $t("Select another") }}
			</ui-button>
		</div>
		<div class="info__bottom">
			<div class="info__content">
				<p class="info__text">
					{{ $t("To access via API keys, you must specify the following IP address on the crypto exchange") }}:
				</p>
				<ui-link :href="`https://docs.dv.net/${locale}/exchanges/${slug}.html`" target="_blank">
					{{ $t("Instructions-exchange", { exchange: slug.toUpperCase() }) }}
				</ui-link>
			</div>
			<div class="info__ip" v-if="dictionary?.backend_address">
				<span>{{ dictionary.backend_address }}</span>
				<ui-copy-text :copied-text="dictionary.backend_address" color-icon="#A4A5B1" />
			</div>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.info {
		display: flex;
		flex-direction: column;
		padding: 0 !important;
		overflow: hidden;
		&__top {
			display: flex;
			align-items: center;
			border-bottom: 1px solid $grey;
			background-color: $blue-opacity;
			height: 96px;
			padding: 0 24px;
		}
		&__bottom {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 15px;
			padding: 20px 24px;
		}
		&__ip {
			border: 1px solid $grey;
			background-color: $blue-opacity;
			padding: 8px 12px;
			display: flex;
			align-items: center;
			gap: 8px;
			border-radius: 8px;
			& > span {
				color: $black;
				font-size: 24px;
				font-weight: 600;
				line-height: 32px;
			}
		}
		&__content {
			display: flex;
			flex-direction: column;
			gap: 8px;
			&:deep(.ui-link) {
				border-bottom: 1px solid $blue;
			}
		}
		&__text {
			max-width: 582px;
			color: $black;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			width: 100%;
		}
	}
</style>
