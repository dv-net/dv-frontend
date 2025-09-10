<script setup lang="ts">
	import { UiCopyText, UiIcon, UiTooltip } from "@dv.net/ui-kit";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { isDesktopDevice } from "@shared/utils/helpers/media.ts";
	import QrcodeVue from "qrcode.vue";
	import { computed } from "vue";
	import CardSelectBlockchain from "@pay/views/payerForm/components/steps/cardSelectBlockchain/CardSelectBlockchain.vue";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";

	const { currentAddress, currentCurrency, currentChain } = storeToRefs(usePayerFormStore());
	const { getAmountRate } = usePayerFormStore();

	const currentPrice = computed<string>(() => getAmountRate(currentCurrency.value as CurrencyType));
</script>

<template>
	<wrapper-block>
		<div class="payment">
			<div class="flex flex-column gap-12">
				<card-select-blockchain
					type="currency"
					:currency="currentCurrency as CurrencyType"
				/>
				<card-select-blockchain
					type="blockchain"
					:currency-id="`${currentCurrency}.${currentChain}` as BlockchainType"
				/>
			</div>
			<div class="address">
				<div class="address__label">
					<span>{{ $t("Copy the permanent address") }}</span>
					<ui-tooltip
						:title="$t('Permanent address')"
						:text="$t('This is your permanent wallet, so we always wait for funds to arrive and credit them immediately')"
					>
						<ui-icon class="flex-shrink-0" name="help" type="filled" color="#A4A5B1" />
					</ui-tooltip>
				</div>
				<div class="address__inner">
					<div class="input">
						<span class="input__text">{{ currentAddress || "—" }}</span>
						<ui-copy-text v-if="currentAddress" :copied-text="currentAddress" color-icon="#A4A5B1" />
					</div>
					<ui-tooltip :show-event="isDesktopDevice() ? 'hover' : 'click'" :teleport="false">
						<template #text>
							<div class="tooltip">
								<qrcode-vue
									class="tooltip__qr-code"
									v-if="currentAddress"
									:value="currentAddress"
									level="M"
									render-as="svg"
								/>
								<span class="tooltip__text">{{ $t("Scan the QR code") }}</span>
							</div>
						</template>
						<div class="qr-code">
							<ui-icon class="flex-shrink-0" name="qr-code-scanner" type="400" size="lg" />
						</div>
					</ui-tooltip>
				</div>
			</div>
			<div class="sum">
				<span class="sum__label">{{ $t("Sum") }}</span>
				<div class="sum__inner">
					<div class="sum__input">
						<span>{{ currentPrice }} {{ currentCurrency }}</span>
						<ui-copy-text :copied-text="currentPrice" color-icon="#A4A5B1" />
					</div>
					<span class="sum__description">{{ $t("Recommended commission") }}: —</span>
				</div>
			</div>
		</div>
	</wrapper-block>
</template>

<style scoped lang="scss">
	.payment {
		display: flex;
		flex-direction: column;
		gap: 16px;
		.address {
			display: flex;
			flex-direction: column;
			gap: 12px;
			@include mediamax(480) {
				gap: 8px;
			}
			&__label {
				display: flex;
				align-items: center;
				gap: 4px;
				color: $main-subtitle-color;
				@include mediamax(480) {
					font-size: 14px;
				}
			}
			&__inner {
				display: flex;
				align-items: center;
				gap: 8px;
				.input {
					flex-grow: 1;
					display: flex;
					align-items: center;
					min-height: 56px;
					gap: 12px;
					padding: 8px 16px;
					justify-content: space-between;
					border-radius: 8px;
					border: 1px solid $main-border-color;
					background-color: $form-background;
					@include mediamax(768) {
						min-height: 48px;
					}
					@include mediamax(480) {
						padding: 8px 12px;
						min-height: 44px;
					}
					&__text {
						word-break: break-word;
						@include mediamax(1024) {
							font-size: 14px;
						}
						@include mediamax(480) {
							font-size: 12px;
						}
					}
				}
				.qr-code {
					height: 56px;
					width: 56px;
					@extend .center;
					border-radius: 8px;
					border: 1px solid $main-border-color;
					background-color: $form-background;
					@include mediamax(768) {
						height: 48px;
						width: 48px;
					}
					@include mediamax(480) {
						height: 44px;
						width: 44px;
					}
				}
				.tooltip {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 24px;
					padding: 24px;
					&__qr-code {
						width: 150px;
						height: 150px;
					}
				}
			}
		}
		.sum {
			display: flex;
			flex-direction: column;
			gap: 12px;
			@include mediamax(480) {
				gap: 8px;
			}
			&__label {
				color: $main-subtitle-color;
				@include mediamax(480) {
					font-size: 14px;
				}
			}
			&__inner {
				display: flex;
				flex-direction: column;
				gap: 6px;
			}
			&__input {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 12px;
				height: 56px;
				flex-grow: 1;
				padding: 8px 16px;
				border-radius: 8px;
				border: 1px solid $main-border-color;
				background-color: $form-background;
				@include mediamax(1024) {
					font-size: 14px;
				}
				@include mediamax(768) {
					height: 48px;
				}
				@include mediamax(480) {
					height: 44px;
				}
				@include mediamax(480) {
					padding: 8px 12px;
					font-size: 12px;
				}
			}
			&__description {
				color: $main-subtitle-color;
				font-size: 12px;
				font-weight: 400;
			}
		}
	}
</style>
