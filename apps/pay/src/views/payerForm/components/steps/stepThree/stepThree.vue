<script setup lang="ts">
	import { UiCopyText, UiIcon, UiTooltip } from "@dv.net/ui-kit";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { isDesktopDevice } from "@shared/utils/helpers/media.ts";
	import QrcodeVue from "qrcode.vue";
	import { computed, onMounted, ref, watch } from "vue";
	import CardSelectBlockchain from "@pay/views/payerForm/components/steps/cardSelectBlockchain/CardSelectBlockchain.vue";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import LoaderSpinner from "@pay/components/ui/loaderSpinner/LoaderSpinner.vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";

	const { currentAddress, currentCurrency, currentChain, currentStep } = storeToRefs(usePayerFormStore());
	const { getAmountRate } = usePayerFormStore();

	const isMediaMax768 = useMediaQuery("(max-width: 768px)");
	const isMediaMax480 = useMediaQuery("(max-width: 480px)");

	const isShowQrCode = ref<boolean>(false)
	const priceRefOne = ref<HTMLDivElement | null>(null)
	const priceRefTwo = ref<HTMLDivElement | null>(null)

	const currentPrice = computed<string>(() => getAmountRate(currentCurrency.value as CurrencyType));

	const setWidthPriceRef = () => {
		if (priceRefOne.value && priceRefTwo.value) {
			priceRefOne.value.style.width = `unset`;
			priceRefTwo.value.style.width = `unset`;
			if (isMediaMax480.value) return;
			const width: number = Math.max(priceRefOne.value.offsetWidth, priceRefTwo.value.offsetWidth) + 1
			priceRefOne.value.style.width = `${width}px`;
			priceRefTwo.value.style.width = `${width}px`;
		}
	}

	watch(isMediaMax768, () => setWidthPriceRef())
	watch(isMediaMax480, () => setWidthPriceRef())

	onMounted(() => {
		setWidthPriceRef()
	})
</script>

<template>
	<wrapper-block>
		<div class="payment">
			<div class="flex flex-column gap-12">
				<card-select-blockchain
					type="currency"
					:currency="currentCurrency as CurrencyType"
					v-model:price-ref="priceRefOne"
				/>
				<card-select-blockchain
					type="blockchain"
					:currency-id="`${currentCurrency}.${currentChain}` as BlockchainType"
					v-model:price-ref="priceRefTwo"
				/>
			</div>
			<div class="payment__inner">
				<div class="address">
					<div class="address__label">
						<h3 class="global-title-h2">{{ $t("Copy the permanent address") }}</h3>
						<ui-tooltip
							:show-event="isDesktopDevice() ? 'hover' : 'click'"
							:title="$t('Permanent address')"
							:text="$t('Your permanent wallet — funds are credited to it automatically upon receipt')"
						>
							<ui-icon class="flex-shrink-0" name="help" type="filled" color="#A4A5B1" />
						</ui-tooltip>
					</div>
					<div class="address__inner">
						<div class="input">
							<span class="input__text">{{ currentAddress || "—" }}</span>
							<ui-copy-text v-if="currentAddress" :copied-text="currentAddress" color-icon="#A4A5B1" />
						</div>
					</div>
				</div>
				<div class="sum">
					<span class="sum__label">{{ $t("Sum") }}</span>
					<div class="sum__inner">
						<div class="sum__input">
							<div class="flex flex-y-center gap-14">
								<blockchain-icon :type="`${currentCurrency}.${currentChain}` as BlockchainType" />
								<span class="fw-500">{{ currentPrice }} {{ currentCurrency }}</span>
							</div>
							<ui-copy-text :copied-text="currentPrice" color-icon="#A4A5B1" />
						</div>
						<span class="sum__description">{{ $t("Recommended commission") }}: —</span>
					</div>
				</div>
			</div>
			<div v-if="currentStep === 3" class="status">
				<div class="status__top">
					<h3 class="global-title-h2">{{ $t("Payment status") }}</h3>
					<div class="status__top-qr" :class="{ selected: isShowQrCode }" @click="isShowQrCode = !isShowQrCode">
						<span>{{ $t(isShowQrCode ? "Hide QR payment" : "Show QR code for payment") }}</span>
						<ui-icon name="qr-code-scanner" type="400" />
					</div>
				</div>
				<div class="status__bottom">
					<div class="pending">
						<loader-spinner :width="isMediaMax480 ? '32px' : '44px'" />
						<span class="pending__text">{{ $t("We are waiting for the payment to arrive") }}</span>
					</div>
					<div v-if="currentAddress && isShowQrCode" class="qr">
						<qrcode-vue :value="currentAddress" class="qr__code" level="M" render-as="svg" />
					</div>
				</div>
			</div>
		</div>
	</wrapper-block>
</template>

<style scoped lang="scss">
	.payment {
		display: flex;
		flex-direction: column;
		gap: 24px;
		&__inner {
			display: flex;
			flex-direction: column;
			gap: 20px;
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
					font-size: 20px;
					font-weight: 600;
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
						color: $main-text-grey-color;
						border: 1px solid $main-border-color;
						background-color: $form-background;
						@include mediamax(768) {
							min-height: 48px;
						}
						@include mediamax(480) {
							padding: 8px 12px;
							min-height: 36px;
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
					@include mediamax(768) {
						font-size: 14px;
					}
					@include mediamax(480) {
						font-size: 12px;
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
					min-height: 56px;
					flex-grow: 1;
					padding: 8px 16px;
					border-radius: 8px;
					color: $main-text-grey-color;
					border: 1px solid $main-border-color;
					background-color: $form-background;
					@include mediamax(1024) {
						font-size: 14px;
					}
					@include mediamax(768) {
						min-height: 48px;
					}
					@include mediamax(480) {
						padding: 8px 12px;
						min-height: 36px;
					}
				}
				&__description {
					color: $main-subtitle-color;
					font-size: 12px;
					font-weight: 400;
					@include mediamax(480) {
						font-size: 10px;
					}
				}
			}
		}
		.status {
			display: flex;
			flex-direction: column;
			gap: 16px;
			@include mediamax(480) {
				gap: 8px;
			}
			&__top {
				display: flex;
				align-items: center;
				gap: 12px;
				justify-content: space-between;
				&-qr {
					display: flex;
					align-items: center;
					gap: 6px;
					color: $main-text-grey-color;
					font-size: 14px;
					font-weight: 500;
					transition: transform 0.1s ease-in-out;
					@media (hover: hover) {
						&:hover {
							transform: scale(1.02);
							cursor: pointer;
						}
					}
					@include mediamax(768) {
						font-size: 12px;
					}
					@include mediamax(480) {
						font-size: 10px;
					}
					&.selected {
						color: #1968e5;
					}
					& > span {
						text-align: right;
					}
				}
			}
			&__bottom {
				display: flex;
				align-items: center;
				gap: 8px;
				min-height: 116px;
				@include mediamax(480) {
					min-height: 96px;
				}
				.pending {
					display: flex;
					flex-direction: column;
					align-items: center;
					align-self: stretch;
					gap: 8px;
					padding: 20px 24px;
					border-radius: 12px;
					border: 1px solid $main-border-color;
					background: $form-background;
					flex-grow: 1;
					&__text {
						color: $main-text-grey-color;
						font-size: 16px;
						font-weight: 500;
						text-align: center;
						@include mediamax(768) {
							font-size: 14px;
						}
						@include mediamax(480) {
							font-size: 12px;
						}
					}
				}
				.qr {
					@extend .center;
					padding: 20px;
					border-radius: 12px;
					border: 1px solid $main-border-color;
					background: $form-background;
					align-self: stretch;
					@include mediamax(768) {
						padding: 20px 16px;
					}
					@include mediamax(480) {
						padding: 11px;
					}
					&__code {
						width: 75px;
						height: 75px;
					}
				}
			}
		}
	}
</style>
