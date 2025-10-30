<script setup lang="ts">
	import { ref, onMounted } from "vue";
	import type { IProps } from "@pay/views/payerForm/components/steps/stepThree/walletTronConnect/IProps.ts";
	import { formatAmountBlockchain } from "@shared/utils/helpers/general.ts";
	import okxWalletImage from "@pay/assets/images/wallets/okx.png";
	import tronLinkWalletImage from "@pay/assets/images/wallets/tronLink.png";
	import { usePolling } from "@shared/utils/composables/usePolling.ts";
	import { TRON_USDT_CONTRACT } from "@pay/utils/constants/wallets";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import { useI18n } from "vue-i18n";

	const { startPolling } = usePolling();
	const { notify } = useNotifications();
	const { t } = useI18n()

	const { recipientAddress, amount, isUsdtToken } = defineProps<IProps>();

	const walletList = ref<any[]>([]);
	const okxWallet = ref<any>(null);
	const tronLinkWallet = ref<any>(null);

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
			if (isUsdtToken) {
				const contract = await tronWeb.contract().at(TRON_USDT_CONTRACT);
				const balance = await contract.balanceOf(fromAddress).call();
				const usdtBalanceFormatted = Number(balance) / 1_000_000;
				if (usdtBalanceFormatted < numericAmount) {
					throw new Error(`Insufficient USDT. Available: ${formatAmountBlockchain(usdtBalanceFormatted, 'USDT.Tron')} USDT, required: ${formatAmountBlockchain(numericAmount, 'USDT.Tron')} USDT`);
				}
				if (balanceTRX < estimatedFee) {
					throw new Error(`Insufficient TRX for fees. Available: ${formatAmountBlockchain(balanceTRX, 'TRX.Tron')} TRX, required: ${formatAmountBlockchain(estimatedFee, 'TRX.Tron')} TRX`);
				}
				const amountInSmallestUnit = BigInt(Math.floor(numericAmount * 1_000_000));
				await contract.transfer(recipientAddress, amountInSmallestUnit).send();
			} else {
				const requiredTRX = numericAmount + estimatedFee;
				if (balanceTRX < requiredTRX) {
					throw new Error(`Insufficient TRX. Available: ${formatAmountBlockchain(balanceTRX, 'TRX.Tron')} TRX, required: ${formatAmountBlockchain(requiredTRX, 'TRX.Tron')} TRX (incl. fee)`);
				}
				const amountInSun = tronWeb.toSun(numericAmount);
				const transaction = await tronWeb.transactionBuilder.sendTrx(recipientAddress, amountInSun, fromAddress);
				const signedTransaction = await tronWeb.trx.sign(transaction);
				await tronWeb.trx.sendRawTransaction(signedTransaction);
			}
		} catch (error: any) {
			if (typeof error === "string") {
				notify(error)
			} else {
				notify(error.message)
			}
			console.error(error)
		}
	};

	const handleConnect = async (walletId: string) => {
		try {
			if (tronLinkWallet.value && walletId === "tronlink") {
				await tronLinkWallet.value.request({ method: "tron_requestAccounts" });
			} else if (okxWallet.value && walletId === "okx") {
				const resp = await okxWallet.value.request({ method: "tron_requestAccounts" });
				if (resp.code === 200) await getAvailableWallets();
			}
		} catch (error: any) {
			console.error(error);
		}
	};

	const handleClickWallet = async (wallet: any) => {
		if (wallet.initialized) {
			await handleSendTransaction(wallet.id)
		} else if (wallet.detected) {
		 await handleConnect(wallet.id)
		}
	}

	const getAvailableWallets = async () => {
		walletList.value = [];
		// TronLink info
		const isTronLinkInstalled: boolean = Boolean(window?.tronLink);
		const isTronLinkInitialized: boolean = Boolean(window?.tronLink?.ready);
		walletList.value.push({
			id: "tronlink",
			name: "TronLink",
			icon: tronLinkWalletImage,
			detected: isTronLinkInstalled,
			initialized: isTronLinkInitialized
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
			initialized: isOkxInitialized
		});
		if (isOkxInstalled) {
			okxWallet.value = window.okxwallet.tronWeb;
		}
	};

	onMounted(async () => {
		await startPolling(getAvailableWallets)
	});

	declare global {
		interface Window {
			tronWeb: any;
			tronLink: any;
			ethereum: any;
			okxwallet: any;
		}
	}
</script>

<template>
	<div class="wallets">
		<div
			v-for="wallet in walletList"
			:key="wallet.id"
			class="wallet"
			:class="{ 'opacity': !wallet.detected }"
			@click="handleClickWallet(wallet)"
		>
			<div class="wallet__inner">
				<img class="wallet__img" :src="wallet.icon" alt="Icon" />
				<span class="wallet__name">{{ wallet.name }}</span>
			</div>
			<div class="wallet__state">
				<span
					class="state"
					:class="{
						'state--connected': wallet.initialized,
						'state--installed': !wallet.initialized && wallet.detected,
						'state--missing': !wallet.detected,
					}"
				>
					<span class="state__dot" />
					{{ wallet.initialized ? $t('Connected') : wallet.detected ? $t('Installed') : $t('Not installed') }}
				</span>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.wallets {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		@include mediamax(768) {
			grid-template-columns: 1fr;
		}
		.wallet {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			border: 1px solid $main-border-color;
			border-radius: 8px;
			padding: 8px;
			transition: border-color 0.3s ease-in-out;
			@media (hover: hover) {
				&:hover {
					cursor: pointer;
					border-color: $main-text-link-and-price-color;
				}
			}
			@include mediamax(480) {
				font-size: 14px;
			}
			&__inner {
				display: flex;
				align-items: center;
				gap: 8px;
			}
			&__img {
				width: 24px;
				@include mediamax(480) {
					width: 20px;
				}
			}
			&__state {
				display: flex;
				align-items: center;
				gap: 8px;
				color: $main-text-grey-color;
				font-size: 14px;
				.state {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					padding: 4px 8px;
					border-radius: 24px;
					font-size: 12px;
					background: rgba($main-text-grey-color, 0.1);
					&__dot {
						display: inline-block;
						width: 8px;
						height: 8px;
						border-radius: 100%;
						background: $main-text-grey-color;
					}
					&--connected {
						background: rgba(#16a34a, 0.12);
						color: #16a34a;
						.state__dot { background: #16a34a; }
					}
					&--installed {
						background: rgba(#d97706, 0.12);
						color: #d97706;
						.state__dot { background: #d97706; }
					}
					&--missing {
						background: rgba(#94a3b8, 0.12);
						color: #64748b;
						.state__dot { background: #94a3b8; }
					}
				}
			}
		}
	}
</style>
