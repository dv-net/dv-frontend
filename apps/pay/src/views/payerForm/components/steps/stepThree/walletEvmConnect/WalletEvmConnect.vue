<script setup lang="ts">
	import { createAppKit } from "@reown/appkit/vue";
	import { computed, watch } from "vue";
	import {
		useAccount,
		useDisconnect,
		useSendTransaction,
		useWriteContract,
		useSwitchChain,
		useReadContract
	} from "@wagmi/vue";
	import {
		chainIdMap,
		metadataWalletConnect,
		networksWalletConnect,
		wagmiAdapter
	} from "@pay/utils/constants/connectWallet/evm.ts";
	import { UiButton, UiCopyText, UiIcon, UiInput } from "@dv.net/ui-kit";
	import IconWalletConnect from "@pay/components/icons/IconWalletConnect.vue";
	import iconMetaMask from "@pay/assets/images/wallets/metaMask.png";
	import iconTrustWallet from "@pay/assets/images/wallets/trustWallet.png";
	import iconOkxWallet from "@pay/assets/images/wallets/okx.png";
	import iconRabbyWallet from "@pay/assets/images/wallets/rabbyWallet.png";
	import type { IProps } from "@pay/views/payerForm/components/steps/stepThree/walletEvmConnect/IProps.ts";
	import { parseEther, parseUnits, type Address, erc20Abi } from "viem";
	import { getBalance } from "viem/actions";
	import { storeToRefs } from "pinia";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import { useI18n } from "vue-i18n";
	import { getPublicClient } from "@wagmi/core";

	const { notify } = useNotifications();
	const { t } = useI18n();
	const { addresses } = storeToRefs(usePayerFormStore());
	const { address, isConnected, connector } = useAccount();
	const { disconnect } = useDisconnect();
	const {
		sendTransaction,
		isPending: isPendingSendTransaction,
		error: errorSendTransaction,
		data: transactionHash
	} = useSendTransaction();
	const { switchChainAsync } = useSwitchChain();
	const {
		writeContract,
		isPending: isPendingContract,
		error: errorWriteContract,
		data: contractHash
	} = useWriteContract();

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

	const walletIcon = computed(() => {
		const iconByName: Record<string, string> = {
			metamask: iconMetaMask,
			trustwallet: iconTrustWallet,
			okxwallet: iconOkxWallet,
			rabbywallet: iconRabbyWallet
		};
		const normalized = walletName.value.toLowerCase().replace(/\s+/g, "");
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
		chainId: computed(() => (chain && chain in chainIdMap ? chainIdMap[chain] : undefined)),
		address: computed(() => tokenInfo.value?.contract_address as Address | undefined),
		abi: erc20Abi,
		functionName: "decimals"
	});

	const handlePayment = async () => {
		try {
			if (!recipientAddress || !amount || !token || !chain || !tokenInfo.value) return;
			const targetChainId = chainIdMap[chain];
			if (!targetChainId) {
				notify(t("This currency or blockchain is not supported"));
				return;
			}
			if (!address.value) {
				notify(t("Connect wallet"));
				return;
			}
			const userAddress = address.value as Address;
			const publicClient = getPublicClient(wagmiAdapter.wagmiConfig, { chainId: targetChainId });
			if (!publicClient) {
				notify(t("Transaction failed"));
				return;
			}
			if (tokenInfo.value.is_native) {
				const nativeBalance = await getBalance(publicClient, { address: userAddress });
				const needed = parseEther(amount);
				if (nativeBalance < needed) {
					notify(t("Insufficient funds"));
					return;
				}
			} else {
				if (!tokenInfo.value.contract_address) {
					notify(t("Contract address not found for token"));
					return;
				}
				const decimals = (tokenDecimals.value as number) || 18;
				const tokenAmount = parseUnits(amount, decimals);
				const tokenBalance = (await publicClient.readContract({
					address: tokenInfo.value.contract_address as Address,
					abi: erc20Abi,
					functionName: "balanceOf",
					args: [userAddress]
				})) as bigint;
				if (tokenBalance < tokenAmount) {
					notify(t("Insufficient funds"));
					return;
				}
			}
			await switchChainAsync({ chainId: targetChainId });
			if (tokenInfo.value.is_native) {
				sendTransaction({
					chainId: targetChainId,
					to: recipientAddress as Address,
					value: parseEther(amount)
				});
			} else {
				const decimals = (tokenDecimals.value as number) || 18;
				const tokenAmount = parseUnits(amount, decimals);
				writeContract({
					chainId: targetChainId,
					address: tokenInfo.value.contract_address as Address,
					abi: erc20Abi,
					functionName: "transfer",
					args: [recipientAddress as Address, tokenAmount]
				});
			}
		} catch (error: any) {
			console.error(error);
			notify(error?.message || t("Transaction failed"));
		}
	};

	const openConnectModal = () => modalConnectWallet.open();

	const getError = (message: string) => {
		if (!message) {
			notify(t("User rejected the request"));
			return;
		}
		if (message.includes("User rejected the request")) {
			notify(t("User rejected the request"));
		} else if (message.includes("The current chain of the wallet") || message.includes("An unknown RPC error")) {
			notify(t("An unexpected error occurred"));
		} else {
			notify(message);
		}
	};

	watch(errorSendTransaction, (error) => {
		if (!error) return;
		getError(error.message);
	});
	watch(errorWriteContract, (error) => {
		if (!error) return;
		getError(error.message);
	});
	watch(transactionHash, (hash) => {
		if (hash) notify(`${t("Transaction sent")}: ${hash}`, "success");
	});
	watch(contractHash, (hash) => {
		if (hash) notify(`${t("Transaction sent")}: ${hash}`, "success");
	});

	defineExpose({ openConnectModal, isConnected, isLoadingBtn });
</script>

<template>
	<div v-if="isConnected && address" class="wallets">
		<div class="wallets__item">
			<div class="header">
				<div class="header__wallet">
					<div class="header__icon">
						<icon-wallet-connect v-if="walletIcon.type === 'walletconnect'" />
						<img v-else-if="walletIcon.type === 'image'" :src="walletIcon.src" alt="wallet" />
						<ui-icon v-else name="account-balance_wallet  2" type="100" />
					</div>
					<span class="header__name">{{ walletName }}</span>
				</div>
				<span class="header__status">
					<span class="header__dot" />
					{{ $t("Connected") }}
				</span>
			</div>
			<div class="info">
				<ui-input v-model="address" size="sm" filled readonly-interactive>
					<template #append>
						<ui-copy-text v-if="address" :copied-text="address" size-icon="sm" color-icon="#A4A5B1" />
					</template>
				</ui-input>
				<div class="info__inner">
					<ui-button @click="disconnect" type="secondary" size="lg" class="info__btn">
						{{ $t("Disconnect") }}
					</ui-button>
					<ui-button :loading="isLoadingBtn" @click="handlePayment" size="lg" mode="neutral" class="info__btn">
						{{ $t("Pay") }}
					</ui-button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.wallets {
		display: flex;
		flex-direction: column;
		gap: 4px;
		border-radius: 14px;
		border: 1px solid #e1e8f1;
		background-color: #f7f9fb;
		padding: 4px;
		max-width: 640px;
		width: 100%;
		@include mediamax(680) {
			padding: 0;
			border-radius: unset;
			max-width: unset;
			gap: 24px;
			border: unset;
			background-color: transparent;
		}
		&__item {
			display: flex;
			flex-direction: column;
			background-color: #fff;
			border-radius: 12px;
			border: 1px solid #e1e8f1;
			padding: 16px;
			gap: 16px;
			max-width: 640px;
			width: 100%;
			.header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 8px;
				&__wallet {
					display: flex;
					align-items: center;
					gap: 8px;
				}
				&__icon {
					width: 24px;
					height: 24px;
					object-fit: contain;
					border-radius: 4px;
					img {
						width: 24px;
						height: 24px;
						object-fit: contain;
					}
					:deep(svg) {
						width: 24px;
						height: 24px;
					}
				}
				&__name {
					color: #303345;
					font-size: 14px;
					font-weight: 500;
					line-height: 20px;
				}
				&__status {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					padding: 4px 8px;
					border-radius: 24px;
					font-size: 12px;
					min-height: 24px;
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
			}
			.info {
				display: flex;
				align-items: center;
				gap: 16px;
				@include mediamax(680) {
					flex-direction: column;
					align-items: unset;
				}
				&__inner {
					display: flex;
					align-items: center;
					gap: 8px;
				}
				&__btn {
					flex-grow: 1;
				}
			}
		}
	}
</style>