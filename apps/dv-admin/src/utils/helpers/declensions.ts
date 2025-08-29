export const getDeclensionWallets = (number: number): string => {
	const forms: string[] = ["wallets.many2", "wallets.many3", "wallet"];
	const n = Math.abs(number) % 100;
	const n1 = n % 10;
	if (n > 10 && n < 20) return forms[0];
	if (n1 > 1 && n1 < 5) return forms[1];
	if (n1 === 1) return forms[2];
	return forms[0];
};

export const getDeclensionTransfers = (number: number): string => {
	const forms: string[] = ["transfers.many2", "transfers.many3", "transfers.one"];
	const n = Math.abs(number) % 100;
	const n1 = n % 10;
	if (n > 10 && n < 20) return forms[0];
	if (n1 > 1 && n1 < 5) return forms[1];
	if (n1 === 1) return forms[2];
	return forms[0];
};
