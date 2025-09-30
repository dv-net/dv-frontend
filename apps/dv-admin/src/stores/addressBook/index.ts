import { defineStore, storeToRefs } from "pinia";
import { deleteApiWithdrawalAddressBook, getApiWithdrawalAddressBook } from "@dv-admin/services/api/addressBook.ts";
import { ref } from "vue";
import { ADDRESS_BOOK_TYPES } from "@dv-admin/utils/constants/addressBook";
import type { IAddressBookCurrencies, IAddressBookList, IMapAddressBookRow } from "@dv-admin/utils/types/schemas";
import { useGeneralStore } from "@dv-admin/stores/general";
import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
import { useI18n } from "vue-i18n";
import type { IDeleteAddressBookRequest } from "@dv-admin/utils/types/api/apiGo.ts";

const { notify } = useNotifications();

export const useAddressBookStore = defineStore("addressBook", () => {
	const { t } = useI18n();
	const { otpGlobalCode } = storeToRefs(useGeneralStore());
	const { openOtpGlobalModal } = useGeneralStore();

	const isLoading = ref<boolean>(false);
	const isShowDropdownDeleteAddress = ref<Record<string, boolean>>({});
	const addressBookList = ref<IAddressBookList[]>([]);

	const getWithdrawalAddressBook = async () => {
		try {
			isLoading.value = true;
			const data = await getApiWithdrawalAddressBook();
			if (!data) return;
			addressBookList.value = [
				...(data.addresses || []).map((item) => ({
					type: ADDRESS_BOOK_TYPES.REGULAR,
					id: item.id,
					address: item.address,
					blockchain: item.blockchain,
					currency_id: item.currency_id,
					name: item.name,
					tag: item.tag,
					withdrawal_rule_exists: item.withdrawal_rule_exists,
					submitted_at: item.submitted_at
				})),
				...(data.universal_groups || []).map((item) => ({
					type: ADDRESS_BOOK_TYPES.UNIVERSAL,
					address: item.address,
					blockchain: item.blockchain,
					currencies: item.currencies,
					name: item.name,
					tag: item.tag,
					is_universal: item.is_universal,
					submitted_at: item.submitted_at,
					currency_count: item.currency_count
				})),
				...(data.evm_groups || []).map((item) => ({
					type: ADDRESS_BOOK_TYPES.EVM,
					address: item.address,
					blockchains: item.blockchains,
					currencies: item.currencies,
					currency_count: item.currency_count,
					submitted_at: item.submitted_at,
					is_evm: item.is_evm,
					tag: item.tag,
					name: item.name
				}))
			];
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const deleteWithdrawalAddressBook = async (row: IAddressBookList, deleteWithdrawalRule: boolean) => {
		try {
			isShowDropdownDeleteAddress.value[`${row.type}${row.address}`] = false;
			if (!otpGlobalCode.value) {
				openOtpGlobalModal(() => deleteWithdrawalAddressBook(row, deleteWithdrawalRule));
				return;
			}
			const body: IDeleteAddressBookRequest | null = (() => {
				switch (row.type) {
					case ADDRESS_BOOK_TYPES.REGULAR:
						return { id: row.id, totp: otpGlobalCode.value, delete_withdrawal_rule: deleteWithdrawalRule };
					case ADDRESS_BOOK_TYPES.UNIVERSAL:
						return {
							address: row.address,
							blockchain: row.blockchain,
							is_universal: true,
							totp: otpGlobalCode.value,
							delete_withdrawal_rule: deleteWithdrawalRule
						};
					case ADDRESS_BOOK_TYPES.EVM:
						return {
							address: row.address,
							is_evm: true,
							totp: otpGlobalCode.value,
							delete_withdrawal_rule: deleteWithdrawalRule
						};
					default:
						return null;
				}
			})();
			if (!body) return;
			await deleteApiWithdrawalAddressBook(body);
			await getWithdrawalAddressBook()
			notify(t("Address removed"), "success");
		} catch (error: any) {
			throw error;
		}
	};

	const mapAddressBookRow = (row: IAddressBookList): IMapAddressBookRow => {
		const currencies: IAddressBookCurrencies[] = row.currencies || [];
		return {
			withdrawalCurrencies: currencies.filter((c) => c.withdrawal_rule_exists),
			hasAnyWithdrawalRule: currencies.some((c) => c.withdrawal_rule_exists),
			hasAllWithdrawalRules: currencies.every((c) => c.withdrawal_rule_exists)
		};
	};

	return {
		isLoading,
		addressBookList,
		isShowDropdownDeleteAddress,
		getWithdrawalAddressBook,
		deleteWithdrawalAddressBook,
		mapAddressBookRow
	};
});
