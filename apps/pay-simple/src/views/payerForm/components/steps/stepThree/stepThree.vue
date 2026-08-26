<script setup lang="ts">
	import { usePayerFormStore } from "@pay-simple/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { computed, onMounted, ref } from "vue";
	import type { CurrencyType } from "@shared/utils/types/blockchain";
	import WrapperBlock from "@pay-shared/components/payerForm/wrapperBlock/WrapperBlock.vue";
	import WalletTronConnect from "@pay-shared/components/payerForm/walletTronConnect/WalletTronConnect.vue";
	import { evmArray } from "@pay-shared/utils/constants/connectWallet/evm.ts";
	import WalletEvmConnect from "@pay-shared/components/payerForm/walletEvmConnect/WalletEvmConnect.vue";
	import PaymentTopBlock from "@pay-shared/components/payerForm/paymentTopBlock/PaymentTopBlock.vue";
	import PaymentInfoBlock from "@pay-shared/components/payerForm/paymentInfoBlock/PaymentInfoBlock.vue";
	import BannerInfo from "@pay-shared/components/payerForm/bannerInfo/BannerInfo.vue";
	import AmountEditor from "@pay-shared/components/payerForm/amountEditor/AmountEditor.vue";

	const payerFormStore = usePayerFormStore();

	const {
		currentAddress,
		currentCurrency,
		currentChain,
		currentCurrencyChainId,
		currentStep,
		timeline,
		filteredBlockchains,
		addresses,
		payerId,
		store,
		amount,
		invoiceCurrency
	} = storeToRefs(payerFormStore);
	const { getAmountRate } = payerFormStore;

	const isShowModalTronWallets = ref<boolean>(false);
	const isShowModalEvmWallets = ref<boolean>(false);
	const walletEvmConnectRef = ref<InstanceType<typeof WalletEvmConnect> | null>(null);
	const isEvmConnected = computed(() => walletEvmConnectRef.value?.isConnected || false);
	const isLoadingEvmBtn = computed(() => walletEvmConnectRef.value?.isLoadingBtn || false);

	const currentPrice = computed<string>(() =>
		getAmountRate((currentCurrencyChainId.value || currentCurrency.value) as CurrencyType)
	);
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
		if (!currentCurrencyChainId.value) return "";
		return (
			addresses.value.find((item) => item.currency.id === currentCurrencyChainId.value)?.currency?.token_label || ""
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
				<payment-top-block
					:current-address="currentAddress"
					:current-currency="currentCurrency"
					:current-chain="currentChain"
					:current-currency-chain-id="currentCurrencyChainId"
					:is-evm-connected="isEvmConnected"
					:is-tron-supported="isTronSupported"
					:is-evm-supported="isEvmSupported"
					:is-loading-evm-btn="isLoadingEvmBtn"
					@open-tron-modal="isShowModalTronWallets = true"
					@open-evm-modal="walletEvmConnectRef?.openConnectModal()"
				/>
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
					:addresses="addresses"
				/>
				<payment-info-block
					:current-address="currentAddress"
					:current-currency="currentCurrency"
					:current-chain="currentChain"
					:current-price="currentPrice"
					:token-label="tokenLabel"
					:currency-label="currencyLabel"
					:show-change-chain="infoCurrentChain.isSingleNativeChain"
					:payer-id="payerId"
					:store="store"
					@change-step="currentStep = $event"
				>
					<template #amount>
						<amount-editor
							v-model:amount="amount"
							size="md"
							:fiat-currency="invoiceCurrency"
							:minimal-payment="store?.minimal_payment"
						/>
					</template>
				</payment-info-block>
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
		}
	}
</style>
