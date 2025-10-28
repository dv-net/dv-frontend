<script setup lang="ts">
	import { ref, computed, onMounted } from "vue";
	import { useI18n } from "vue-i18n";
	import type { IProps } from "@pay/views/payerForm/components/steps/stepThree/walletTronConnect/IProps.ts";
	import { truncateHash } from "@shared/utils/helpers/general.ts";
	import okxWalletImage from "@pay/assets/images/wallets/okx.png"
	import tronLinkWalletImage from "@pay/assets/images/wallets/tronLink.png"
	import { usePolling } from "@shared/utils/composables/usePolling.ts";

	const { startPolling } = usePolling();

	const { recipientAddress, amount, currency, isUsdtToken } = defineProps<IProps>();

	const emit = defineEmits<{
		connected: [address: string];
		transactionSent: [hash: string];
	}>();

	const walletList = ref<any[]>([])
	const okxWallet = ref(null)
	const tronLinkWallet = ref(null)






	const isLoading = ref<string | null>(null);
	const errorMessage = ref<string | null>(null);
	const connectedAddress = ref<string | null>(null);
	const walletBalance = ref<string | null>(null);
	const connectedWalletType = ref<string | null>(null);



	const sendTronTransaction = async () => {
		try {
			isLoading.value = "sending";
			errorMessage.value = null;

			if (!window.tronWeb) {
				throw new Error("TronLink не подключен");
			}

			if (!recipientAddress) {
				throw new Error("Адрес получателя не указан");
			}

			const amountValue = typeof amount === "string" ? parseFloat(amount) : (amount || 0);
			
			// Проверяем баланс кошелька
			const balanceSun = await window.tronWeb.trx.getBalance(connectedAddress.value);
			const balanceTRX = balanceSun / 1_000_000; // Конвертируем Sun в TRX
			
			// Для USDT токенов комиссия покрывается TRX, но токен отправляется
			// Для обычных TRX транзакций берем amount + комиссия
			const estimatedFee = 0.01; // Комиссия всегда в TRX
			
			let requiredTRX: number;
			let sendAmount: number;
			
			if (isUsdtToken) {
				// Для USDT: проверяем баланс USDT и TRX для комиссии
				const usdtContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
				
				// Получаем баланс токена через контракт
				let usdtBalance = 0;
				try {
					const contract = await window.tronWeb.contract().at(usdtContractAddress);
					const balance = await contract.balanceOf(connectedAddress.value).call();
					// Конвертируем BigInt в обычное число
					usdtBalance = typeof balance === 'bigint' ? Number(balance) : Number(balance);
				} catch (error) {
					console.error("Ошибка получения баланса USDT:", error);
					throw new Error("Не удалось получить баланс USDT");
				}
				
				const usdtBalanceFormatted = usdtBalance / 1_000_000; // USDT имеет 6 десятичных знаков
				
				requiredTRX = estimatedFee;
				sendAmount = amountValue; // Сумма в USDT
				
				// Проверяем баланс USDT
				if (usdtBalanceFormatted < sendAmount) {
					throw new Error(
						`Недостаточно USDT на балансе. Доступно: ${usdtBalanceFormatted.toFixed(6)} USDT, требуется: ${sendAmount.toFixed(6)} USDT`
					);
				}
				
				// Проверяем баланс TRX для комиссии
				if (balanceTRX < requiredTRX) {
					throw new Error(
						`Недостаточно TRX для комиссии. Доступно: ${balanceTRX.toFixed(6)} TRX, требуется: ${requiredTRX.toFixed(6)} TRX`
					);
				}
				
				console.log("📤 Отправка USDT токена:");
				console.log("  Получатель:", recipientAddress);
				console.log("  Сумма:", sendAmount, "USDT");
				console.log("  Баланс USDT:", usdtBalanceFormatted.toFixed(6), "USDT");
				console.log("  Баланс TRX:", balanceTRX.toFixed(6), "TRX (для комиссии)");
			} else {
				// Для TRX: проверяем баланс TRX
				requiredTRX = amountValue + estimatedFee;
				sendAmount = amountValue;
				
				if (balanceTRX < requiredTRX) {
					throw new Error(
						`Недостаточно баланса. Доступно: ${balanceTRX.toFixed(6)} TRX, требуется: ${requiredTRX.toFixed(6)} TRX (включая комиссию)`
					);
				}
				
				console.log("📤 Отправка TRX:");
				console.log("  Получатель:", recipientAddress);
				console.log("  Сумма:", sendAmount, "TRX");
				console.log("  Баланс кошелька:", balanceTRX.toFixed(6), "TRX");
				console.log("  Требуется (с комиссией):", requiredTRX.toFixed(6), "TRX");
			}

			let result;
			const usdtContractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // USDT TRC20 контракт
			
			if (isUsdtToken) {
				// Отправляем TRC20 токен (USDT)
				const amountInSmallestUnit = Math.floor(sendAmount * 1_000_000); // USDT имеет 6 десятичных знаков
				
				// Получаем контракт и вызываем метод transfer
				const contract = await window.tronWeb.contract().at(usdtContractAddress);
				// Используем BigInt для передачи суммы
				result = await contract.transfer(
					recipientAddress,
					BigInt(amountInSmallestUnit)
				).send();
			} else {
				// Отправляем обычную TRX транзакцию
				const amountInSun = window.tronWeb.toSun(sendAmount);
				const transaction = await window.tronWeb.transactionBuilder.sendTrx(
					recipientAddress,
					amountInSun,
					connectedAddress.value
				);
				
				const signedTransaction = await window.tronWeb.trx.sign(transaction);
				result = await window.tronWeb.trx.sendRawTransaction(signedTransaction);
			}

			console.log("✅ Транзакция отправлена:", result.txid || result);
			emit("transactionSent", result.txid || result);
			connectedAddress.value = null; // Скрываем состояние подключения

		} catch (error: any) {
			const errorMsg = error.message || "Ошибка отправки транзакции";
			errorMessage.value = errorMsg;
			console.error("❌ Transaction error:", error);
		} finally {
			isLoading.value = null;
		}
	};

	const handleConnect = async (walletId: string) => {
		try {
			if (tronLinkWallet.value && (walletId === 'tronlink')) {
				await tronLinkWallet.value.request({ method: "tron_requestAccounts" });
			} else if (okxWallet.value && (walletId === 'okx')) {
				const resp = await okxWallet.value.request({ method: "tron_requestAccounts" });
				if (resp.code === 200) await getAvailableWallets();
			}
		} catch (error: any) {
			console.error(error);
		}
	};


	const getAvailableWallets = async () => {
		walletList.value = []
		// TronLink info
		const isTronLinkInstalled: boolean = Boolean(window?.tronLink);
		const isTronLinkInitialized: boolean = Boolean(window?.tronLink?.ready);
		walletList.value.push({
			id: "tronlink",
			name: "TronLink",
			icon: tronLinkWalletImage,
			detected: isTronLinkInstalled,
			initialized: isTronLinkInitialized,
		});
		if (isTronLinkInstalled) {
			tronLinkWallet.value = window.tronLink
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
		});
		if (isOkxInstalled) {
			okxWallet.value = window.okxwallet.tronWeb
		}
	};

	onMounted(async () => {
		await startPolling(async () => {
			await getAvailableWallets()
		});
	})

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
			>
				<div class="wallet__inner">
					<img class="wallet__img" :src="wallet.icon" alt="Icon" />
					<span class="wallet__name">{{ wallet.name }}</span>
				</div>
				<div class="wallet__state">
					<span v-if="wallet.initialized">Оплатить</span>
					<span v-else-if="!wallet.initialized && wallet.detected" @click="handleConnect(wallet.id)">Подключить</span>
					<span v-else>Не установлен</span>
				</div>
			</div>



<!--			<div-->
<!--				v-for="wallet in walletList"-->
<!--				:key="wallet.id"-->
<!--				class="wallet"-->
<!--				:class="{ -->
<!--					'wallet-item&#45;&#45;detected': wallet.detected,-->
<!--					'wallet-item&#45;&#45;connected': connectedAddress && connectedWalletType === wallet.id-->
<!--				}"-->
<!--				@click="wallet.detected ? handleConnect(wallet.id) : handleInstall(wallet.link)"-->
<!--			>-->
<!--				<img style="width: 24px;" :src="wallet.icon" alt="Icon" />-->
<!--				<div class="wallet-item__content">-->
<!--					<span class="wallet-item__name">{{ wallet.name }}</span>-->
<!--					<span class="wallet-item__status">-->
<!--						<span v-if="connectedAddress && connectedWalletType === wallet.id">✅ {{ $t("Connected") }}</span>-->
<!--						<span v-else-if="wallet.initialized">🟢 {{ $t("Ready") }}</span>-->
<!--						<span v-else-if="wallet.detected">🟡 {{ $t("Installed") }}</span>-->
<!--						<span v-else>⚪ {{ $t("Not installed") }}</span>-->
<!--					</span>-->
<!--				</div>-->
<!--				<div v-if="isLoading === wallet.id || isLoading === 'sending'" class="wallet-item__loader">-->
<!--					<div class="spinner" />-->
<!--				</div>-->
<!--			</div>-->
		</div>




<!--	<div class="wallet-connect">-->
<!--		<div v-if="errorMessage" class="wallet-connect__error">-->
<!--			{{ errorMessage }}-->
<!--		</div>-->

<!--		<div v-if="connectedAddress" class="wallet-connect__success">-->
<!--			<div class="wallet-connect__success-info">-->
<!--				<span>✅ {{ $t("Wallet connected") }}: {{ truncateHash(connectedAddress) }}</span>-->
<!--				<span v-if="walletBalance" class="wallet-connect__balance">-->
<!--					💰 {{ $t("Balance") }}: {{ walletBalance }} TRX-->
<!--				</span>-->
<!--			</div>-->
<!--			<button -->
<!--				class="wallet-connect__pay-btn"-->
<!--				@click="sendTronTransaction"-->
<!--				:disabled="isLoading === 'sending'"-->
<!--			>-->
<!--				<span v-if="isLoading === 'sending'">⏳</span>-->
<!--				{{ isLoading === 'sending' ? $t("Sending transaction...") : $t("Send payment") }}-->
<!--			</button>-->
<!--		</div>-->

<!--		<div v-if="isLoading === 'sending'" class="wallet-connect__sending">-->
<!--			<div class="spinner" />-->
<!--			<span>{{ $t("Sending transaction...") }}</span>-->
<!--		</div>-->


<!--	</div>-->
</template>

<style scoped lang="scss">
	.wallets {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
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
			&__inner {
				display: flex;
				align-items: center;
				gap: 8px;
			}
			&__img {
				width: 24px;
			}
			&__name {

			}
			&__state {
				color: $main-text-grey-color;
				font-size: 14px;
			}
		}
	}









	//.wallet-connect {
	//	display: flex;
	//	flex-direction: column;
	//	gap: 20px;
	//
	//	&__error {
	//		padding: 12px 16px;
	//		background-color: #fee;
	//		color: #c33;
	//		border-radius: 8px;
	//		font-size: 14px;
	//	}
	//
	//	&__success {
	//		padding: 12px 16px;
	//		background-color: #e6f7e6;
	//		color: #1f9649;
	//		border-radius: 8px;
	//		font-size: 14px;
	//		font-weight: 500;
	//
	//		&-info {
	//			display: flex;
	//			flex-direction: column;
	//			gap: 6px;
	//		}
	//	}
	//
	//	&__balance {
	//		font-size: 13px;
	//		opacity: 0.9;
	//	}
	//
	//	&__pay-btn {
	//		margin-top: 12px;
	//		padding: 12px 24px;
	//		background-color: #1f9649;
	//		color: white;
	//		border: none;
	//		border-radius: 8px;
	//		font-size: 16px;
	//		font-weight: 500;
	//		cursor: pointer;
	//		transition: all 0.2s ease;
	//		display: flex;
	//		align-items: center;
	//		justify-content: center;
	//		gap: 8px;
	//		width: 100%;
	//
	//		&:hover:not(:disabled) {
	//			background-color: #187d3f;
	//			transform: translateY(-1px);
	//		}
	//
	//		&:disabled {
	//			opacity: 0.6;
	//			cursor: not-allowed;
	//		}
	//	}
	//
	//	&__sending {
	//		display: flex;
	//		align-items: center;
	//		justify-content: center;
	//		gap: 12px;
	//		padding: 16px;
	//		background-color: #fff3e0;
	//		color: #f57c00;
	//		border-radius: 8px;
	//		font-size: 14px;
	//		font-weight: 500;
	//
	//		.spinner {
	//			width: 20px;
	//			height: 20px;
	//			border: 2px solid #e0e0e0;
	//			border-top-color: #f57c00;
	//			border-radius: 50%;
	//			animation: spin 0.8s linear infinite;
	//		}
	//	}
	//
	//	&__description {
	//		color: $main-text-grey-color;
	//		font-size: 14px;
	//		margin: -8px 0 12px 0;
	//	}
	//
	//	&__list {
	//		display: flex;
	//		flex-direction: column;
	//		gap: 12px;
	//	}
	//}

	//.wallet-item {
	//	display: flex;
	//	align-items: center;
	//	gap: 12px;
	//	padding: 16px;
	//	border: 1px solid $main-border-color;
	//	border-radius: 8px;
	//	background-color: $form-background;
	//	cursor: pointer;
	//	transition: all 0.2s ease;
	//	position: relative;
	//
	//	&:hover {
	//		border-color: #1968e5;
	//		background-color: #f8f9fa;
	//	}
	//
	//	&--detected {
	//		cursor: pointer;
	//	}
	//
	//	&--connected {
	//		border-color: #1f9649;
	//		background-color: #e6f7e6;
	//	}
	//
	//	&:not(&--detected) {
	//		opacity: 0.6;
	//	}
	//
	//	&__icon {
	//		font-size: 32px;
	//		flex-shrink: 0;
	//	}
	//
	//	&__content {
	//		flex-grow: 1;
	//		display: flex;
	//		flex-direction: column;
	//		gap: 4px;
	//	}
	//
	//	&__name {
	//		font-size: 16px;
	//		font-weight: 500;
	//		color: $main-color;
	//	}
	//
	//	&__status {
	//		font-size: 12px;
	//		color: $main-text-grey-color;
	//	}
	//
	//	&__loader {
	//		.spinner {
	//			width: 20px;
	//			height: 20px;
	//			border: 2px solid #e0e0e0;
	//			border-top-color: #1968e5;
	//			border-radius: 50%;
	//			animation: spin 0.8s linear infinite;
	//		}
	//	}
	//}

	//@keyframes spin {
	//	to {
	//		transform: rotate(360deg);
	//	}
	//}
</style>
