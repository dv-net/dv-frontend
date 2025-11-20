<script setup lang="ts">
	import { createAppKit } from "@reown/appkit/vue";
	import { computed } from "vue";
	import { useAccount, useDisconnect } from "@wagmi/vue";
	import {
		metadataWalletConnect,
		networksWalletConnect,
		wagmiAdapter
	} from "@pay/utils/constants/connectWallet/evm.ts";
	import { UiButton, UiCopyText } from "@dv.net/ui-kit";
	import IconWalletConnect from "@pay/components/icons/IconWalletConnect.vue";
	import { truncateHash } from "@shared/utils/helpers/general.ts";

	const { address, isConnected, isConnecting, connector } = useAccount();
	const { disconnect } = useDisconnect();

	const walletName = computed<string>(() => {
		if (!isConnected.value || !connector.value) return "";
		return connector.value.name || "WalletConnect";
	});

	const formattedAddress = computed<string>(() => {
		if (!address.value) return "";
		return truncateHash(address.value, 6, 4);
	});

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

	const handlePayment = () => {
		console.log(address.value);
	}

	const handleDisconnect = async () => {
		try {
			await disconnect();
		} catch (error) {
			console.error('Error disconnecting wallet:', error);
		}
	}
</script>

<template>
	<div class="wallet-evm-connect">
		<ui-button
			@click="isConnected ? handlePayment() : modalConnectWallet.open()"
			:loading="isConnecting"
			type="secondary"
			class="w-full flex flex-center gap-4"
		>
			<icon-wallet-connect style="width: 24px" />
			<span>{{ isConnected ? $t('Pay') : 'WalletConnect' }}</span>
		</ui-button>
		<div v-if="isConnected && address" class="wallet-info">
			<div class="wallet-info__header">
				<span class="wallet-info__name">{{ walletName }}</span>
				<span class="wallet-info__status">
					<span class="wallet-info__dot" />
					{{ $t('Connected') }}
				</span>
			</div>
			<div class="wallet-info__address">
				<span class="wallet-info__address-text">{{ formattedAddress }}</span>
				<ui-copy-text :copied-text="address" color-icon="#A4A5B1" />
			</div>
			<ui-button
				@click="handleDisconnect"
				type="secondary"
				size="sm"
				class="wallet-info__disconnect"
			>
				{{ $t('Disconnect') }}
			</ui-button>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.wallet-evm-connect {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.wallet-info {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		border: 1px solid #ecf0f5;
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
			color: #1e1e1e;
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
			color: #6b6d80;
			flex: 1;
		}

		&__disconnect {
			margin-top: 4px;
		}
	}
</style>