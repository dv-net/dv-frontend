import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import {
	deleteApiWithdrawalWalletAddresses,
	getApiExchangeDepositAddresses,
	getApiWithdrawalCurrencyRules,
	getApiWithdrawalRules,
	patchApiWithdrawalWalletAddresses,
	postApiSetExchange
} from "@dv-admin/utils/services/withdrawal";
import type {
	IBatchDeleteWithdrawalAddressRequest,
	IDepositAddressesResponse,
	IExchangeList,
	IWithdrawalAddressItemRequest,
	IWithdrawalAddressItemResponse,
	IWithdrawalAddressRequest,
	IWithdrawalRulesResponse
} from "@dv-admin/utils/types/api/apiGo";
import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
import { getApiExchangeConnectionChecks, getApiExchangeDepositUpdate } from "@dv-admin/utils/services/exchangeSettings";
import { useNotifications } from "@shared/utils/composables/useNotifications";
import { useI18n } from "vue-i18n";

const { notify } = useNotifications();

export const MAX_BATCH_DELETE_ADDRESSES = 100;

interface IPendingDeleteWalletGroup {
	walletId: string;
	currencyId?: string;
	addresses: IWithdrawalAddressItemResponse[];
	manualAddress: string | null;
}

export const useWithdrawalStore = defineStore("withdrawal", () => {
	const { t } = useI18n();
	const { exchangeList } = storeToRefs(useExchangeSettingsStore());
	const { getExchangeList } = useExchangeSettingsStore();
	const isLoading = ref<boolean>(false);
	const isShowBannerInfo = ref<boolean>(false);
	const isLoadingConnectedExchanges = ref<boolean>(false);
	const isLoadingSetExchange = ref<boolean>(false);
	const isLoadingEditAddresses = ref<boolean>(false);
	const isLoadingDeleteAddresses = ref<boolean>(false);
	const isLoadingUpdateDepositAddresses = ref<boolean>(false);
	const isShowBannerSuccessToggleExchange = ref<boolean>(false);
	const withdrawalRules = ref<IWithdrawalRulesResponse[]>([]);
	const withdrawalCurrencyRules = ref({} as IWithdrawalRulesResponse);
	const isDataReceivedAddresses = ref<boolean>(false);
	const withdrawalCurrentCurrencyRulesAddressesHistory = ref<IWithdrawalAddressItemResponse[]>([]);
	const addressesTotp = ref<string>("");
	const currentAddressTab = ref<string>("1");
	const isShowAuthentication = ref<boolean>(false);
	const isShowDeleteAuthentication = ref<boolean>(false);
	const pendingDeleteGroups = ref<IPendingDeleteWalletGroup[]>([]);
	const pendingDeleteReloadList = ref<boolean>(false);
	const arrayErrorsAddresses = ref<string[]>([]);
	const connectedExchanges = ref<IExchangeList[]>([]);
	const depositAddresses = ref<IDepositAddressesResponse[]>([]);

	const pendingDeleteAddresses = computed<IWithdrawalAddressItemResponse[]>(() =>
		pendingDeleteGroups.value.flatMap((group) => group.addresses)
	);
	const hasPendingDeleteManualAddressWarning = computed<boolean>(() =>
		pendingDeleteGroups.value.some((group) => {
			if (!group.manualAddress) return false;
			return group.addresses.some((item) => item.address === group.manualAddress);
		})
	);
	const hasAnyWithdrawalAddresses = computed<boolean>(() =>
		withdrawalRules.value.some((item) => Boolean(item.addressees?.length))
	);

	const getWithdrawalRules = async () => {
		try {
			isLoading.value = true;
			const data = await getApiWithdrawalRules();
			if (data) {
				withdrawalRules.value = data.map((item) => {
					return {
						...item,
						ruleSelect: item.interval === "every-one-min" && Number(item.native_balance) > 0 ? "balance" : item.interval
					};
				});
			}
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const getWithdrawalCurrencyRules = async (currencyId: string) => {
		try {
			isDataReceivedAddresses.value = false;
			isLoading.value = true;
			const data = await getApiWithdrawalCurrencyRules(currencyId);
			if (data) {
				const addressees = data.addressees.map((item) => ({
					...item,
					for_flagged: Boolean(item.for_flagged)
				}));
				withdrawalCurrencyRules.value = { ...data, addressees };
				withdrawalCurrentCurrencyRulesAddressesHistory.value = structuredClone(addressees);
			}
			isDataReceivedAddresses.value = true;
		} catch (error: any) {
			throw error;
		} finally {
			isLoading.value = false;
		}
	};
	const patchWithdrawalWalletAddresses = async () => {
		try {
			isLoadingEditAddresses.value = true;
			arrayErrorsAddresses.value = [];
			let arrayAddresses: IWithdrawalAddressItemRequest[] = [];
			if (withdrawalCurrencyRules.value?.addressees?.length) {
				arrayAddresses = withdrawalCurrencyRules.value.addressees
					.map(({ address, name, for_flagged }) => ({
						address,
						name: name || null,
						for_flagged: Boolean(for_flagged)
					}))
					.filter((item) => item.address);
			}
			const body: IWithdrawalAddressRequest = { addresses: arrayAddresses, totp: addressesTotp.value };
			await patchApiWithdrawalWalletAddresses(withdrawalCurrencyRules.value.id, body);
			notify(t("Wallets saved"), "success");
			await getWithdrawalCurrencyRules(withdrawalCurrencyRules.value.currency.id);
			resetAddressAuthentication();
			isShowBannerInfo.value = false;
		} catch (error: any) {
			// If address validation failed on backend, close 2FA form and highlight input
			if (error?.response?.data?.errors?.length) {
				const errorAddresses = error.response.data.errors.map((item: any) => item.field).filter(Boolean);
				if (!errorAddresses.length) return;
				arrayErrorsAddresses.value = withdrawalCurrencyRules.value.addressees
					.map((item) => (errorAddresses.includes(item.address) ? item.id : ""))
					.filter(Boolean);
				if (arrayErrorsAddresses.value.length) {
					currentAddressTab.value = "1";
					resetAddressAuthentication();
				}
			}
			throw error;
		} finally {
			isLoadingEditAddresses.value = false;
		}
	};
	const getExchangeDepositAddresses = async () => {
		try {
			const data = await getApiExchangeDepositAddresses();
			if (data) depositAddresses.value = data;
		} catch (error: any) {
			throw error;
		}
	};
	const updateDepositAddresses = async (slug: string) => {
		try {
			isLoadingUpdateDepositAddresses.value = true;
			if (!slug) return;
			await getApiExchangeDepositUpdate(slug);
			await getExchangeDepositAddresses();
			notify(t("Addresses updated"), "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingUpdateDepositAddresses.value = false;
		}
	};

	// Skip each exchange that has credentials to show connected exchanges
	const getConnectedExchanges = async () => {
		try {
			isLoadingConnectedExchanges.value = true;
			await getExchangeList();
			if (!exchangeList.value?.exchanges?.length) return (connectedExchanges.value = []);
			const filtered = exchangeList.value.exchanges.filter((item) => item?.keys.every((key) => !!key.value));
			connectedExchanges.value = [];
			const resultConnectedExchanges: IExchangeList[] = [];

			await Promise.all(
				filtered.map(async (item) => {
					try {
						await getApiExchangeConnectionChecks(item.slug, true);
						resultConnectedExchanges.push(item);
					} catch (error) {
						console.error(error);
					}
				})
			);

			try {
				if (connectedExchanges.value.length) {
					await getExchangeDepositAddresses();
				}
			} catch (error) {
				console.error(error);
			}

			connectedExchanges.value = resultConnectedExchanges;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingConnectedExchanges.value = false;
		}
	};
	const postSetExchange = async (slug: string) => {
		try {
			isLoadingSetExchange.value = true;
			await postApiSetExchange(slug);
			await getConnectedExchanges();
			notify(t("Active crypto exchange changed"), "success");
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingSetExchange.value = false;
		}
	};

	const resetAddressAuthentication = () => {
		addressesTotp.value = "";
		isShowAuthentication.value = false;
	};

	const resetDeleteAddressAuthentication = () => {
		isShowDeleteAuthentication.value = false;
		pendingDeleteGroups.value = [];
		pendingDeleteReloadList.value = false;
	};

	const openDeleteAuthentication = (groups: IPendingDeleteWalletGroup[], reloadList = false) => {
		const normalizedGroups = groups
			.map((group) => ({
				...group,
				addresses: group.addresses.filter((item) => Boolean(item.id && item.address))
			}))
			.filter((group) => group.walletId && group.addresses.length);

		if (!normalizedGroups.length) return;

		for (const group of normalizedGroups) {
			if (group.addresses.length > MAX_BATCH_DELETE_ADDRESSES) {
				notify(t("You can select up to {count} addresses", { count: MAX_BATCH_DELETE_ADDRESSES }));
				return;
			}
		}

		resetAddressAuthentication();
		pendingDeleteGroups.value = normalizedGroups;
		pendingDeleteReloadList.value = reloadList;
		isShowDeleteAuthentication.value = true;
	};

	const startDeleteWithdrawalAddresses = (params: {
		walletId: string;
		addresses: IWithdrawalAddressItemResponse[];
		manualAddress?: string | null;
		currencyId?: string;
		reloadList?: boolean;
	}) => {
		openDeleteAuthentication(
			[
				{
					walletId: params.walletId,
					currencyId: params.currencyId,
					addresses: params.addresses,
					manualAddress: params.manualAddress ?? null
				}
			],
			Boolean(params.reloadList)
		);
	};

	const startDeleteAllWithdrawalAddresses = () => {
		openDeleteAuthentication(
			withdrawalRules.value.map((rule) => ({
				walletId: rule.id,
				currencyId: rule.currency.id,
				addresses: rule.addressees ?? [],
				manualAddress: rule.low_balance_rules?.manual_address ?? null
			})),
			true
		);
	};

	const deleteWithdrawalWalletAddresses = async (totp: string) => {
		if (isLoadingDeleteAddresses.value || !pendingDeleteGroups.value.length || !totp) return;
		try {
			isLoadingDeleteAddresses.value = true;
			const groups = pendingDeleteGroups.value;
			const reloadList = pendingDeleteReloadList.value;
			for (const group of groups) {
				const body: IBatchDeleteWithdrawalAddressRequest = {
					address_ids: group.addresses.map((item) => item.id),
					totp
				};
				await deleteApiWithdrawalWalletAddresses(group.walletId, body);
			}
			if (reloadList) {
				await getWithdrawalRules();
			} else {
				const currencyId = groups[0]?.currencyId;
				if (currencyId) await getWithdrawalCurrencyRules(currencyId);
			}
			notify(t("Addresses deleted"), "success");
			resetDeleteAddressAuthentication();
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingDeleteAddresses.value = false;
		}
	};

	return {
		isLoading,
		isDataReceivedAddresses,
		isLoadingConnectedExchanges,
		isLoadingSetExchange,
		connectedExchanges,
		currentAddressTab,
		isLoadingEditAddresses,
		isLoadingDeleteAddresses,
		isShowAuthentication,
		isShowDeleteAuthentication,
		pendingDeleteAddresses,
		hasPendingDeleteManualAddressWarning,
		hasAnyWithdrawalAddresses,
		withdrawalRules,
		withdrawalCurrencyRules,
		isShowBannerInfo,
		addressesTotp,
		isShowBannerSuccessToggleExchange,
		arrayErrorsAddresses,
		depositAddresses,
		isLoadingUpdateDepositAddresses,
		withdrawalCurrentCurrencyRulesAddressesHistory,
		getWithdrawalRules,
		getWithdrawalCurrencyRules,
		patchWithdrawalWalletAddresses,
		startDeleteWithdrawalAddresses,
		startDeleteAllWithdrawalAddresses,
		deleteWithdrawalWalletAddresses,
		resetAddressAuthentication,
		resetDeleteAddressAuthentication,
		getConnectedExchanges,
		postSetExchange,
		getExchangeDepositAddresses,
		updateDepositAddresses
	};
});
