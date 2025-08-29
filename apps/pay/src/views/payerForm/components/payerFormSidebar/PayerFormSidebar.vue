<script setup lang="ts">
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { UiCopyText, UiIcon, UiLink } from "@dv.net/ui-kit";
	import { formatDollars, truncateHash } from "@shared/utils/helpers/general.ts";
	import { computed } from "vue";

	const { payerId, store, amount, errorStore, currentStep } = storeToRefs(usePayerFormStore());

	const isShowDetails = computed<boolean>(() => {
		return !errorStore.value && currentStep.value !== 5;
	});
</script>

<template>
	<div class="sidebar">
		<div v-if="isShowDetails" class="details">
			<h2 class="global-title-h2">{{ $t("Payment details") }}</h2>
			<div class="details__content">
				<div class="row">
					<span>{{ $t("Payment ID") }}</span>
					<div v-if="payerId" class="flex flex-y-center gap-8">
						<span>{{ truncateHash(payerId, 15) }}</span>
						<ui-copy-text :copied-text="payerId" color-icon="#A4A5B1" />
					</div>
					<span v-else>—</span>
				</div>
				<div class="row">
					<span>{{ $t("Site") }}</span>
					<ui-link
						v-if="store?.name && store?.site_url"
						:href="store.site_url"
						target="_blank"
						size="xl"
						class="flex flex-y-center gap-8"
					>
						<span>{{ store.name }}</span>
						<ui-icon name="new-windows" type="400" />
					</ui-link>
					<span v-else>—</span>
				</div>
			</div>
			<div class="details__bottom">
				<span class="details__bottom-label">{{ $t("Sum") }}:</span>
				<span class="details__bottom-price">{{ formatDollars(amount) }}</span>
			</div>
		</div>
		<div class="advertising">
			<div class="content">
				<div class="content__inner">
					<h2 class="global-title-h2">{{ $t("You pay via DV.net") }}</h2>
					<p>{{ $t("Accept cryptocurrency on your website without paying intermediaries") }}</p>
				</div>
				<img src="@pay/assets/images/shield.webp" alt="shield" />
			</div>
			<div class="slogan">
				<p class="slogan__inner">
					<ui-link href="https://dv.net/" target="_blank">DaVinci Merchant</ui-link> -
					{{ $t("the cheapest way to accept cryptocurrency on your site") }}
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 492px;
		flex-shrink: 0;
		.details {
			display: flex;
			flex-direction: column;
			border-radius: 16px;
			background-color: $form-background;
			padding: 24px;
			&__content {
				display: flex;
				flex-direction: column;
				gap: 12px;
				padding: 20px 0 44px;
				border-bottom: 1px solid $main-border-color;
				.row {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 12px;
					color: $main-text-grey-color;
					font-size: 16px;
					font-weight: 400;
					line-height: 130%;
					&__site {
						color: $main-text-link-and-price-color;
					}
				}
			}
			&__bottom {
				padding-top: 20px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				&-label {
					font-size: 20px;
					font-weight: 500;
				}
				&-price {
					color: $main-text-link-and-price-color;
					font-size: 32px;
					font-weight: 700;
				}
			}
		}
		.advertising {
			display: flex;
			flex-direction: column;
			border-radius: 16px;
			gap: 38px;
			background-color: $form-background;
			padding: 24px;
			.content {
				display: flex;
				gap: 12px;
				justify-content: space-between;
				&__inner {
					display: flex;
					flex-direction: column;
					gap: 12px;
					color: $main-text-grey-color;
					font-size: 16px;
					font-weight: 400;
					line-height: 140%;
					max-width: 324px;
					width: 100%;
				}
			}
			.slogan {
				border-radius: 12px;
				border: 1px solid rgba(25, 104, 229, 0.1);
				background-color: rgba(25, 104, 229, 0.02);
				padding: 8px 20px;
				&__inner {
					max-width: 345px;
					width: 100%;
					color: $main-text-grey-color;
					font-size: 14px;
					font-weight: 400;
					line-height: 140%;
				}
			}
		}
	}
</style>
