export interface ITronExtensionWallet {
	id: string;
	name: string;
	icon: string;
	detected: boolean;
	initialized: boolean;
	isLoading: boolean;
	address?: string
}

export interface IProps {
	recipientAddress: string | null;
	amount: string | null;
	token: string | null;
}