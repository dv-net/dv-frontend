<script setup lang="ts">
	import { UiCopyText, UiIcon, UiTooltip } from "@dv.net/ui-kit";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import BannerInfo from "@pay/views/payerForm/components/bannerInfo/BannerInfo.vue";
	import { isDesktopDevice } from "@shared/utils/helpers/media.ts";
	import QrcodeVue from "qrcode.vue";
	import { computed } from "vue";

	const { currentAddress, currentCurrency, currentChain } = storeToRefs(usePayerFormStore());
	const { getAmountRate } = usePayerFormStore();

	const currentPrice = computed<string>(() => getAmountRate(`${currentCurrency.value}.${currentChain.value}`));
</script>

<template>
	<div class="payment">
		<div class="payment__top">
			<h2 class="global-title-h2">{{ $t("Copy the address") }}</h2>
			<banner-info
				:message="
					$t(
						'Please note: the rate is approximate. Before transferring from the exchange, check the current rate at the time of the transaction'
					)
				"
			/>
		</div>
		<div class="address">
			<div class="address__label">
				<span>{{ $t("Permanent address") }}</span>
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
</template>

<style scoped lang="scss">
	.payment {
		padding: 24px;
		display: flex;
		flex-direction: column;
		border-radius: 16px;
		gap: 24px;
		background-color: $form-background;
		&__top {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		.address {
			display: flex;
			flex-direction: column;
			gap: 12px;
			&__label {
				display: flex;
				align-items: center;
				gap: 4px;
				color: $main-subtitle-color;
			}
			&__inner {
				display: flex;
				align-items: center;
				gap: 8px;
				.input {
					min-height: 56px;
					flex-grow: 1;
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 8px 16px;
					justify-content: space-between;
					border-radius: 8px;
					border: 1px solid $main-border-color;
					background-color: $form-background;
					&__text {
						word-break: break-word;
					}
				}
				.qr-code {
					height: 56px;
					width: 56px;
					@extend .center;
					border-radius: 8px;
					border: 1px solid $main-border-color;
					background-color: $form-background;
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
			&__label {
				color: $main-subtitle-color;
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
				padding: 0 16px;
				border-radius: 8px;
				border: 1px solid $main-border-color;
				background-color: $form-background;
			}
			&__description {
				color: $main-subtitle-color;
				font-size: 12px;
				font-weight: 400;
			}
		}
	}
</style>
