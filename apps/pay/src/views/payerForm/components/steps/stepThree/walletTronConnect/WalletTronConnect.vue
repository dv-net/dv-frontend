<script setup lang="ts">
	import { ref, computed, onMounted } from "vue";
	import { useI18n } from "vue-i18n";
	import type { IProps } from "@pay/views/payerForm/components/steps/stepThree/walletTronConnect/IProps.ts";
	import { truncateHash } from "@shared/utils/helpers/general.ts";
	
	const { recipientAddress, amount, currency, isUsdtToken } = defineProps<IProps>();

	const emit = defineEmits<{
		connected: [address: string];
		transactionSent: [hash: string];
	}>();

	const isLoading = ref<string | null>(null);
	const errorMessage = ref<string | null>(null);
	const connectedAddress = ref<string | null>(null);
	const walletBalance = ref<string | null>(null);
	const connectedWalletType = ref<string | null>(null);

	// Определяем доступные кошельки и их состояние
	const availableWallets = computed(() => {
		const wallets = [];
		
		// TronLink для TRON
		const isTronLinkInstalled = window.tronWeb || (window as any).tronLink;
		const isTronLinkInitialized = window.tronWeb && window.tronWeb.ready && window.tronWeb.defaultAddress;
		
		wallets.push({
			id: "tronlink",
			name: "TronLink",
			icon: "🦄",
			detected: isTronLinkInstalled,
			initialized: isTronLinkInitialized,
			link: "https://www.tronlink.org/"
		});

		// OKX Wallet для TRON
		const isOkxInstalled = !!(window as any).okxwallet?.tronLink || !!(window as any).okxwallet?.tron;
		
		// Проверяем инициализацию OKX
		let isOkxInitialized = false;
		if (isOkxInstalled) {
			let okxTron = (window as any).okxwallet.tronLink;
			if (!okxTron && (window as any).okxwallet.tron) {
				okxTron = (window as any).okxwallet.tron;
			}
			if (!okxTron && (window as any).okxwallet.tronWeb) {
				okxTron = { tronWeb: (window as any).okxwallet.tronWeb };
			}
			
			if (okxTron) {
				let tronWeb = okxTron.tronWeb;
				if (!tronWeb && (window as any).tronWeb) {
					tronWeb = (window as any).tronWeb;
				}
				isOkxInitialized = !!(tronWeb && tronWeb.ready && tronWeb.defaultAddress?.base58);
			}
		}
		
		wallets.push({
			id: "okx",
			name: "OKX Wallet",
			icon: "🔷",
			detected: isOkxInstalled,
			initialized: isOkxInitialized,
			link: "https://www.okx.com/web3"
		});

		return wallets;
	});

	const connectTronLink = async () => {
		try {
			isLoading.value = "tronlink";
			errorMessage.value = null;

			console.log("🔍 Проверка TronLink:", { tronWeb: !!window.tronWeb, tronLink: !!(window as any).tronLink });

			// Проверяем наличие TronLink расширения
			if (!window.tronWeb && !(window as any).tronLink) {
				throw new Error("TronLink не установлен. Установите расширение TronLink");
			}

			// Если tronLink есть, но tronWeb еще нет - ждем его появления
			if ((window as any).tronLink && !window.tronWeb) {
				console.log("⏳ Ожидание инициализации TronLink...");
				let attempts = 0;
				const maxAttempts = 100; // Увеличиваем время ожидания до 10 секунд
				while (!window.tronWeb && attempts < maxAttempts) {
					await new Promise((resolve) => setTimeout(resolve, 100));
					attempts++;
				}
			}

			// Запрашиваем подключение если TronLink доступен
			if ((window as any).tronLink) {
				console.log("📡 Запрос подключения к TronLink...");
				try {
					await (window as any).tronLink.request({ method: "tron_requestAccounts" });
					console.log("✅ Запрос подтвержден пользователем");
				} catch (error) {
					console.error("❌ Пользователь отклонил запрос:", error);
					throw new Error("Вы отменили подключение TronLink");
				}
			}

			// Ждем пока tronWeb инициализируется
			console.log("⏳ Ожидание инициализации TronWeb...");
			let attempts = 0;
			const maxAttempts = 150; // 15 секунд
			
			while (attempts < maxAttempts) {
				if (window.tronWeb) {
					console.log("✅ TronWeb найден, проверка готовности...", { ready: window.tronWeb.ready });
					if (window.tronWeb.ready) {
						console.log("✅ TronWeb готов");
						break;
					}
					// Если tronWeb есть, но не ready - пробуем продолжить
					if (window.tronWeb.defaultAddress?.base58) {
						console.log("⚠️ TronWeb не ready, но адрес доступен. Продолжаем...");
						break;
					}
				}
				await new Promise((resolve) => setTimeout(resolve, 100));
				attempts++;
			}

			if (!window.tronWeb) {
				throw new Error("TronWeb не найден. Проверьте, что расширение TronLink установлено и активно");
			}

			if (!window.tronWeb.ready && !window.tronWeb.defaultAddress?.base58) {
				console.error("❌ TronWeb состояние:", { 
					ready: window.tronWeb.ready, 
					hasTronWeb: !!window.tronWeb,
					hasDefaultAddress: !!window.tronWeb.defaultAddress 
				});
				throw new Error("TronWeb не готов и адрес недоступен. Обновите страницу и попробуйте снова");
			}

			console.log("🔍 Проверка адреса...", window.tronWeb.defaultAddress);
			const address = window.tronWeb.defaultAddress?.base58;
			if (!address) {
				throw new Error("Не удалось получить адрес из TronLink. Убедитесь, что вы вошли в TronLink и обновите страницу");
			}

			connectedAddress.value = address;
			connectedWalletType.value = "tronlink";
			emit("connected", address);
			console.log("✅ TronLink подключен:", address);

			// Получаем баланс кошелька
			try {
				const balanceSun = await window.tronWeb.trx.getBalance(address);
				const balanceTRX = balanceSun / 1_000_000;
				walletBalance.value = balanceTRX.toFixed(6);
				console.log("💰 Баланс кошелька:", walletBalance.value, "TRX");
			} catch (error) {
				console.error("Ошибка получения баланса:", error);
			}

		} catch (error: any) {
			errorMessage.value = error.message || "Ошибка подключения TronLink";
			console.error("❌ TronLink error:", error);
		} finally {
			isLoading.value = null;
		}
	};

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

	// Подключение OKX Wallet для TRON
	const connectOKX = async () => {
		try {
			isLoading.value = "okx";
			errorMessage.value = null;

			// Проверяем наличие OKX Wallet
			if (!(window as any).okxwallet) {
				throw new Error("OKX Wallet не установлен");
			}

			console.log("🔍 OKX Wallet найден, проверяем структуру:", (window as any).okxwallet);
			
			// OKX Wallet может использовать разные структуры API
			let okxTron = (window as any).okxwallet.tronLink;
			
			// Проверяем альтернативные структуры
			if (!okxTron && (window as any).okxwallet.tron) {
				okxTron = (window as any).okxwallet.tron;
			}
			
			if (!okxTron && (window as any).okxwallet.tronWeb) {
				okxTron = { tronWeb: (window as any).okxwallet.tronWeb };
			}

			if (!okxTron) {
				const availableKeys = Object.keys((window as any).okxwallet);
				throw new Error(`OKX Wallet API не найден. Доступные ключи: ${availableKeys.join(", ")}`);
			}

			console.log("📦 OKX Tron структура:", okxTron);
			
			// Получаем tronWeb - может быть в разных местах
			let tronWeb = okxTron.tronWeb;
			
			// Проверяем, подключен ли OKX уже
			const alreadyConnected = tronWeb && tronWeb.ready && tronWeb.defaultAddress?.base58;
			
			if (!alreadyConnected) {
				// Запрашиваем подключение через request если доступен
				if (okxTron.request) {
					try {
						console.log("📡 Запрос подключения OKX...");
						const accounts = await okxTron.request({ method: "tron_requestAccounts" });
						console.log("✅ OKX accounts:", accounts);
					} catch (error) {
						console.warn("⚠️ OKX request не работает:", error);
					}
				}
			} else {
				console.log("✅ OKX уже подключен, используем существующее подключение");
			}
			
			if (!tronWeb && (window as any).tronWeb) {
				tronWeb = (window as any).tronWeb;
			}
			
			// Ждем инициализацию если нужно
			if (tronWeb && !tronWeb.ready) {
				let attempts = 0;
				const maxAttempts = 30;
				while (!tronWeb.ready && attempts < maxAttempts) {
					await new Promise((resolve) => setTimeout(resolve, 100));
					attempts++;
				}
			}

			if (!tronWeb) {
				throw new Error("TronWeb не найден в OKX Wallet");
			}

			// Получаем адрес
			let address;
			if (tronWeb.defaultAddress && tronWeb.defaultAddress.base58) {
				address = tronWeb.defaultAddress.base58;
			} else if (tronWeb.defaultAddress) {
				address = tronWeb.defaultAddress;
			} else if (tronWeb.address) {
				address = tronWeb.address;
			}

			if (!address) {
				throw new Error("Не удалось получить адрес из OKX Wallet");
			}

			connectedAddress.value = address;
			connectedWalletType.value = "okx";
			emit("connected", address);
			console.log("✅ OKX Wallet подключен:", address);

			// Сохраняем ссылку на tronWeb от OKX для последующих операций
			// @ts-ignore
			window.tronWeb = tronWeb;

			// Получаем баланс кошелька
			try {
				const balanceSun = await tronWeb.trx.getBalance(address);
				const balanceTRX = balanceSun / 1_000_000;
				walletBalance.value = balanceTRX.toFixed(6);
				console.log("💰 Баланс кошелька:", walletBalance.value, "TRX");
			} catch (error) {
				console.error("Ошибка получения баланса:", error);
			}

		} catch (error: any) {
			errorMessage.value = error.message || "Ошибка подключения OKX Wallet";
			console.error("❌ OKX Wallet error:", error);
		} finally {
			isLoading.value = null;
		}
	};

	const handleConnect = async (walletId: string) => {
		// Если этот же кошелек уже подключен - не делаем ничего
		if (connectedWalletType.value === walletId && connectedAddress.value) {
			console.log("✅ Кошелек уже подключен:", walletId);
			return;
		}
		
		// Сбрасываем состояние предыдущего подключения только при переключении
		connectedAddress.value = null;
		connectedWalletType.value = null;
		walletBalance.value = null;
		errorMessage.value = null;
		
		console.log("🔄 Подключение к кошельку:", walletId);
		
		switch (walletId) {
			case "tronlink":
				await connectTronLink();
				break;
			case "okx":
				await connectOKX();
				break;
			// TODO: Добавить обработку других кошельков
			// case "metamask":
			// case "walletconnect":
		}
	};

	const handleInstall = (link?: string) => {
		if (link) window.open(link, "_blank");
	};
</script>

	<template>
	<div class="wallet-connect">
		<div v-if="errorMessage" class="wallet-connect__error">
			{{ errorMessage }}
		</div>

		<div v-if="connectedAddress" class="wallet-connect__success">
			<div class="wallet-connect__success-info">
				<span>✅ {{ $t("Wallet connected") }}: {{ truncateHash(connectedAddress) }}</span>
				<span v-if="walletBalance" class="wallet-connect__balance">
					💰 {{ $t("Balance") }}: {{ walletBalance }} TRX
				</span>
			</div>
			<button 
				class="wallet-connect__pay-btn"
				@click="sendTronTransaction"
				:disabled="isLoading === 'sending'"
			>
				<span v-if="isLoading === 'sending'">⏳</span>
				{{ isLoading === 'sending' ? $t("Sending transaction...") : $t("Send payment") }}
			</button>
		</div>

		<div v-if="isLoading === 'sending'" class="wallet-connect__sending">
			<div class="spinner" />
			<span>{{ $t("Sending transaction...") }}</span>
		</div>

		<div class="wallet-connect__list">
			<div
				v-for="wallet in availableWallets"
				:key="wallet.id"
				class="wallet-item"
				:class="{ 
					'wallet-item--detected': wallet.detected,
					'wallet-item--connected': connectedAddress && connectedWalletType === wallet.id
				}"
				@click="wallet.detected ? handleConnect(wallet.id) : handleInstall(wallet.link)"
			>
				<div class="wallet-item__icon">{{ wallet.icon }}</div>
				<div class="wallet-item__content">
					<span class="wallet-item__name">{{ wallet.name }}</span>
					<span class="wallet-item__status">
						<span v-if="connectedAddress && connectedWalletType === wallet.id">✅ {{ $t("Connected") }}</span>
						<span v-else-if="wallet.initialized">🟢 {{ $t("Ready") }}</span>
						<span v-else-if="wallet.detected">🟡 {{ $t("Installed") }}</span>
						<span v-else>⚪ {{ $t("Not installed") }}</span>
					</span>
				</div>
				<div v-if="isLoading === wallet.id || isLoading === 'sending'" class="wallet-item__loader">
					<div class="spinner" />
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.wallet-connect {
		display: flex;
		flex-direction: column;
		gap: 20px;

		&__error {
			padding: 12px 16px;
			background-color: #fee;
			color: #c33;
			border-radius: 8px;
			font-size: 14px;
		}

		&__success {
			padding: 12px 16px;
			background-color: #e6f7e6;
			color: #1f9649;
			border-radius: 8px;
			font-size: 14px;
			font-weight: 500;

			&-info {
				display: flex;
				flex-direction: column;
				gap: 6px;
			}
		}

		&__balance {
			font-size: 13px;
			opacity: 0.9;
		}

		&__pay-btn {
			margin-top: 12px;
			padding: 12px 24px;
			background-color: #1f9649;
			color: white;
			border: none;
			border-radius: 8px;
			font-size: 16px;
			font-weight: 500;
			cursor: pointer;
			transition: all 0.2s ease;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			width: 100%;

			&:hover:not(:disabled) {
				background-color: #187d3f;
				transform: translateY(-1px);
			}

			&:disabled {
				opacity: 0.6;
				cursor: not-allowed;
			}
		}

		&__sending {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 12px;
			padding: 16px;
			background-color: #fff3e0;
			color: #f57c00;
			border-radius: 8px;
			font-size: 14px;
			font-weight: 500;
			
			.spinner {
				width: 20px;
				height: 20px;
				border: 2px solid #e0e0e0;
				border-top-color: #f57c00;
				border-radius: 50%;
				animation: spin 0.8s linear infinite;
			}
		}

		&__description {
			color: $main-text-grey-color;
			font-size: 14px;
			margin: -8px 0 12px 0;
		}

		&__list {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
	}

	.wallet-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border: 1px solid $main-border-color;
		border-radius: 8px;
		background-color: $form-background;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;

		&:hover {
			border-color: #1968e5;
			background-color: #f8f9fa;
		}

		&--detected {
			cursor: pointer;
		}

		&--connected {
			border-color: #1f9649;
			background-color: #e6f7e6;
		}

		&:not(&--detected) {
			opacity: 0.6;
		}

		&__icon {
			font-size: 32px;
			flex-shrink: 0;
		}

		&__content {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		&__name {
			font-size: 16px;
			font-weight: 500;
			color: $main-color;
		}

		&__status {
			font-size: 12px;
			color: $main-text-grey-color;
		}

		&__loader {
			.spinner {
				width: 20px;
				height: 20px;
				border: 2px solid #e0e0e0;
				border-top-color: #1968e5;
				border-radius: 50%;
				animation: spin 0.8s linear infinite;
			}
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
