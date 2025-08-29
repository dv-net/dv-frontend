import { defineStore } from "pinia";
import { ref } from "vue";
import { getApiSearchData } from "@dv-admin/services/api/search";
import type { IOneTransactionResponse, IWalletInfoResponse } from "@dv-admin/utils/types/api/apiGo";
import { type ENUM_SEARCH_TYPES, SEARCH_TYPES } from "@dv-admin/utils/constants/search";
import { useRouter } from "vue-router";

export const useSearchStore = defineStore("search", () => {
	const router = useRouter();

	const searchValue = ref<string>("");
	const searchType = ref<ENUM_SEARCH_TYPES | null>(null);
	const isLoading = ref<boolean>(false);
	const isShowBlockNotFound = ref<boolean>(false);
	const transaction = ref<IOneTransactionResponse | null>(null);
	const wallets = ref<IWalletInfoResponse[]>([]);
	const currentIndexWallet = ref<number>(0);

	const getSearchData = async (searchParams?: string) => {
		try {
			isLoading.value = true;
			resetSearchValues();
			const currentSearchValue: string = searchParams || searchValue.value;
			const resp = await getApiSearchData(currentSearchValue);
			if (resp) {
				searchType.value = resp.search_type;

				if (resp.search_type === SEARCH_TYPES.TX_HASH) {
					if (resp.data && !Array.isArray(resp.data)) {
						transaction.value = resp.data;
						await router.push({ params: { hash: currentSearchValue }, name: "search-transaction" });
					}
				} else {
					if (resp.data && Array.isArray(resp.data) && resp.data.length) {
						wallets.value = resp.data;
						if (wallets.value.length === 1) {
							currentIndexWallet.value = 0;
							await router.push({
								params: { hash: wallets.value[currentIndexWallet.value].address },
								name: "search-address"
							});
						} else {
							await router.push({ params: { searchParams: currentSearchValue }, name: "search-wallets" });
						}
					}
				}
			}
		} catch (error: any) {
			isShowBlockNotFound.value = true;
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const resetSearchValues = () => {
		currentIndexWallet.value = 0;
		wallets.value = [];
		searchType.value = null;
		transaction.value = null;
		isShowBlockNotFound.value = false;
	};

	return {
		isLoading,
		searchType,
		transaction,
		wallets,
		isShowBlockNotFound,
		searchValue,
		currentIndexWallet,
		getSearchData,
		resetSearchValues
	};
});
