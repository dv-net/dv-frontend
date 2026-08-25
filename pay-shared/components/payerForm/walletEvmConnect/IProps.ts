import type { IPayerAddressResponse } from "@pay-shared/utils/types/payer";

export interface IProps {
	recipientAddress: string | null;
	amount: string | null;
	token: string | null;
	chain: string | null;
	addresses: IPayerAddressResponse[];
}
