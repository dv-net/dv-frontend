<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit";
	import QrcodeVue from "qrcode.vue";
	import { ref } from "vue";
	import { storeToRefs } from "pinia";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import CurrencyIcon from "@pay/components/ui/currencyIcon/CurrencyIcon.vue";
	import IconLogoQrCode from "@pay/components/icons/IconLogoQrCode.vue";
	import loaderTransactionPending from "@pay/assets/animations/loaderTransactionPending.json";
	import { LottieAnimation } from "lottie-web-vue";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import { useI18n } from "vue-i18n";

	const { locale } = useI18n();

	const { currentAddress, currentCurrency, currentChain } = storeToRefs(usePayerFormStore());

	defineProps<{
		isEvmConnected: boolean;
		isTronSupported: boolean;
		isEvmSupported: boolean;
		isLoadingEvmBtn: boolean;
	}>();

	defineEmits<{
		(event: "open-tron-modal"): void;
		(event: "open-evm-modal"): void;
	}>();

	const isShowQrCode = ref<boolean>(false);
</script>

<template>
	<div class="block">
		<div v-if="currentAddress && currentCurrency && currentChain" class="block__inner">
			<div class="qr">
				<div v-if="isShowQrCode" key="qr" class="qr__inner">
					<qrcode-vue :value="currentAddress" class="qr__code" level="M" render-as="svg" />
					<icon-logo-qr-code class="qr__logo" />
				</div>
				<div v-else key="loader" class="qr__loader">
					<lottie-animation :animation-data="loaderTransactionPending" :loop="true" />
				</div>
			</div>
			<div class="bottom">
				<div class="description">
					<span class="description__title">{{ $t("Awaiting transfer") }}</span>
					<div class="description__block">
						<div class="description__item">
							<currency-icon width="16px" height="16px" :type="currentCurrency as CurrencyType" />
							<span class="description__item-label">{{ currentCurrency }}</span>
						</div>
						<span class="description__text">
							{{ locale === "ru" ? "в сети" : "on" }}
						</span>
						<div class="description__item">
							<blockchain-icon
								width="16px"
								height="16px"
								:type="blockchainCurrencyId[currentChain.toLocaleLowerCase('en')] as BlockchainType"
							/>
							<span class="description__item-label">{{ currentChain }}</span>
						</div>
						<span v-if="locale !== 'ru'" class="description__text"> chain </span>
					</div>
				</div>
				<div class="actions">
					<ui-button
						class="actions__btn"
						type="secondary"
						size="sm"
						left-icon-name="qr-code-scanner"
						@click="isShowQrCode = !isShowQrCode"
					>
						{{ isShowQrCode ? `${$t("Hide")} QR` : `${$t("Show")} QR` }}
					</ui-button>
					<ui-button
						v-if="isTronSupported"
						class="actions__btn"
						type="secondary"
						left-icon-name="account-balance-wallet"
						size="sm"
						@click="$emit('open-tron-modal')"
					>
						{{ $t("Connect wallet") }}
					</ui-button>
					<ui-button
						v-else-if="isEvmSupported && !isEvmConnected"
						class="actions__btn"
						type="secondary"
						left-icon-name="account-balance-wallet"
						size="sm"
						:loading="isLoadingEvmBtn"
						@click="$emit('open-evm-modal')"
					>
						{{ $t("Connect wallet") }}
					</ui-button>
				</div>
			</div>
		</div>
		<div v-else class="block__empty">
			<span>{{ $t("An unexpected error occurred") }}</span>
			<span>{{ $t("Refresh the page or change network and try again") }}</span>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.block {
		@extend .center;
		padding: 48px 10px;
		border-radius: 12px;
		border: 1px solid #e1e8f1;
		@include mediamax(680) {
			border: unset;
			border-radius: unset;
			padding: 0;
		}
		&__empty {
			display: flex;
			align-items: center;
			flex-direction: column;
		}
		&__inner {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex-grow: 1;
			@include mediamax(680) {
				width: 100%;
				padding: 40px 16px 20px;
				background-color: #fff;
				border-radius: 16px;
				border: 1px solid #e1e8f1;
			}
			.qr {
				position: relative;
				max-width: 380px;
				width: 100%;
				height: 182px;
				flex-shrink: 0;
				@include mediamax(680) {
					max-width: 280px;
				}
				&__inner {
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%);
					@extend .center;
					width: 100%;
					height: 100%;
					background-image: url("/border-qr-code.png");
					background-size: contain;
					background-repeat: no-repeat;
					background-position: center;
				}
				&__loader {
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%, -50%);
					@extend .center;
					width: 100%;
				}
				&__code {
					width: 155px;
					height: 155px;
					flex-shrink: 0;
				}
				&__logo {
					@extend .center;
					width: 40px;
					height: 40px;
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					background-color: white;
				}
			}
			.bottom {
				display: flex;
				flex-direction: column;
				max-width: 350px;
				width: 100%;
				margin-top: 32px;
				.description {
					display: flex;
					align-items: center;
					justify-content: center;
					flex-wrap: wrap;
					gap: 12px;
					padding-bottom: 8px;
					margin-bottom: 20px;
					color: $main-title-color;
					font-weight: 500;
					border-bottom: 1px solid $main-border-color;
					&__title {
						font-size: 14px;
						line-height: 16px;
					}
					&__block {
						display: flex;
						align-items: center;
						gap: 4px;
					}
					&__text {
						color: $main-text-grey-color;
						font-size: 12px;
						line-height: 16px;
					}
					&__item {
						display: flex;
						align-items: center;
						gap: 4px;
						&-label {
							font-size: 14px;
							font-weight: 700;
							line-height: 20px;
						}
					}
				}
				.actions {
					display: flex;
					align-items: center;
					gap: 4px;
					max-width: 354px;
					width: 100%;
					@include mediamax(680) {
						align-items: unset;
						flex-direction: column;
						gap: 8px;
					}
					&__btn {
						width: 100%;
					}
				}
			}
		}
	}
</style>
