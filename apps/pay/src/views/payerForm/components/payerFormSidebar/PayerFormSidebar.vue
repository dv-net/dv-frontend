<script setup lang="ts">
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { UiCopyText, UiIcon, UiLink } from "@dv.net/ui-kit";
	import { formatDollars, truncateHash } from "@shared/utils/helpers/general.ts";
	import { computed } from "vue";
	import BlockAdvertising from "@pay/views/payerForm/components/payerFormSidebar/blockAdvertising/BlockAdvertising.vue";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";

	const { payerId, store, amount, errorStore, currentStep, isShowAdvertising } = storeToRefs(usePayerFormStore());

	const isMediaMax480 = useMediaQuery("(max-width: 480px)");

	const isShowSidebar = computed<boolean>(() => currentStep.value !== 5);
	const isShowDetails = computed<boolean>(() => !errorStore.value && (currentStep.value !== 5));
</script>

<template>
	<div v-if="isShowSidebar" class="sidebar">
		<wrapper-block v-if="isShowDetails">
			<div class="details">
				<h2 class="global-title-h2">{{ $t("Payment details") }}</h2>
				<div class="details__content">
					<div class="row">
						<span class="row__label">{{ $t("Payment ID") }}</span>
						<div v-if="payerId" class="flex flex-y-center gap-8">
							<span>{{ truncateHash(payerId, 12) }}</span>
							<ui-copy-text :copied-text="payerId" color-icon="#A4A5B1" />
						</div>
						<span v-else>—</span>
					</div>
					<div class="row">
						<span class="row__label">{{ $t("Site") }}</span>
						<ui-link
							v-if="store?.name && store?.site_url"
							:href="store.site_url"
							target="_blank"
							:size="isMediaMax480 ? 'lg' : 'xl'"
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
		</wrapper-block>
		<block-advertising v-if="isShowAdvertising" class="sidebar__advertising" />
	</div>
</template>

<style scoped lang="scss">
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 492px;
		flex-shrink: 0;
		@include mediamax(1180) {
			width: 400px;
		}
		@include mediamax(1024) {
			width: 100%;
		}
		.details {
			display: flex;
			flex-direction: column;
			&__content {
				display: flex;
				flex-direction: column;
				gap: 12px;
				padding: 20px 0 44px;
				border-bottom: 1px solid $main-border-color;
				@include mediamax(480) {
					gap: 8px;
					padding: 12px 0 20px;
				}
				.row {
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 12px;
					color: $main-text-grey-color;
					font-size: 16px;
					font-weight: 400;
					line-height: 130%;
					@include mediamax(480) {
						display: flex;
						align-items: unset;
						justify-content: unset;
						flex-direction: column;
						gap: 4px;
						font-size: 14px;
					}
					&__label {
						@include mediamax(480) {
							font-size: 14px;
							opacity: 0.6;
						}
					}
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
				@include mediamax(480) {
					padding-top: 16px;
				}
				&-label {
					font-size: 20px;
					font-weight: 500;
					@include mediamax(480) {
						font-size: 16px;
					}
				}
				&-price {
					color: $main-text-link-and-price-color;
					font-size: 32px;
					@include mediamax(480) {
						font-size: 24px;
					}
					font-weight: 700;
				}
			}
		}
		&__advertising {
			@include mediamax(1024) {
				display: none;
			}
		}
	}
</style>
