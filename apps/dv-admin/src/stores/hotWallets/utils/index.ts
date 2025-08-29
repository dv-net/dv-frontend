import type { IHotWalletsRequest } from "@dv-admin/utils/types/api/apiGo";

export const walletsFilterStartData: IHotWalletsRequest = {
	balance_fiat_from: null,
	balance_fiat_to: null,
	currency_id: null,
	page: 1,
	page_size: 50,
	amount: null,
	store_ids: [],
	is_sort_by_balance: true,
	address: null
};
