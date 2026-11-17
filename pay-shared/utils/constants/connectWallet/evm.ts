import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit/vue";
import { polygon, arbitrum, mainnet, bsc, type AppKitNetwork } from "@reown/appkit/networks";

export const evmArray: string[] = ["Arbitrum", "Ethereum", "Polygon", "BNBSmartChain", "BSC", "Bsc"];

export const networksWalletConnect: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, polygon, arbitrum, bsc];

export const chainIdMap: Record<string, number> = {
	Ethereum: mainnet.id,
	Polygon: polygon.id,
	Arbitrum: arbitrum.id,
	BNBSmartChain: bsc.id,
	BSC: bsc.id,
	Bsc: bsc.id
};

export const wagmiAdapter = new WagmiAdapter({
	networks: networksWalletConnect,
	projectId: import.meta.env.VITE_PROJECT_ID_CONNECT_WALLET
});

export const metadataWalletConnect = {
	name: "DV.Net",
	description: "DV.Net payment",
	url: "https://dv.net",
	icons: ["https://dv.net/favicon.svg"]
};

let appKitModal: ReturnType<typeof createAppKit> | null = null;

export const getAppKitModal = () => {
	if (!appKitModal) {
		appKitModal = createAppKit({
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
	}
	return appKitModal;
};
