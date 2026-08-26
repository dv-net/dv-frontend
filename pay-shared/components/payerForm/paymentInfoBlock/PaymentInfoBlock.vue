<script setup lang="ts">
	import { UiButton, UiCopyText, UiIcon, UiInput, UiLink } from "@dv.net/ui-kit";
	import type { CurrencyType } from "@shared/utils/types/blockchain";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import CurrencyIcon from "@pay-shared/components/ui/currencyIcon/CurrencyIcon.vue";
	import RowTemplate from "@pay-shared/components/payerForm/rowTemplate/RowTemplate.vue";
	import { changeChainBsc } from "@shared/utils/helpers/general.ts";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import type { IPayerStoreResponse } from "@pay-shared/utils/types/payer";
	import { computed } from "vue";

	const {
		currentAddress = null,
		currentCurrency = null,
		currentChain = null,
		currentPrice = "",
		tokenLabel = "",
		currencyLabel = "",
		showChangeChain = false,
		payerId = null,
		store = null,
		showRefreshAddress = false,
		isRefreshingAddress = false
	} = defineProps<{
		currentAddress?: string | null;
		currentCurrency?: string | null;
		currentChain?: string | null;
		currentPrice?: string;
		tokenLabel?: string;
		currencyLabel?: string;
		showChangeChain?: boolean;
		payerId?: string | null;
		store?: IPayerStoreResponse | null;
		showRefreshAddress?: boolean;
		isRefreshingAddress?: boolean;
	}>();

	const emit = defineEmits<{
		(event: "change-step", step: 1 | 2): void;
		(event: "refresh-address"): void;
	}>();

	const inputTextSum = computed(() => `${currentPrice} ${currentCurrency ?? ""}`.trim());
</script>

<template>
	<div class="info">
		<div class="info__inner">
			<div class="info__card">
				<div class="info__inputs">
					<row-template :label="$t('Chain')">
						<div class="blockchain">
							<div class="blockchain__inner">
								<blockchain-icon
									width="16px"
									height="16px"
									:type="blockchainCurrencyId[currentChain ? currentChain.toLowerCase() : 'IconDefault']"
								/>
								<div class="blockchain__label">
									<span>{{ changeChainBsc(currentChain) }}</span>
									<span v-if="tokenLabel">({{ tokenLabel }})</span>
								</div>
							</div>
							<ui-link v-if="showChangeChain" size="md" @click="emit('change-step', 2)">
								{{ $t("Change") }}
							</ui-link>
						</div>
					</row-template>
					<row-template :label="$t('Cryptocurrency')">
						<div class="blockchain">
							<div class="blockchain__inner">
								<currency-icon
									width="16px"
									height="16px"
									:type="(currentCurrency || 'IconDefault') as CurrencyType"
								/>
								<div class="blockchain__label">
									<span>{{ currentCurrency }}</span>
									<span v-if="currencyLabel">({{ currencyLabel }})</span>
								</div>
							</div>
							<ui-link size="md" @click="emit('change-step', 1)">{{ $t("Change") }}</ui-link>
						</div>
					</row-template>
				</div>
			</div>
			<div class="info__card">
				<div class="info__inputs">
					<row-template
						:label="$t('Permanent address')"
						:description-title="$t('Permanent address')"
						:description-text="$t('Your permanent wallet — funds are credited to it automatically upon receipt')"
					>
						<ui-input type="text" :model-value="currentAddress ?? ''" readonly-interactive filled>
							<template #append>
								<ui-copy-text v-if="currentAddress" :copied-text="currentAddress" color-icon="#242424" />
							</template>
						</ui-input>
						<ui-button
							v-if="showRefreshAddress"
							type="secondary"
							size="sm"
							:loading="isRefreshingAddress"
							@click="emit('refresh-address')"
						>
							{{ $t("Refresh address") }}
						</ui-button>
					</row-template>
					<row-template :label="$t('Sum')">
						<ui-input type="text" :model-value="inputTextSum" readonly-interactive filled>
							<template #prepend>
								<blockchain-icon
									:type="`${currentCurrency}.${currentChain}` as BlockchainType"
									width="24px"
									height="24px"
								/>
							</template>
							<template #append>
								<ui-copy-text v-if="currentPrice" :copied-text="currentPrice" color-icon="#242424" />
							</template>
						</ui-input>
					</row-template>
				</div>
			</div>
		</div>
		<div class="info__card">
			<div class="details">
				<div class="details__top">
					<span>{{ $t("Payment ID") }}</span>
					<div v-if="payerId" class="details__top-inner">
						<span class="details__top-id">{{ payerId }}</span>
						<ui-copy-text :copied-text="payerId" color-icon="#6B6D80" />
					</div>
					<span v-else>—</span>
				</div>
				<div class="details__body">
					<template v-if="store?.name && store?.site_url">
						<span>{{ $t("Site") }}</span>
						<ui-link :href="store.site_url" target="_blank" class="flex flex-y-center gap-8">
							<span>{{ store.name }}</span>
							<ui-icon name="new-windows" type="400" />
						</ui-link>
					</template>
					<template v-else-if="store?.name && !store?.site_url">
						<span>{{ $t("Site") }}</span>
						<span>{{ store.name }}</span>
					</template>
				</div>
				<div class="details__bottom">
					<span>{{ $t("Sum") }}:</span>
					<slot name="amount" />
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.info {
		display: grid;
		grid-template-columns: 1fr 319px;
		border-radius: 14px;
		border: 1px solid #e1e8f1;
		background-color: #f7f9fb;
		padding: 4px;
		gap: 4px;
		min-height: 250px;
		@include mediamax(1180) {
			grid-template-columns: 1fr;
		}
		@include mediamax(680) {
			gap: 16px;
			background-color: transparent;
			border: unset;
			border-radius: unset;
			padding: 0;
		}
		&__inner {
			display: grid;
			grid-template-columns: 319px 1fr;
			gap: 4px;
			@include mediamax(680) {
				grid-template-columns: 1fr;
				gap: 16px;
			}
		}
		&__card {
			display: flex;
			padding: 24px 22px;
			flex-direction: column;
			flex-shrink: 0;
			border-radius: 12px;
			border: 1px solid #e1e8f1;
			background-color: $form-background;
			@include mediamax(680) {
				padding: 16px;
			}
		}
		&__inputs {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			gap: 24px;
			flex-grow: 1;
			.blockchain {
				min-height: 44px;
				padding: 12px 16px;
				display: flex;
				gap: 8px;
				justify-content: space-between;
				align-items: center;
				border-radius: 8px;
				border: 1px solid #e1e8f1;
				background-color: #f7f9fb;
				&__inner {
					display: flex;
					align-items: center;
					gap: 4px;
				}
				&__label {
					display: flex;
					align-items: center;
					gap: 4px;
					color: $main-text-grey-color;
					font-size: 12px;
					font-weight: 500;
					line-height: 16px;
				}
			}
		}
		.details {
			display: flex;
			flex-direction: column;
			color: #303345;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			@include mediamax(1180) {
				align-items: center;
				flex-direction: unset;
			}
			@include mediamax(680) {
				align-items: unset;
				flex-direction: column;
			}
			&__top {
				display: flex;
				flex-direction: column;
				gap: 4px;
				margin: 0 0 16px 0;
				@include mediamax(1180) {
					gap: 14px;
					margin: 0;
					padding-right: 16px;
					border-right: 1px solid $main-border-color;
					flex-grow: 1;
				}
				@include mediamax(890) {
					max-width: 250px;
				}
				@include mediamax(768) {
					max-width: 200px;
				}
				@include mediamax(680) {
					gap: 4px;
					max-width: unset;
					margin: 0 0 16px 0;
					padding: 0;
					border-right: unset;
					flex-grow: unset;
				}
				&-inner {
					display: flex;
					align-items: center;
					gap: 10px;
					@include mediamax(1180) {
						gap: 8px;
					}
					@include mediamax(680) {
						gap: 10px;
					}
				}
				&-id {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
			&__body {
				display: flex;
				flex-direction: column;
				gap: 4px;
				padding: 0 0 16px 0;
				border-bottom: 1px solid $main-border-color;
				@include mediamax(1180) {
					padding: 0 16px;
					border-right: 1px solid $main-border-color;
					border-bottom: unset;
					gap: 14px;
					flex-grow: 1;
				}
				@include mediamax(680) {
					padding: 0 0 16px 0;
					border-right: unset;
					border-bottom: 1px solid $main-border-color;
					gap: 4px;
					flex-grow: unset;
				}
			}
			&__bottom {
				display: flex;
				gap: 8px;
				justify-content: space-between;
				flex-grow: 1;
				padding: 16px 0 0;
				@include mediamax(1180) {
					padding: 0 0 0 16px;
					justify-content: unset;
					flex-direction: column;
					gap: 4px;
				}
				@include mediamax(680) {
					padding: 16px 0 0;
					justify-content: space-between;
					flex-direction: unset;
					gap: 8px;
				}
			}
		}
	}
</style>
