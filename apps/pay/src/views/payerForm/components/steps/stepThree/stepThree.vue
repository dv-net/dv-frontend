<script setup lang="ts">
	import { UiButton, UiCopyText, UiIcon, UiInput, UiLink } from "@dv.net/ui-kit";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import QrcodeVue from "qrcode.vue";
	import { computed, onMounted, ref } from "vue";
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import WalletTronConnect from "@pay/views/payerForm/components/steps/stepThree/walletTronConnect/WalletTronConnect.vue";
	import { evmArray } from "@pay/utils/constants/connectWallet/evm.ts";
	import WalletEvmConnect from "@pay/views/payerForm/components/steps/stepThree/walletEvmConnect/WalletEvmConnect.vue";
	import RowTemplate from "@pay/views/payerForm/components/steps/stepThree/rowTemplate/RowTemplate.vue";
	import CurrencyIcon from "@pay/components/ui/currencyIcon/CurrencyIcon.vue";
	import { changeChainBsc, formatDollars } from "@shared/utils/helpers/general.ts";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import BannerInfo from "@pay/views/payerForm/components/steps/bannerInfo/BannerInfo.vue";
	import IconLogoQrCode from "@pay/components/icons/IconLogoQrCode.vue";
	import loaderTransactionPending from "@pay/assets/animations/loaderTransactionPending.json";
	import { LottieAnimation } from "lottie-web-vue";

	const {
		currentAddress,
		currentCurrency,
		currentChain,
		currentStep,
		timeline,
		filteredBlockchains,
		addresses,
		payerId,
		store,
		amount
	} = storeToRefs(usePayerFormStore());
	const { getAmountRate } = usePayerFormStore();

	const isShowQrCode = ref<boolean>(false);
	const isShowModalTronWallets = ref<boolean>(false);
	const isShowModalEvmWallets = ref<boolean>(false);
	const walletEvmConnectRef = ref<InstanceType<typeof WalletEvmConnect> | null>(null);
	const isEvmConnected = computed(() => walletEvmConnectRef.value?.isConnected || false);
	const isLoadingEvmBtn = computed(() => walletEvmConnectRef.value?.isLoadingBtn || false);

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
	<div class="screen">
		<wrapper-block class="screen__first-block">
			<div class="payment">
				<div v-if="currentAddress" class="payment__top">
					<div class="qr">
						<div class="qr__container">
							<div v-if="isShowQrCode" key="qr" class="qr__inner">
								<qrcode-vue :value="currentAddress" class="qr__code" level="M" render-as="svg" />
								<icon-logo-qr-code class="qr__logo" />
							</div>
							<div v-else key="loader" class="qr__loader">
								<lottie-animation :animation-data="loaderTransactionPending" :loop="true" />
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
								@click="isShowModalTronWallets = true"
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
								@click="walletEvmConnectRef?.openConnectModal()"
							>
								{{ $t("Connect wallet") }}
							</ui-button>
						</div>
					</div>
				</div>
				<wallet-tron-connect
					v-if="isTronSupported"
					v-model:is-show-modal-tron-wallets="isShowModalTronWallets"
					:recipient-address="currentAddress"
					:amount="currentPrice"
					:token="currentCurrency"
				/>
				<wallet-evm-connect
					ref="walletEvmConnectRef"
					v-else-if="isEvmSupported"
					v-model:is-show-modal-evm-wallets="isShowModalEvmWallets"
					:recipient-address="currentAddress"
					:amount="currentPrice"
					:token="currentCurrency"
					:chain="currentChain"
				/>
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
										<ui-link v-if="infoCurrentChain.isSingleNativeChain" size="md" @click="currentStep = 2">
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
										<ui-link size="md" @click="currentStep = 1">{{ $t("Change") }}</ui-link>
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
								<span class="details__bottom-price">{{ formatDollars(amount, undefined, undefined, 2) }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</wrapper-block>
		<banner-info />
	</div>
</template>

<style scoped lang="scss">
	.screen {
		display: flex;
		flex-direction: column;
		gap: 20px;
		@include mediamax(680) {
			gap: 16px;
		}
		&:deep(.block:first-child) {
			@include mediamax(680) {
				padding: 0;
				border: unset;
				border-radius: unset;
				background-color: transparent;
			}
		}
		.payment {
			display: flex;
			flex-direction: column;
			gap: 20px;
			&__top {
				@extend .center;
				padding: 48px 10px;
				border-radius: 12px;
				border: 1px solid #e1e8f1;
				@include mediamax(680) {
					border: unset;
					border-radius: unset;
					padding: 0;
				}
				.qr {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 32px;
					flex-grow: 1;
					@include mediamax(680) {
						width: 100%;
						padding: 40px 16px 20px;
						background-color: #fff;
						border-radius: 16px;
						border: 1px solid #e1e8f1;
					}
					&__container {
						position: relative;
						max-width: 380px;
						width: 100%;
						height: 182px;
						flex-shrink: 0;
						@include mediamax(680) {
							max-width: 280px;
						}
					}
					&__inner {
						position: absolute;
						left: 50%;
						top: 50%;
						transform: translate(-50%, -50%);
						@extend .center;
						width: 100%;
						height: 100%;
						background-image: url("/static/border-qr-code.png");
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
					background-color: #fff;
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
							color: #6b6d80;
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
							border-right: 1px solid #ecf0f5;
							flex-grow: 1;
						}
						@include mediamax(768) {
							max-width: 280px;
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
						border-bottom: 1px solid #ecf0f5;
						@include mediamax(1180) {
							padding: 0 16px;
							border-right: 1px solid #ecf0f5;
							border-bottom: unset;
							gap: 14px;
							flex-grow: 1;
						}
						@include mediamax(680) {
							padding: 0 0 16px 0;
							border-right: unset;
							border-bottom: 1px solid #ecf0f5;
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
						&-price {
							color: #1968e5;
							font-size: 24px;
							font-weight: 600;
							line-height: 32px;
						}
					}
				}
			}
		}
	}
</style>
