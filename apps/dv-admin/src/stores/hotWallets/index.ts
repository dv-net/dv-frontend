import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import {
	getApiWalletSummary,
	getApiWalletKeys,
	getApiWallets,
	getApiWalletSeeds,
	postApiWithdrawMultipleProcessing,
	postApiWithdrawMultipleManual,
	postApiWalletKeysHot
} from "@dv-admin/services/api/hotWallets";
import { useAuthStore } from "@dv-admin/stores/auth";
import type {
	IHotWalletsItem,
	IHotWalletsRequest,
	IWalletKeysHotRequest,
	IWalletKeysResponse,
	IWalletSeedsResponse,
	IWalletSummaryResponse,
	IWithdrawMultipleRequest
} from "@dv-admin/utils/types/api/apiGo";
import { useProjectsStore } from "@dv-admin/stores/projects";
import { walletsFilterStartData } from "@dv-admin/stores/hotWallets/utils";
import { getApiWalletBalancesHot } from "@dv-admin/services/api/dashboard";
import type { UItableMeta } from "@dv.net/ui-kit/dist/components/UiTable/types";
import { parsePagination } from "@dv-admin/utils/helpers/parsePagination";
import { downloadBlobFile } from "@dv-admin/utils/helpers/downloadBlobFile.ts";
import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
import { useGeneralStore } from "@dv-admin/stores/general";

export const useHotWalletsStore = defineStore("hotWallets", () => {
	const { notify } = useNotifications();
	const { verificationCode2Fa } = storeToRefs(useAuthStore());
	const { projects } = storeToRefs(useProjectsStore());
	const { otpGlobalCode } = storeToRefs(useGeneralStore());
	const { getProjects } = useProjectsStore();

	const isLoading = ref<boolean>(true);
	const isLoadingWalletSummary = ref<boolean>(false);
	const currentBlockchainHotWallets = ref<string>("all");
	const selectedBlockchainFromDashboard = ref<string>();
	const walletBalancesHot = ref<string>("");
	const isLoadingWalletBalancesHot = ref<boolean>(true)
	const isHideLowBalance = ref<boolean>(true);
	const balanceFiatFrom = ref<number | null>(null);
	const walletSeeds = ref<IWalletSeedsResponse>({});
	const walletKeys = ref<IWalletKeysResponse>({});
	const wallets = ref<IHotWalletsItem[]>([]);
	const allWallets = ref<number>(0);
	const isSelectedAllWallets = ref<boolean>(false);
	const walletsPagination = ref<UItableMeta | null>(null);
	const walletSummary = ref<IWalletSummaryResponse[]>([]);
	const walletsFilter = ref<IHotWalletsRequest>(structuredClone(walletsFilterStartData));
	const includedWallets = ref<string[]>([]);
	const excludedWallets = ref<string[]>([]);
	const displayedWallets = ref<number>(3);

	const getWallets = async (typeRequest?: "pagination") => {
		try {
			isLoading.value = true;
			if (!projects.value || !projects.value.length) await getProjects();
			if (!projects.value || !projects.value.length) return;
			// If switching by currencies, reset selected wallets
			if (!typeRequest) includedWallets.value = [];
			walletsFilter.value.store_ids = projects.value.map((item) => item.id);
			walletsFilter.value.page =
				typeRequest === "pagination" && walletsPagination.value?.page ? walletsPagination.value.page : 1;
			walletsFilter.value.balance_fiat_from = balanceFiatFrom.value
				? balanceFiatFrom.value
				: isHideLowBalance.value
					? 1
					: null;
			walletsFilter.value.currency_id =
				currentBlockchainHotWallets.value && currentBlockchainHotWallets.value !== "all"
					? currentBlockchainHotWallets.value
					: null;

			const data = await getApiWallets(walletsFilter.value);
			if (data.items) {
				wallets.value = data.items.map((item) => ({
					...item,
					isSelected: isSelectedAllWallets.value
						? !excludedWallets.value.includes(item.id)
						: includedWallets.value.includes(item.id)
				}));
				if (isSelectedAllWallets.value) includedWallets.value.push(...wallets.value.map((item) => item.id));
			}
			if (data.pagination) {
				walletsPagination.value = parsePagination(data.pagination);
				allWallets.value = data.pagination.total || 0;
			}
		} catch (error: any) {
			wallets.value = [];
			walletsPagination.value = null;
			throw error;
		} finally {
			isLoading.value = false;
		}
	};

	const getWalletSummary = async (minBalance?: number, isTakeIntoAccountMinBalance?: boolean) => {
		try {
			isLoadingWalletSummary.value = true;
			const data = await getApiWalletSummary(
				minBalance || (isTakeIntoAccountMinBalance && isHideLowBalance.value ? 1 : undefined)
			);
			if (data) walletSummary.value = data;
			displayedWallets.value =
				walletSummary.value.slice(0, 3).some((item) => item.currency.id === currentBlockchainHotWallets.value) ||
				currentBlockchainHotWallets.value === "all"
					? 3
					: 4;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingWalletSummary.value = false;
		}
	};

	const getWalletBalancesHot = async () => {
		try {
			const data = await getApiWalletBalancesHot();
			if (data) walletBalancesHot.value = data;
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingWalletBalancesHot.value = false
		}
	};

	const setWalletHotBalancePolling = async () => {
		try {
			await getWalletBalancesHot();
			setTimeout(setWalletHotBalancePolling, 10_000);
		} catch (error: any) {
			console.error(error);
		}
	};

	const postWithdrawMultipleManualOrProcessing = async (
		type: "rules" | "processing",
		currency_id: string,
		withdrawal_wallet_id?: string
	) => {
		try {
			const params: IWithdrawMultipleRequest = { currency_id };
			if (type === "rules" && withdrawal_wallet_id) params.withdrawal_wallet_id = withdrawal_wallet_id;

			if (isSelectedAllWallets.value) params.exclude_wallet_addresses_ids = excludedWallets.value;
			else params.wallet_address_id = includedWallets.value;

			if (type === "processing") await postApiWithdrawMultipleProcessing(params);
			if (type === "rules" && withdrawal_wallet_id) await postApiWithdrawMultipleManual(params);
		} catch (error: any) {
			throw error;
		}
	};

	const getWalletKeys = async () => {
		try {
			const data = await getApiWalletKeys(verificationCode2Fa.value);
			if (data) walletKeys.value = data;
			verificationCode2Fa.value = "";
		} catch (error: any) {
			throw error;
		}
	};

	const getWalletSeeds = async () => {
		try {
			const data = await getApiWalletSeeds(verificationCode2Fa.value);
			if (data) walletSeeds.value = data;
			verificationCode2Fa.value = "";
		} catch (error: any) {
			throw error;
		}
	};

	const resetDataHotWallets = () => {
		isHideLowBalance.value = true;
		includedWallets.value = [];
		walletsFilter.value = structuredClone(walletsFilterStartData);
		currentBlockchainHotWallets.value = "all";
		walletSummary.value = [];
		isSelectedAllWallets.value = false;
	};

	const handleSelectWallet = ({ id }: IHotWalletsItem) => {
		if (isSelectedAllWallets.value) {
			if (excludedWallets.value.includes(id)) excludedWallets.value = excludedWallets.value.filter((el) => el !== id);
			else excludedWallets.value.push(id);
		} else {
			if (includedWallets.value.includes(id)) includedWallets.value = includedWallets.value.filter((el) => el !== id);
			else includedWallets.value.push(id);
		}
	};

	const postWalletKeysHot = async (typeFile: "json" | "csv", message = "Keys downloaded") => {
		try {
			if (!otpGlobalCode.value) return;
			const params: IWalletKeysHotRequest = { file_type: typeFile, totp: otpGlobalCode.value };

			if (isSelectedAllWallets.value) params.exclude_wallet_address_ids = excludedWallets.value;
			else params.wallet_address_ids = includedWallets.value;

			const response = await postApiWalletKeysHot(params);
			const text = typeFile === "json" ? JSON.stringify(response) : response;
			downloadBlobFile(text, typeFile === "json" ? "private-keys.json" : "private-keys.csv");
			notify(message, "success");
		} catch (error: any) {
			throw error;
		}
	};

	return {
		isLoading,
		walletSeeds,
		walletKeys,
		wallets,
		walletSummary,
		walletsPagination,
		walletsFilter,
		walletBalancesHot,
		isHideLowBalance,
		isLoadingWalletSummary,
		currentBlockchainHotWallets,
		selectedBlockchainFromDashboard,
		includedWallets,
		excludedWallets,
		balanceFiatFrom,
		allWallets,
		isSelectedAllWallets,
		displayedWallets,
		isLoadingWalletBalancesHot,
		handleSelectWallet,
		getWallets,
		getWalletBalancesHot,
		getWalletSummary,
		setWalletHotBalancePolling,
		getWalletKeys,
		getWalletSeeds,
		postWithdrawMultipleManualOrProcessing,
		resetDataHotWallets,
		postWalletKeysHot
	};
});
