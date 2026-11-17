<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit";
	import QrcodeVue from "qrcode.vue";
	import { ref, shallowRef, watch } from "vue";
	import type { CurrencyType } from "@shared/utils/types/blockchain";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import CurrencyIcon from "@pay-shared/components/ui/currencyIcon/CurrencyIcon.vue";
	import IconLogoQrCode from "@pay-shared/components/icons/IconLogoQrCode.vue";
	import { LottieAnimation } from "lottie-web-vue";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import { useI18n } from "vue-i18n";
	import { changeChainBsc } from "@shared/utils/helpers/general.ts";
	import borderQrCodeImage from "@pay-shared/assets/images/border-qr-code.png";

	type LottieAnimationData = Record<string, unknown>;

	const loaderTransactionPendingLoaders: Record<string, () => Promise<{ default: LottieAnimationData }>> = {
		general: () => import("@pay-shared/assets/animations/loaderTransactionPending/general.json"),
		"BTC.Bitcoin": () => import("@pay-shared/assets/animations/loaderTransactionPending/BTC.Bitcoin.json"),
		"ETH.Ethereum": () => import("@pay-shared/assets/animations/loaderTransactionPending/ETH.Ethereum.json"),
		"USDT.BNBSmartChain": () =>
			import("@pay-shared/assets/animations/loaderTransactionPending/USDT.BNBSmartChain.json"),
		"USDT.Ethereum": () => import("@pay-shared/assets/animations/loaderTransactionPending/USDT.Ethereum.json"),
		"USDT.Tron": () => import("@pay-shared/assets/animations/loaderTransactionPending/USDT.Tron.json")
	};

	const {
		currentAddress = null,
		currentCurrency = null,
		currentChain = null,
		currentCurrencyChainId = null,
		isEvmConnected,
		isTronSupported,
		isEvmSupported,
		isLoadingEvmBtn
	} = defineProps<{
		currentAddress?: string | null;
		currentCurrency?: string | null;
		currentChain?: string | null;
		currentCurrencyChainId?: string | null;
		isEvmConnected: boolean;
		isTronSupported: boolean;
		isEvmSupported: boolean;
		isLoadingEvmBtn: boolean;
	}>();

	defineEmits<{
		(event: "open-tron-modal"): void;
		(event: "open-evm-modal"): void;
	}>();

	const QR_SWAP_DURATION = { enter: 900, leave: 300 };

	const { locale } = useI18n();

	const isShowQrCode = ref<boolean>(false);
	const loaderTransactionPending = shallowRef<LottieAnimationData | null>(null);
	let loaderTransactionPendingRequestId = 0;

	const loadLoaderTransactionPending = async (currencyChainId: string | null) => {
		const requestId = ++loaderTransactionPendingRequestId;
		const animationName =
			currencyChainId && loaderTransactionPendingLoaders[currencyChainId] ? currencyChainId : "general";

		try {
			const animationModule = await loaderTransactionPendingLoaders[animationName]();
			if (requestId !== loaderTransactionPendingRequestId) return;
			loaderTransactionPending.value = animationModule.default;
		} catch (error) {
			console.error(error);
			if (requestId !== loaderTransactionPendingRequestId) return;
			loaderTransactionPending.value = null;
		}
	};

	watch(
		() => currentCurrencyChainId,
		(currencyChainId) => {
			void loadLoaderTransactionPending(currencyChainId ?? null);
		},
		{ immediate: true }
	);
</script>

<template>
	<div class="block">
		<div v-if="currentAddress && currentCurrency && currentChain" class="block__inner">
			<div class="qr">
				<transition name="qr-swap" :duration="QR_SWAP_DURATION">
					<div
						v-if="isShowQrCode"
						key="qr"
						class="qr__inner"
						:style="{ backgroundImage: `url(${borderQrCodeImage})` }"
					>
						<qrcode-vue :value="currentAddress" class="qr__code" level="M" render-as="svg" />
						<icon-logo-qr-code class="qr__logo" />
					</div>
					<div v-else key="loader" class="qr__loader">
						<lottie-animation
							v-if="loaderTransactionPending"
							:animation-data="loaderTransactionPending"
							:loop="true"
						/>
					</div>
				</transition>
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
							<span class="description__item-label">{{ changeChainBsc(currentChain) }}</span>
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
				background-color: $form-background;
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
					inset: 0;
					@extend .center;
					background-size: contain;
					background-repeat: no-repeat;
					background-position: center;
				}
				&__loader {
					position: absolute;
					inset: 0;
					@extend .center;
				}
				&__code {
					width: 155px;
					height: 155px;
					flex-shrink: 0;
					clip-path: inset(0);
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
					@extend .center;
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

	$ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
	$ease-scan: cubic-bezier(0.65, 0, 0.35, 1);
	$ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1);

	.qr__inner.qr-swap-enter-active {
		transition:
			opacity 0.45s ease-out,
			transform 0.7s $ease-out-expo,
			filter 0.5s ease-out;
		.qr__code {
			transition: clip-path 0.65s $ease-scan 0.12s;
		}
		.qr__logo {
			transition:
				opacity 0.3s ease-out 0.5s,
				transform 0.4s $ease-pop 0.5s;
		}
	}
	.qr__inner.qr-swap-enter-from {
		opacity: 0;
		transform: scale(0.9);
		filter: blur(8px);
		.qr__code {
			clip-path: inset(0 0 100% 0);
		}
		.qr__logo {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.4);
		}
	}
	.qr__inner.qr-swap-leave-active {
		transition:
			opacity 0.25s ease-in,
			transform 0.3s ease-in,
			filter 0.25s ease-in;
	}
	.qr__inner.qr-swap-leave-to {
		opacity: 0;
		transform: scale(0.94);
		filter: blur(4px);
	}

	.qr__loader.qr-swap-enter-active {
		transition:
			opacity 0.4s ease-out 0.15s,
			transform 0.55s $ease-out-expo 0.15s;
	}
	.qr__loader.qr-swap-leave-active {
		transition:
			opacity 0.2s ease-in,
			transform 0.25s ease-in;
	}
	.qr__loader.qr-swap-enter-from,
	.qr__loader.qr-swap-leave-to {
		opacity: 0;
		transform: scale(0.9);
	}

	@media (prefers-reduced-motion: reduce) {
		.qr__inner.qr-swap-enter-from,
		.qr__inner.qr-swap-leave-to,
		.qr__loader.qr-swap-enter-from,
		.qr__loader.qr-swap-leave-to {
			transform: none;
			filter: none;
		}
		.qr__inner.qr-swap-enter-from {
			.qr__code {
				clip-path: inset(0);
			}
			.qr__logo {
				transform: translate(-50%, -50%);
			}
		}
	}
</style>
