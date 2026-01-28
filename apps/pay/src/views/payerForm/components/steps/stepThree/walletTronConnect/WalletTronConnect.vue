<script setup lang="ts">
	import { ref, onMounted, computed } from "vue";
	import type { IProps } from "@pay/views/payerForm/components/steps/stepThree/walletTronConnect/IProps.ts";
	import { formatAmountBlockchain } from "@shared/utils/helpers/general.ts";
	import okxWalletImage from "@pay/assets/images/wallets/okx.png";
	import tronLinkWalletImage from "@pay/assets/images/wallets/tronLink.png";
	import { usePolling } from "@shared/utils/composables/usePolling.ts";
	import { TRON_CONTRACTS } from "@pay/utils/constants/connectWallet/tron.ts";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import { useI18n } from "vue-i18n";
	import { UiButton, UiCopyText } from "@dv.net/ui-kit";
	import WalletTronModal from "@pay/views/payerForm/components/steps/stepThree/walletTronConnect/walletTronModal/WalletTronModal.vue";

	const { startPolling } = usePolling();
	const { notify } = useNotifications();
	const { t } = useI18n();

	const { recipientAddress, amount, token } = defineProps<IProps>();

	const walletList = ref<any[]>([]);
	const okxWallet = ref<any>(null);
	const tronLinkWallet = ref<any>(null);
	const isShowModalWallets = ref<boolean>(false);

	const isContractTron = computed<boolean>(() => Boolean(token) && Object.keys(TRON_CONTRACTS).includes(token!));
	const isAllConnectedWallets = computed<boolean>(() => walletList.value.every((item) => item.initialized));
	const connectedWallets = computed(() => walletList.value.filter((item) => item.initialized));

	const handleSendTransaction = async (walletId: string) => {
		try {
			const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
			if (!numericAmount || Number.isNaN(numericAmount)) throw new Error(t("Invalid amount"));
			const tronWeb = walletId === "okx" ? okxWallet.value : tronLinkWallet.value.tronWeb;
			if (!tronWeb) throw new Error("TronWeb not found for the selected wallet");
			const fromAddress = tronWeb.defaultAddress.base58;
			if (!fromAddress) throw new Error(t("Failed to get wallet address"));
			const balanceSun = await tronWeb.trx.getBalance(fromAddress);
			const balanceTRX = balanceSun / 1_000_000;
			const estimatedFee = 0.01;
			if (isContractTron.value) {
				const contract = await tronWeb.contract().at(TRON_CONTRACTS[token!]);
				const balance = await contract.balanceOf(fromAddress).call();
				const balanceFormatted = Number(balance) / 1_000_000;
				if (balanceFormatted < numericAmount) {
					throw new Error(
						`Insufficient ${token}. Available: ${formatAmountBlockchain(balanceFormatted, `${token}.Tron`)} ${token}, required: ${formatAmountBlockchain(numericAmount, `${token}.Tron`)} ${token}`
					);
				}
				if (balanceTRX < estimatedFee) {
					throw new Error(
						`Insufficient TRX for fees. Available: ${formatAmountBlockchain(balanceTRX, "TRX.Tron")} TRX, required: ${formatAmountBlockchain(estimatedFee, "TRX.Tron")} TRX`
					);
				}
				const amountInSmallestUnit = BigInt(Math.floor(numericAmount * 1_000_000));
				await contract.transfer(recipientAddress, amountInSmallestUnit).send();
			} else {
				const requiredTRX = numericAmount + estimatedFee;
				if (balanceTRX < requiredTRX) {
					throw new Error(
						`Insufficient TRX. Available: ${formatAmountBlockchain(balanceTRX, "TRX.Tron")} TRX, required: ${formatAmountBlockchain(requiredTRX, "TRX.Tron")} TRX (incl. fee)`
					);
				}
				const amountInSun = tronWeb.toSun(numericAmount);
				const transaction = await tronWeb.transactionBuilder.sendTrx(recipientAddress, amountInSun, fromAddress);
				const signedTransaction = await tronWeb.trx.sign(transaction);
				await tronWeb.trx.sendRawTransaction(signedTransaction);
			}
		} catch (error: any) {
			if (typeof error === "string") {
				notify(error);
			} else {
				notify(error.message);
			}
			console.error(error);
		}
	};

	const handleConnect = async (walletId: string) => {
		try {
			if (tronLinkWallet.value && walletId === "tronlink") {
				if (window.trustwallet) {
					notify(
						t(
							"You have Trust Wallet installed, which may be intercepting TronLink requests. To connect via TronLink, temporarily disable Trust Wallet and refresh the page"
						)
					);
					return;
				}
				await tronLinkWallet.value.request({ method: "tron_requestAccounts" });
			} else if (okxWallet.value && walletId === "okx") {
				const resp = await okxWallet.value.request({ method: "tron_requestAccounts" });
				if (resp?.code === 200) await getAvailableWallets();
			}
		} catch (error: any) {
			console.error(error);
		}
	};

	const handleDisconnectWallet = (walletId: string) => {
		if (walletId !== "okx") return;
		const findIndex = walletList.value.findIndex((item) => item.id === walletId);
		if (findIndex === -1) return;
		walletList.value[findIndex].isLoading = true;
		window.okxwallet
			.request({ method: "wallet_disconnect" })
			.then(() => {
				walletList.value[findIndex].initialized = false;
				okxWallet.value = null;
			})
			.catch(console.error)
			.finally(() => {
				walletList.value[findIndex].isLoading = false;
			});
	};

	const handleClickWallet = async (wallet: any) => {
		if (wallet.initialized) {
			await handleSendTransaction(wallet.id);
		} else if (wallet.detected) {
			await handleConnect(wallet.id);
		}
	};

	const getAvailableWallets = async () => {
		walletList.value = [];
		// TronLink info
		const isTronLinkInstalled: boolean = Boolean(window?.tronLink) && Boolean(window?.tronLink?.tronlinkParams);
		const isTronLinkInitialized: boolean = Boolean(window?.tronLink?.ready);
		walletList.value.push({
			id: "tronlink",
			name: "TronLink",
			icon: tronLinkWalletImage,
			detected: isTronLinkInstalled,
			initialized: isTronLinkInitialized,
			isLoading: false,
			address: window?.tronLink?.tronWeb?.defaultAddress?.base58
		});

		if (isTronLinkInstalled) {
			tronLinkWallet.value = window.tronLink;
		}

		// OKX info
		const isOkxInstalled: boolean = Boolean(window?.okxwallet && window?.okxwallet?.tronWeb);
		const isOkxInitialized: boolean = Boolean(window?.okxwallet?.tronLink?.ready);
		walletList.value.push({
			id: "okx",
			name: "OKX Wallet",
			icon: okxWalletImage,
			detected: isOkxInstalled,
			initialized: isOkxInitialized,
			isLoading: false,
			address: window?.okxwallet?.tronWeb?.defaultAddress?.base58
		});
		if (isOkxInstalled) {
			okxWallet.value = window.okxwallet.tronWeb;
		}
	};

	onMounted(async () => {
		await startPolling(getAvailableWallets);
	});

	declare global {
		interface Window {
			tronWeb: any;
			tronLink: any;
			okxwallet: any;
			trustwallet: any;
		}
	}
</script>

<template>
	<div class="wallets">
		<ui-button
			v-if="!isAllConnectedWallets"
			class="wallets__btn"
			type="secondary"
			left-icon-name="account-balance-wallet"
			size="sm"
			@click="isShowModalWallets = true"
		>
			{{ $t("Connect wallet") }}
		</ui-button>
		<div v-if="connectedWallets.length" class="wallets__list">
			<div v-for="item in connectedWallets" :key="item.id" class="info">
				<div class="info__header">
					<div class="info__wallet">
						<div class="info__icon">
							<img v-if="item.icon" :src="item.icon" alt="wallet" />
						</div>
						<span class="info__name">{{ item.name }}</span>
					</div>
					<span class="info__status">
						<span class="info__dot" />
						{{ $t("Connected") }}
					</span>
				</div>
				<div class="info__address">
					<span class="info__address-text">{{ item.address }}</span>
					<ui-copy-text v-if="item.address" :copied-text="item.address" size-icon="sm" color-icon="#A4A5B1" />
				</div>
				<div class="info__actions">
					<ui-button
						v-if="item.id !== 'tronlink'"
						@click="handleDisconnectWallet(item.id)"
						type="secondary"
						size="sm"
						:loading="item.isLoading"
					>
						{{ $t("Disconnect") }}
					</ui-button>
					<ui-button @click="handleSendTransaction(item.id)" size="sm" mode="neutral">
						{{ $t("Pay") }}
					</ui-button>
				</div>
			</div>
		</div>
		<wallet-tron-modal v-model:is-show="isShowModalWallets" :wallets="walletList" @select="handleClickWallet" />
	</div>
</template>

<style scoped lang="scss">
	.wallets {
		display: flex;
		flex-direction: column;
		gap: 12px;
		&__btn {
			@include mediamax(480) {
				width: 100%;
			}
		}
		&__list {
			display: flex;
			flex-direction: column;
			gap: 12px;
			.info {
				display: flex;
				flex-direction: column;
				gap: 8px;
				padding: 12px 16px;
				border: 1px solid $main-border-color;
				border-radius: 8px;
				background: rgba(#6b6d80, 0.02);
				@include mediamax(480) {
					font-size: 12px;
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
					word-break: break-word;
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
		}
	}
</style>
