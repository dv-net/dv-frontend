import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygon, arbitrum, mainnet, optimism, linea, bsc, type AppKitNetwork } from '@reown/appkit/networks'

export const evmArray: string[] = ["Arbitrum", "Ethereum", "Polygon", "BNBSmartChain", "BSC", "Bsc", "Optimism", "Linea"]

export const networksWalletConnect: [AppKitNetwork, ...AppKitNetwork[]] = [
	mainnet, polygon, arbitrum, optimism, linea, bsc
]

export const chainIdMap: Record<string, number> = {
	Ethereum: mainnet.id,
	Polygon: polygon.id,
	Arbitrum: arbitrum.id,
	Optimism: optimism.id,
	Linea: linea.id,
	BNBSmartChain: bsc.id,
	BSC: bsc.id
}

export const wagmiAdapter = new WagmiAdapter({
	networks: networksWalletConnect,
	projectId: import.meta.env.VITE_PROJECT_ID_CONNECT_WALLET
})

export const metadataWalletConnect = {
	name: 'DV.Net',
	description: 'DV.Net payment',
	url: 'https://dv.net',
	icons: ["https://dv.net/favicon.svg"]
}