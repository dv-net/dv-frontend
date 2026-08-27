<script setup lang="ts">
	import { UiCopyText, UiIcon, UiLink } from "@dv.net/ui-kit";
	import { truncateHash } from "@shared/utils/helpers/general.ts";
	import { computed } from "vue";
	import BlockAdvertising from "@pay-shared/components/payerForm/blockAdvertising/BlockAdvertising.vue";
	import WrapperBlock from "@pay-shared/components/payerForm/wrapperBlock/WrapperBlock.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";
	import BlockLatestTransactions from "@pay-shared/components/payerForm/blockLatestTransactions/BlockLatestTransactions.vue";
	import type { ILatestTransaction } from "@pay-shared/components/payerForm/blockLatestTransactions/types";
	import { formatFiatAmount } from "@pay-shared/utils/helpers/fiat";
	import type { IPayerFormSidebarStore } from "./types";

	const {
		payerId = null,
		store = null,
		hasError = false,
		currentStep,
		isShowAdvertising = false,
		isShowBlockLatestTransactions = false,
		transactions = [],
		amount = null,
		fiatCurrency = "USD"
	} = defineProps<{
		payerId?: string | null;
		store?: IPayerFormSidebarStore | null;
		hasError?: boolean;
		currentStep: number;
		isShowAdvertising?: boolean;
		isShowBlockLatestTransactions?: boolean;
		transactions?: ILatestTransaction[];
		amount?: number | string | null;
		fiatCurrency?: string;
	}>();

	const isMediaMax480 = useMediaQuery("(max-width: 480px)");

	const isShowSidebar = computed<boolean>(() => ![3, 4, 5].includes(currentStep));
	const isShowDetails = computed<boolean>(() => !hasError && isShowSidebar.value);
	const formattedAmount = computed<string>(() => formatFiatAmount(amount, fiatCurrency));
</script>

<template>
	<div v-if="isShowSidebar" class="sidebar">
		<wrapper-block v-if="isShowDetails">
			<div class="details">
				<h2 class="details__title">{{ $t("Payment details") }}</h2>
				<div class="details__content">
					<div class="row">
						<span class="row__label">{{ $t("Payment ID") }}</span>
						<div v-if="payerId" class="flex flex-y-center gap-8">
							<span>{{ truncateHash(payerId, 12) }}</span>
							<ui-copy-text :copied-text="payerId" color-icon="#A4A5B1" />
						</div>
						<span v-else>—</span>
					</div>
					<div v-if="store?.name && store?.site_url" class="row">
						<span class="row__label">{{ $t("Site") }}</span>
						<ui-link
							:href="store.site_url"
							target="_blank"
							:size="isMediaMax480 ? 'lg' : 'xl'"
							class="flex flex-y-center gap-8"
						>
							<span>{{ store.name }}</span>
							<ui-icon name="new-windows" type="400" />
						</ui-link>
					</div>
					<div v-else-if="store?.name && !store?.site_url" class="row">
						<span class="row__label">{{ $t("Site") }}</span>
						<span>{{ store.name }}</span>
					</div>
				</div>
				<div class="details__bottom">
					<span class="details__bottom-label">{{ $t("Sum") }}:</span>
					<slot>
						<span class="details__amount">{{ formattedAmount }}</span>
					</slot>
				</div>
			</div>
		</wrapper-block>
		<block-latest-transactions
			v-if="isShowBlockLatestTransactions"
			class="sidebar__latest-transactions"
			:transactions="transactions"
			:fiat-currency="fiatCurrency"
		/>
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
			&__title {
				color: $main-title-color;
				font-family: $font-family-main;
				font-size: 20px;
				font-weight: 600;
				line-height: 120%;
				@include mediamax(768) {
					font-size: 18px;
				}
				@include mediamax(480) {
					font-size: 16px;
				}
			}
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
				align-items: flex-start;
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
			}
			&__amount {
				color: $main-text-link-and-price-color;
				font-size: 32px;
				font-weight: 700;
				line-height: 40px;
				@include mediamax(480) {
					font-size: 24px;
				}
			}
		}
		&__advertising,
		&__latest-transactions {
			@include mediamax(1024) {
				display: none;
			}
		}
	}
</style>
