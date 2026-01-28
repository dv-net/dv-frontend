<script setup lang="ts">
	import { UiButton, UiCopyText, UiIcon, UiInput, UiLink, UiTooltip } from "@dv.net/ui-kit";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { isDesktopDevice } from "@shared/utils/helpers/media.ts";
	import QrcodeVue from "qrcode.vue";
	import { computed, onMounted, ref } from "vue";
	import CardSelectBlockchain from "@pay/views/payerForm/components/steps/cardSelectBlockchain/CardSelectBlockchain.vue";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import loaderTransactionPending from "@pay/assets/animations/loaderTransactionPending.json";
	import { LottieAnimation } from "lottie-web-vue";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";
	import WalletTronConnect from "@pay/views/payerForm/components/steps/stepThree/walletTronConnect/WalletTronConnect.vue";
	import { evmArray } from "@pay/utils/constants/connectWallet/evm.ts";
	import WalletEvmConnect from "@pay/views/payerForm/components/steps/stepThree/walletEvmConnect/WalletEvmConnect.vue";
	import RowTemplate from "@pay/views/payerForm/components/steps/stepThree/rowTemplate/RowTemplate.vue";
	import CurrencyIcon from "@pay/components/ui/currencyIcon/CurrencyIcon.vue";
	import { capitalizeFirstLetter, changeChainBsc } from "@shared/utils/helpers/general.ts";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";

	const { currentAddress, currentCurrency, currentChain, currentStep, timeline, filteredBlockchains, addresses } =
		storeToRefs(usePayerFormStore());
	const { getAmountRate } = usePayerFormStore();

	const isShowQrCode = ref<boolean>(true);

	const isMediaMax768 = useMediaQuery("(max-width: 768px)");
	const isMediaMax480 = useMediaQuery("(max-width: 480px)");

	const currentPrice = computed<string>(() => getAmountRate(currentCurrency.value as CurrencyType));
	const inputTextSum = computed<string>(() => `${currentPrice.value} ${currentCurrency.value}`);
	const isTronSupported = computed<boolean>(() => currentChain.value === "Tron");
	const isEvmSupported = computed<boolean>(() => Boolean(currentChain.value) && evmArray.includes(currentChain.value!));

	const infoCurrentChain = computed(() => {
		const chains = filteredBlockchains.value || [];
		const isSingleChain = chains.length === 1;
		const isMultipleChains = chains.length > 1;
		const shouldDisplayChainUI = isSingleChain ? !chains[0].currency.is_native : true;
		return { shouldDisplayChainUI, isSingleNativeChain: isMultipleChains };
	});
	const currencyLabel = computed<string>(() => {
		return addresses.value.find((item) => item.currency.code === currentCurrency.value)?.currency?.currency_label || "";
	});
	const tokenLabel = computed<string>(() => {
		return (
			addresses.value.find((item) => item.currency.id === `${currentCurrency.value}.${currentChain.value}`)?.currency
				?.token_label || ""
		);
	});

	onMounted(() => {
		timeline.value[1].isActive = infoCurrentChain.value.isSingleNativeChain;
	});
</script>

<template>
	<wrapper-block>
		<!--		<div class="payment">-->
		<!--			<div class="flex flex-column gap-12">-->
		<!--						<card-select-blockchain type="currency" :currency="currentCurrency as CurrencyType" />-->
		<!--				<card-select-blockchain-->
		<!--					v-if="infoCurrentChain.shouldDisplayChainUI"-->
		<!--					type="blockchain"-->
		<!--					:currency-id="`${currentCurrency}.${currentChain}` as BlockchainType"-->
		<!--					:is-show-btn-change="infoCurrentChain.isSingleNativeChain"-->
		<!--				/>-->
		<!--			</div>-->
		<!--			<div class="payment__inner">-->
		<!--				<div class="address">-->
		<!--					<div class="address__label">-->
		<!--						<h3 class="global-title-h2">{{ $t("Copy the permanent address") }}</h3>-->
		<!--						<ui-tooltip-->
		<!--							:show-event="isDesktopDevice() ? 'hover' : 'click'"-->
		<!--							:title="$t('Permanent address')"-->
		<!--							:text="$t('Your permanent wallet — funds are credited to it automatically upon receipt')"-->
		<!--						>-->
		<!--							<ui-icon class="flex-shrink-0" name="help" type="filled" color="#A4A5B1" />-->
		<!--						</ui-tooltip>-->
		<!--					</div>-->
		<!--					<ui-input-->
		<!--						type="text"-->
		<!--						v-model="currentAddress"-->
		<!--						:size="isMediaMax480 ? 'sm' : isMediaMax768 ? 'md' : 'xl'"-->
		<!--						class="address__input"-->
		<!--						readonly-interactive-->
		<!--					>-->
		<!--						<template #append>-->
		<!--							<ui-copy-text v-if="currentAddress" :copied-text="currentAddress" color-icon="#A4A5B1" />-->
		<!--						</template>-->
		<!--					</ui-input>-->
		<!--				</div>-->
		<!--				<div class="sum">-->
		<!--					<span class="sum__label">{{ $t("Sum") }}</span>-->
		<!--					<div class="sum__inner">-->
		<!--						<ui-input-->
		<!--							type="text"-->
		<!--							:size="isMediaMax768 ? 'md' : 'xl'"-->
		<!--							v-model="inputTextSum"-->
		<!--							readonly-interactive-->
		<!--							class="sum__input"-->
		<!--						>-->
		<!--							<template #prepend>-->
		<!--								<blockchain-icon :type="`${currentCurrency}.${currentChain}` as BlockchainType" />-->
		<!--							</template>-->
		<!--							<template #append>-->
		<!--								<ui-copy-text v-if="currentPrice" :copied-text="currentPrice" color-icon="#A4A5B1" />-->
		<!--							</template>-->
		<!--						</ui-input>-->
		<!--					</div>-->
		<!--				</div>-->
		<!--				<wallet-tron-connect-->
		<!--					v-if="isTronSupported"-->
		<!--					:recipient-address="currentAddress"-->
		<!--					:amount="currentPrice"-->
		<!--					:token="currentCurrency"-->
		<!--				/>-->
		<!--				<wallet-evm-connect-->
		<!--					v-if="isEvmSupported"-->
		<!--					:recipient-address="currentAddress"-->
		<!--					:amount="currentPrice"-->
		<!--					:token="currentCurrency"-->
		<!--					:chain="currentChain"-->
		<!--				/>-->
		<!--			</div>-->
		<!--			<div v-if="currentStep === 3" class="status">-->
		<!--				<div class="status__top">-->
		<!--					<h3 class="global-title-h2">{{ $t("Payment status") }}</h3>-->
		<!--					<div class="status__top-qr" :class="{ selected: isShowQrCode }" @click="isShowQrCode = !isShowQrCode">-->
		<!--						<span>{{ $t(isShowQrCode ? "Hide QR payment" : "Show QR code for payment") }}</span>-->
		<!--						<ui-icon name="qr-code-scanner" type="400" />-->
		<!--					</div>-->
		<!--				</div>-->
		<!--				<div class="status__bottom">-->
		<!--					<div class="pending">-->
		<!--						<lottie-animation class="pending__loader" :animation-data="loaderTransactionPending" :loop="true" />-->
		<!--						<span class="pending__text">{{ $t("We are waiting for the payment to arrive") }}</span>-->
		<!--					</div>-->
		<!--					<div v-if="currentAddress && isShowQrCode" class="qr">-->
		<!--						<blockchain-icon-->
		<!--							class="qr__icon"-->
		<!--							width="24px"-->
		<!--							height="24px"-->
		<!--							:type="`${currentCurrency}.${currentChain}` as BlockchainType"-->
		<!--						/>-->
		<!--						<qrcode-vue :value="currentAddress" class="qr__code" level="M" render-as="svg" />-->
		<!--					</div>-->
		<!--				</div>-->
		<!--			</div>-->
		<!--		</div>-->

		<div class="payment">
			<div class="payment__top">
				<div v-if="currentAddress" class="qr">
					<transition name="qr-fade">
						<div v-if="isShowQrCode" class="qr__inner">
							<qrcode-vue :value="currentAddress" class="qr__code" level="M" render-as="svg" />
							<span v-if="false" class="qr__logo">DV</span>
						</div>
					</transition>
					<div class="actions">
						<ui-button
							class="actions__btn"
							type="secondary"
							size="sm"
							left-icon-name="qr-code-scanner"
							@click="isShowQrCode = !isShowQrCode"
						>
							{{ isShowQrCode ? "Скрыть QR" : "Показать QR" }}
						</ui-button>
						<wallet-tron-connect
							v-if="isTronSupported"
							:recipient-address="currentAddress"
							:amount="currentPrice"
							:token="currentCurrency"
						/>
						<wallet-evm-connect
							v-if="isEvmSupported"
							:recipient-address="currentAddress"
							:amount="currentPrice"
							:token="currentCurrency"
							:chain="currentChain"
						/>
					</div>
				</div>
			</div>
			<div class="info">
				<div class="info__inner">
					<div class="info__card">
						<div class="info__inputs">
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
									<ui-link size="md" @click="currentStep = 1">{{ $t("Change") }}</ui-link>
								</div>
							</row-template>
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
									<ui-link v-if="infoCurrentChain.isSingleNativeChain" size="md" @click="currentStep = 2">
										{{ $t("Change") }}
									</ui-link>
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
								<ui-input type="text" v-model="currentAddress" readonly-interactive filled>
									<template #append>
										<ui-copy-text v-if="currentAddress" :copied-text="currentAddress" color-icon="#242424" />
									</template>
								</ui-input>
							</row-template>
							<row-template :label="$t('Sum')">
								<ui-input type="text" v-model="inputTextSum" readonly-interactive filled>
									<template #prepend>
										<blockchain-icon :type="`${currentCurrency}.${currentChain}` as BlockchainType" width="24px" height="24px" />
									</template>
									<template #append>
										<ui-copy-text v-if="currentPrice" :copied-text="currentPrice" color-icon="#242424" />
									</template>
								</ui-input>
							</row-template>
						</div>
					</div>
				</div>
				<div class="info__card">3</div>
			</div>
		</div>
	</wrapper-block>
</template>

<style scoped lang="scss">
	.payment {
		display: flex;
		flex-direction: column;
		gap: 20px;
		&__top {
			@extend .center;
			padding: 48px 10px;
			border-radius: 12px;
			border: 1px solid #e1e8f1;
			@include mediamax(480) {
				border: unset;
				padding: 0;
			}
			.qr {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 32px;
				@include mediamax(480) {
					width: 100%;
					padding-top: 24px;
				}
				&__inner {
					position: relative;
					@extend .center;
					width: 182px;
					height: 182px;
					flex-shrink: 0;
					background-image: url("/static/border-qr-code.png");
					background-size: contain;
					background-repeat: no-repeat;
					background-position: center;
				}
				&__code {
					width: 155px;
					height: 155px;
					flex-shrink: 0;
				}
				&__logo {
					display: none;
					@extend .center;
					width: 30px;
					height: 30px;
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					background-color: white;
				}
				.actions {
					display: flex;
					align-items: center;
					gap: 4px;
					@include mediamax(480) {
						align-items: unset;
						flex-direction: column;
						gap: 8px;
						width: 100%;
					}
					&__btn {
						min-width: 175px;
						@include mediamax(480) {
							width: 100%;
						}
					}
				}
				&-fade-enter-active,
				&-fade-leave-active {
					transition:
						opacity 0.25s ease,
						transform 0.25s ease;
				}
				&-fade-enter-from,
				&-fade-leave-to {
					opacity: 0;
					transform: scale(0.96);
				}
			}
		}
		.info {
			display: grid;
			grid-template-columns: 1fr 319px;
			border-radius: 14px;
			border: 1px solid #e1e8f1;
			background-color: #f7f9fb;
			padding: 4px;
			gap: 4px;
			min-height: 250px;
			&__inner {
				display: grid;
				grid-template-columns: 319px 1fr;
				gap: 4px;
			}
			&__card {
				display: flex;
				padding: 24px 22px;
				flex-direction: column;
				flex-shrink: 0;
				border-radius: 12px;
				border: 1px solid #e1e8f1;
				background-color: #fff;
			}
			&__inputs {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				gap: 10px;
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
						color: #6b6d80;
						font-size: 12px;
						font-weight: 500;
						line-height: 16px;
					}
				}
			}
		}
	}

	//.payment {
	//	display: flex;
	//	flex-direction: column;
	//	gap: 24px;
	//	&__inner {
	//		display: flex;
	//		flex-direction: column;
	//		gap: 20px;
	//		.address {
	//			display: flex;
	//			flex-direction: column;
	//			gap: 12px;
	//			@include mediamax(480) {
	//				gap: 8px;
	//			}
	//			&__label {
	//				display: flex;
	//				align-items: center;
	//				gap: 4px;
	//				font-size: 20px;
	//				font-weight: 600;
	//				@include mediamax(480) {
	//					font-size: 14px;
	//				}
	//			}
	//			&__input {
	//				padding: 0 16px;
	//				@include mediamax(480) {
	//					padding: 0 12px;
	//				}
	//				&:deep(.ui-input__inner) {
	//					word-break: break-word;
	//					.ui-input__input {
	//						color: $main-text-grey-color;
	//						font-size: 16px;
	//						font-weight: 500;
	//						word-break: break-word;
	//						@include mediamax(768) {
	//							font-size: 14px;
	//						}
	//						@include mediamax(480) {
	//							font-size: 12px;
	//						}
	//					}
	//				}
	//			}
	//		}
	//		.sum {
	//			display: flex;
	//			flex-direction: column;
	//			gap: 12px;
	//			@include mediamax(480) {
	//				gap: 8px;
	//			}
	//			&__label {
	//				color: $main-subtitle-color;
	//				@include mediamax(768) {
	//					font-size: 14px;
	//				}
	//				@include mediamax(480) {
	//					font-size: 12px;
	//				}
	//			}
	//			&__inner {
	//				display: flex;
	//				flex-direction: column;
	//				gap: 6px;
	//			}
	//			&__input {
	//				padding: 0 16px;
	//				@include mediamax(480) {
	//					padding: 0 12px;
	//				}
	//				&:deep(.ui-input__input) {
	//					color: $main-text-grey-color;
	//					font-size: 16px;
	//					font-weight: 500;
	//					@include mediamax(768) {
	//						font-size: 14px;
	//					}
	//				}
	//			}
	//			&__description {
	//				color: $main-subtitle-color;
	//				font-size: 12px;
	//				font-weight: 400;
	//				@include mediamax(480) {
	//					font-size: 10px;
	//				}
	//			}
	//		}
	//	}
	//	.status {
	//		display: flex;
	//		flex-direction: column;
	//		gap: 16px;
	//		@include mediamax(480) {
	//			gap: 8px;
	//		}
	//		&__top {
	//			display: flex;
	//			align-items: center;
	//			gap: 12px;
	//			justify-content: space-between;
	//			&-qr {
	//				display: flex;
	//				align-items: center;
	//				gap: 6px;
	//				color: $main-text-grey-color;
	//				font-size: 14px;
	//				font-weight: 500;
	//				transition: transform 0.1s ease-in-out;
	//				@media (hover: hover) {
	//					&:hover {
	//						transform: scale(1.02);
	//						cursor: pointer;
	//					}
	//				}
	//				@include mediamax(768) {
	//					font-size: 12px;
	//				}
	//				@include mediamax(480) {
	//					font-size: 10px;
	//				}
	//				&.selected {
	//					color: #1968e5;
	//				}
	//				& > span {
	//					text-align: right;
	//				}
	//			}
	//		}
	//		&__bottom {
	//			display: flex;
	//			align-items: center;
	//			gap: 8px;
	//			min-height: 116px;
	//			@include mediamax(480) {
	//				min-height: 96px;
	//			}
	//			.pending {
	//				display: flex;
	//				flex-direction: column;
	//				align-items: center;
	//				align-self: stretch;
	//				gap: 8px;
	//				padding: 20px 24px;
	//				border-radius: 12px;
	//				border: 1px solid $main-border-color;
	//				background: $form-background;
	//				flex-grow: 1;
	//				&__loader {
	//					width: 200px;
	//					@include mediamax(480) {
	//						max-width: 200px;
	//						width: 100%;
	//					}
	//				}
	//				&__text {
	//					color: $main-text-grey-color;
	//					font-size: 16px;
	//					font-weight: 500;
	//					text-align: center;
	//					@include mediamax(768) {
	//						font-size: 14px;
	//					}
	//					@include mediamax(480) {
	//						font-size: 12px;
	//					}
	//				}
	//			}
	//			.qr {
	//				@extend .center;
	//				padding: 20px;
	//				border-radius: 12px;
	//				border: 1px solid $main-border-color;
	//				background: $form-background;
	//				align-self: stretch;
	//				position: relative;
	//				&__icon {
	//					position: absolute;
	//					top: 50%;
	//					left: 50%;
	//					transform: translate(-50%, -50%);
	//				}
	//				@include mediamax(768) {
	//					padding: 20px 16px;
	//				}
	//				@include mediamax(480) {
	//					padding: 11px;
	//				}
	//				&__code {
	//					width: 75px;
	//					height: 75px;
	//				}
	//			}
	//		}
	//	}
	//}
</style>
