import type { Component } from "vue";

export type LottieAnimationData = Record<string, unknown>;

type LottieAnimationLoader = () => Promise<{ default: LottieAnimationData }>;

/** Every animation is a separate chunk: kept out of the form bundle and prefetched in the background */
const LOTTIE_ANIMATION_LOADERS = {
	waitingConfirmation: () => import("@pay-shared/assets/animations/loaderWaitingConfirmation.json"),
	successfulPayment: () => import("@pay-shared/assets/animations/loaderSuccessfulPayment.json"),
	amlChecking: () => import("@pay-shared/assets/animations/loaderAmlChecking.json"),
	amlSuccess: () => import("@pay-shared/assets/animations/loaderAmlSuccess.json"),
	mainLoader: () => import("@pay-shared/assets/animations/mainLoader.json"),
	"pending.general": () => import("@pay-shared/assets/animations/loaderTransactionPending/general.json"),
	"pending.BTC.Bitcoin": () => import("@pay-shared/assets/animations/loaderTransactionPending/BTC.Bitcoin.json"),
	"pending.ETH.Ethereum": () => import("@pay-shared/assets/animations/loaderTransactionPending/ETH.Ethereum.json"),
	"pending.USDT.BNBSmartChain": () =>
		import("@pay-shared/assets/animations/loaderTransactionPending/USDT.BNBSmartChain.json"),
	"pending.USDT.Ethereum": () => import("@pay-shared/assets/animations/loaderTransactionPending/USDT.Ethereum.json"),
	"pending.USDT.Tron": () => import("@pay-shared/assets/animations/loaderTransactionPending/USDT.Tron.json")
} satisfies Record<string, LottieAnimationLoader>;

export type LottieAnimationName = keyof typeof LOTTIE_ANIMATION_LOADERS;

const loadedAnimations = new Map<LottieAnimationName, LottieAnimationData>();
const pendingAnimations = new Map<LottieAnimationName, Promise<LottieAnimationData>>();
let playerPromise: Promise<Component> | null = null;

export const getPendingAnimationName = (currencyChainId: string | null | undefined): LottieAnimationName => {
	const name = `pending.${currencyChainId}`;
	return name in LOTTIE_ANIMATION_LOADERS ? (name as LottieAnimationName) : "pending.general";
};

export const getLoadedLottieAnimation = (name: LottieAnimationName): LottieAnimationData | null =>
	loadedAnimations.get(name) ?? null;

export const loadLottieAnimation = (name: LottieAnimationName): Promise<LottieAnimationData> => {
	const loaded = loadedAnimations.get(name);
	if (loaded) return Promise.resolve(loaded);
	const pending = pendingAnimations.get(name);
	if (pending) return pending;
	const promise = LOTTIE_ANIMATION_LOADERS[name]()
		.then((module) => {
			loadedAnimations.set(name, module.default);
			return module.default;
		})
		.finally(() => pendingAnimations.delete(name));
	pendingAnimations.set(name, promise);
	return promise;
};

export const loadLottiePlayer = (): Promise<Component> => {
	playerPromise ??= import("lottie-web-vue")
		.then((module) => module.LottieAnimation)
		.catch((error) => {
			playerPromise = null;
			throw error;
		});
	return playerPromise;
};

const runWhenIdle = (callback: () => void) => {
	if ("requestIdleCallback" in window) window.requestIdleCallback(callback, { timeout: 2000 });
	else setTimeout(callback, 300);
};

/** Warms up the player and animations without competing with the critical form requests */
export const prefetchLottieAnimations = (names: LottieAnimationName[]) => {
	runWhenIdle(() => {
		void loadLottiePlayer().catch(() => undefined);
		names.forEach((name) => void loadLottieAnimation(name).catch(() => undefined));
	});
};
