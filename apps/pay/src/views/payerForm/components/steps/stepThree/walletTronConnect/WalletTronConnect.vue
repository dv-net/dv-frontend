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
	import { UiButton, UiCopyText, UiInput } from "@dv.net/ui-kit";
	import WalletTronModal from "@pay/views/payerForm/components/steps/stepThree/walletTronConnect/walletTronModal/WalletTronModal.vue";

	const { startPolling } = usePolling();
	const { notify } = useNotifications();
	const { t } = useI18n();

	const { recipientAddress, amount, token } = defineProps<IProps>();

	const isShowModalTronWallets = defineModel<boolean>("isShowModalTronWallets", { required: true, default: false });

	const walletList = ref<any[]>([]);
	const okxWallet = ref<any>(null);
	const tronLinkWallet = ref<any>(null);

	const isContractTron = computed<boolean>(() => Boolean(token) && Object.keys(TRON_CONTRACTS).includes(token!));
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
			initialized: isTronLinkInitialized && isTronLinkInstalled,
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
			initialized: isOkxInitialized && isOkxInstalled,
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
	<div v-if="connectedWallets.length" class="wallets">
		<div v-for="item in connectedWallets" :key="item.id" class="wallets__item">
			<div class="header">
				<div class="header__wallet">
					<img v-if="item.icon" class="header__icon" :src="item.icon" alt="wallet" />
					<span class="header__name">{{ item.name }}</span>
				</div>
				<span class="header__status">
					<span class="header__dot" />
					{{ $t("Connected") }}
				</span>
			</div>
			<div class="info">
				<ui-input v-model="item.address" size="sm" filled readonly-interactive>
					<template #append>
						<ui-copy-text v-if="item.address" :copied-text="item.address" size-icon="sm" color-icon="#A4A5B1" />
					</template>
				</ui-input>
				<div class="info__inner">
					<ui-button
						v-if="item.id !== 'tronlink'"
						@click="handleDisconnectWallet(item.id)"
						type="secondary"
						size="lg"
						class="info__btn"
						:loading="item.isLoading"
					>
						{{ $t("Disconnect") }}
					</ui-button>
					<ui-button class="info__btn" @click="handleSendTransaction(item.id)" size="lg" mode="neutral">
						{{ $t("Pay") }}
					</ui-button>
				</div>
			</div>
		</div>
	</div>
	<wallet-tron-modal v-model:is-show="isShowModalTronWallets" :wallets="walletList" @select="handleClickWallet" />
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
