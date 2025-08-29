export const SEARCH_TYPES = {
	TX_HASH: "txHash",
	EMAIL: "email",
	IP: "ip",
	ADDRESS: "address",
	STORE_EXTERNAL_ID: "store_external_id"
} as const;
export type ENUM_SEARCH_TYPES = (typeof SEARCH_TYPES)[keyof typeof SEARCH_TYPES];
