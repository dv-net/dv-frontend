<script setup lang="ts">
	import { createAppKit } from "@reown/appkit/vue";
	import { computed, watch } from "vue";
	import {
		useAccount,
		useDisconnect,
		useSendTransaction,
		useWriteContract,
		useSwitchChain,
		useChainId
	} from "@wagmi/vue";
	import {
		chainIdMap,
		metadataWalletConnect,
		networksWalletConnect,
		wagmiAdapter
	} from "@pay/utils/constants/connectWallet/evm.ts";
	import { UiButton, UiCopyText } from "@dv.net/ui-kit";
	import IconWalletConnect from "@pay/components/icons/IconWalletConnect.vue";
	import type { IProps } from "@pay/views/payerForm/components/steps/stepThree/walletEvmConnect/IProps.ts";
	import { parseEther, parseUnits, type Address, erc20Abi, type Chain } from "viem";
	import { storeToRefs } from "pinia";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import { useI18n } from "vue-i18n";

	const { addresses } = storeToRefs(usePayerFormStore());
	const { address, isConnected, isConnecting, connector } = useAccount();
	const { notify } = useNotifications()
	const { t } = useI18n()
	const { disconnect } = useDisconnect();
	const { sendTransaction, isPending: isPendingSendTransaction, error: errorSendTransaction, data: transactionHash } = useSendTransaction();
	const { switchChain } = useSwitchChain();
	const chainId = useChainId();
	const { writeContract, isPending: isPendingContract } = useWriteContract();

	const { chain, recipientAddress, token, amount } = defineProps<IProps>();

	const modalConnectWallet = createAppKit({
		adapters: [wagmiAdapter],
		themeMode: "light",
		networks: networksWalletConnect,
		projectId: import.meta.env.VITE_PROJECT_ID_CONNECT_WALLET,
		metadata: metadataWalletConnect,
		features: {
			analytics: false,
			socials: false,
			email: false
		}
	});

	const walletName = computed<string>(() => {
		if (!isConnected.value || !connector.value) return "";
		return connector.value.name || "WalletConnect";
	});

	const isLoadingBtn = computed<boolean>(() => isPendingSendTransaction.value || isConnecting.value);

	const tokenInfo = computed(() => {
		if (!token || !chain) return null;
		const currencyId = `${token}.${chain}`;
		return addresses.value.find((item) => item.currency.id === currencyId)?.currency;
	});

	const handlePayment = () => {
		try {
			if (!recipientAddress || !amount || !token || !chain || !tokenInfo.value) return;
			switchChain({ chainId: chainIdMap[chain] });

			if (tokenInfo.value.is_native) {
				sendTransaction({ to: recipientAddress, value: parseEther(amount) });
			} else {
				console.log("CONTRACT");
			}

			// await switchChain({ chainId: targetChain.id });
			//
			// if (info.is_native) {
			// 	const decimals = info.precision || 18;
			// 	const value = decimals === 18
			// 		? parseEther(amount)
			// 		: parseUnits(amount, decimals);
			//
			// 	const res = await sendTransaction({
			// 		chainId: targetChain.id,
			// 		to: recipientAddress as Address,
			// 		value
			// 	});
			// 	console.log(res);
			// } else {
			// 	// Если токен ERC-20, используем writeContract
			// 	if (!info.contract_address) {
			// 		console.error('Contract address not found for token');
			// 		return;
			// 	}
			//
			// 	const decimals = info.precision || 18;
			// 	const tokenAmount = parseUnits(amount, decimals);
			//
			// 	const res = await writeContract({
			// 		chainId: targetChain.id,
			// 		address: info.contract_address as Address,
			// 		abi: erc20Abi,
			// 		functionName: 'transfer',
			// 		args: [recipientAddress as Address, tokenAmount]
			// 	});
			// 	console.log(res);
			// }
		} catch (error: any) {
			console.error(error);
		}
	};

	watch(errorSendTransaction, (error) => {
		if (error) notify(error.message);
	});

	watch(transactionHash, (hash) => {
		if (hash) notify(`${t('Transaction sent')}: ${hash}`, "success");
	})
</script>

<template>
	<div class="flex flex-column gap-12">
		<ui-button
			@click="isConnected ? handlePayment() : modalConnectWallet.open()"
			:loading="isLoadingBtn"
			type="secondary"
			class="w-full flex flex-center gap-4"
		>
			<icon-wallet-connect style="width: 24px" />
			<span>{{ isConnected ? $t("Pay") : "WalletConnect" }}</span>
		</ui-button>
		<div v-if="isConnected && address" class="info">
			<div class="info__header">
				<span class="info__name">{{ walletName }}</span>
				<span class="info__status">
					<span class="info__dot" />
					{{ $t("Connected") }}
				</span>
			</div>
			<div class="info__address">
				<span class="info__address-text">{{ address }}</span>
				<ui-copy-text :copied-text="address" color-icon="#A4A5B1" />
			</div>
			<ui-button @click="disconnect" type="secondary" size="sm" class="mt-4">
				{{ $t("Disconnect") }}
			</ui-button>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.info {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		border: 1px solid $main-border-color;
		border-radius: 8px;
		background: rgba(#6b6d80, 0.02);
		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
		}
		&__name {
			font-weight: 500;
			font-size: 14px;
			color: $main-color;
		}
		&__status {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			padding: 4px 8px;
			border-radius: 24px;
			font-size: 12px;
			background: rgba(#16a34a, 0.12);
			color: #16a34a;
		}
		&__dot {
			display: inline-block;
			width: 8px;
			height: 8px;
			border-radius: 100%;
			background: #16a34a;
		}
		&__address {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 8px;
			border-radius: 6px;
			background: rgba(#6b6d80, 0.05);
		}
		&__address-text {
			font-family: monospace;
			font-size: 13px;
			color: $main-text-grey-color;
			flex: 1;
		}
	}
</style>