<script setup lang="ts">
	import { createAppKit } from "@reown/appkit/vue";
	import { computed, watch } from "vue";
	import {
		useAccount,
		useDisconnect,
		useSendTransaction,
		useWriteContract,
		useSwitchChain,
		useReadContract,
	} from "@wagmi/vue";
	import {
		chainIdMap,
		metadataWalletConnect,
		networksWalletConnect,
		wagmiAdapter
	} from "@pay/utils/constants/connectWallet/evm.ts";
	import { UiButton, UiCopyText, UiIcon } from "@dv.net/ui-kit";
	import IconWalletConnect from "@pay/components/icons/IconWalletConnect.vue";
	import iconMetaMask from "@pay/assets/images/wallets/metaMask.png";
	import iconTrustWallet from "@pay/assets/images/wallets/trustWallet.png";
	import iconOkxWallet from "@pay/assets/images/wallets/okx.png";
	import iconRabbyWallet from "@pay/assets/images/wallets/rabbyWallet.png";
	import type { IProps } from "@pay/views/payerForm/components/steps/stepThree/walletEvmConnect/IProps.ts";
	import { parseEther, parseUnits, type Address, erc20Abi } from "viem";
	import { storeToRefs } from "pinia";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import { useI18n } from "vue-i18n";

	const { addresses } = storeToRefs(usePayerFormStore());
	const { address, isConnected, connector } = useAccount();
	const { notify } = useNotifications()
	const { t } = useI18n()
	const { disconnect } = useDisconnect();
	const { sendTransaction, isPending: isPendingSendTransaction, error: errorSendTransaction, data: transactionHash } = useSendTransaction();
	const { switchChain } = useSwitchChain();
	const { writeContract, isPending: isPendingContract, error: errorWriteContract, data: contractHash } = useWriteContract();

	const { chain, recipientAddress, token, amount } = defineProps<IProps>();

	const modalConnectWallet = createAppKit({
		adapters: [wagmiAdapter],
		themeMode: "light",
		networks: networksWalletConnect,
		projectId: import.meta.env.VITE_PROJECT_ID_CONNECT_WALLET,
		metadata: metadataWalletConnect,
		features: {
			analytics: false, socials: false, email: false,
		}
	});

const walletName = computed<string>(() => {
	if (!isConnected.value || !connector.value) return "";
	return connector.value.name || "WalletConnect";
});

const walletIcon = computed(() => {
	const iconByName: Record<string, string> = {
		metamask: iconMetaMask,
		trustwallet: iconTrustWallet,
		okx: iconOkxWallet,
		rabbywallet: iconRabbyWallet,
	};
	const normalized = walletName.value.toLowerCase().replace(/\s+/g, '');
	if (normalized === "walletconnect") return { type: "walletconnect", src: "" };
	if (iconByName[normalized]) return { type: "image", src: iconByName[normalized] };
	return { type: "default", src: "" };
});

	const isLoadingBtn = computed<boolean>(() => isPendingSendTransaction.value || isPendingContract.value);

	const tokenInfo = computed(() => {
		if (!token || !chain) return null;
		const currencyId = `${token}.${chain}`;
		return addresses.value.find((item) => item.currency.id === currencyId)?.currency;
	});

	const { data: tokenDecimals } = useReadContract({
		chainId: computed(() => chain && (chain in chainIdMap) ? chainIdMap[chain] : undefined),
		address: computed(() => tokenInfo.value?.contract_address as Address | undefined),
		abi: erc20Abi,
		functionName: 'decimals'
	});

	const handlePayment = async () => {
		try {
			if (!recipientAddress || !amount || !token || !chain || !tokenInfo.value) return;
			const targetChainId = chainIdMap[chain];
			if (!targetChainId) {
				notify(t('This currency or blockchain is not supported'));
				return;
			}
			switchChain({ chainId: targetChainId });
			if (tokenInfo.value.is_native) {
				sendTransaction({ to: recipientAddress as Address, value: parseEther(amount) });
			} else {
				if (!tokenInfo.value.contract_address) {
					notify(t('Contract address not found for token'));
					return;
				}
				const decimals = (tokenDecimals.value as number) || 18;
				const tokenAmount = parseUnits(amount, decimals);
				writeContract({
					chainId: targetChainId,
					address: tokenInfo.value.contract_address as Address,
					abi: erc20Abi,
					functionName: 'transfer',
					args: [recipientAddress as Address, tokenAmount]
				});
			}
		} catch (error: any) {
			console.error(error);
			notify(error?.message || t('Transaction failed'));
		}
	};

	const getError = (message: string) => {
		if (!message) {
			notify(t("User rejected the request"))
			return;
		}
		if (message.includes("User rejected the request")) {
			notify(t("User rejected the request"))
		} else if (message.includes("The current chain of the wallet")) {
			notify(t("An unexpected error occurred"))
		} else {
			notify(message)
		}
	}

	watch(errorSendTransaction, (error) => {
		if (!error) return;
		getError(error.message)
	});
	watch(errorWriteContract, (error) => {
		if (!error) return;
		getError(error.message)
	});
	watch(transactionHash, (hash) => {
		if (hash) notify(`${t('Transaction sent')}: ${hash}`, "success");
	});
	watch(contractHash, (hash) => {
		if (hash) notify(`${t('Transaction sent')}: ${hash}`, "success");
	});
</script>

<template>
	<div class="flex flex-column gap-12">
		<ui-button
			v-if="!isConnected"
			@click="modalConnectWallet.open()"
			:loading="isLoadingBtn"
			type="secondary"
			class="w-full flex flex-center gap-4"
			left-icon-name="account-balance-wallet"
			left-icon-size="md"
		>
			{{ $t('Connect wallet') }}
		</ui-button>
		<div v-if="isConnected && address" class="info">
			<div class="info__header">
				<div class="info__wallet">
					<div class="info__icon">
						<icon-wallet-connect v-if="walletIcon.type === 'walletconnect'" />
						<img v-else-if="walletIcon.type === 'image'" :src="walletIcon.src" alt="wallet" />
						<ui-icon v-else name="account-balance_wallet  2" type="100" />
					</div>
					<span class="info__name">{{ walletName }}</span>
				</div>
				<span class="info__status">
					<span class="info__dot" />
					{{ $t("Connected") }}
				</span>
			</div>
			<div class="info__address">
				<span class="info__address-text">{{ address }}</span>
				<ui-copy-text :copied-text="address" size-icon="sm" color-icon="#A4A5B1" />
			</div>
			<div class="info__actions">
				<ui-button @click="disconnect" type="secondary" size="sm">
					{{ $t("Disconnect") }}
				</ui-button>
				<ui-button :loading="isLoadingBtn" @click="handlePayment" size="sm" mode="neutral">
					{{ $t("Pay") }}
				</ui-button>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.info {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px 16px;
		border: 1px solid $main-border-color;
		border-radius: 8px;
		background: rgba(#6b6d80, 0.02);
		@include mediamax(480) {
			padding: 12px;
		}
		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
		}
		&__wallet {
			display: flex;
			align-items: center;
			gap: 8px;
		}
		&__icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			border-radius: 8px;
			background: rgba(#6b6d80, 0.08);
			img {
				width: 20px;
				height: 20px;
				object-fit: contain;
			}
			:deep(svg) {
				width: 20px;
				height: 20px;
			}
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
			word-break: break-word;
		}
		&__address-text {
			font-family: monospace;
			font-size: 13px;
			color: $main-text-grey-color;
			flex: 1;
			@include mediamax(480) {
				font-size: 12px;
			}
		}
		&__actions {
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 8px;
			margin-top: 4px;
		}
	}
</style>