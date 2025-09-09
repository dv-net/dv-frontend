<script setup lang="ts">
	import { UiButton, UiDropdown, UiIcon, UiIconButton, UiInput, UiLink } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import { debounce } from "@shared/utils/helpers/debounce";
	import { computed, ref, watch } from "vue";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";
	import DialogShowAddresses from "@dv-admin/views/hotWallets/components/filters/dialogShowAddresses/DialogShowAddresses.vue";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { USER } from "@dv-admin/utils/constants/user";

	const { notify } = useNotifications();
	const { t } = useI18n();
	const {
		walletsFilter,
		includedWallets,
		excludedWallets,
		wallets,
		currentBlockchainHotWallets,
		allWallets,
		balanceFiatFrom,
		isSelectedAllWallets
	} = storeToRefs(useHotWalletsStore());
	const { getWallets, postWithdrawMultipleManualOrProcessing, postWalletKeysHot } = useHotWalletsStore();
	const { bitcoinLikeNetworks } = storeToRefs(useGeneralStore());
	const { openOtpGlobalModal } = useGeneralStore();

	const toggleView = defineModel<boolean>("toggleView", { required: true, default: false });
	const isShowDropdownKeys = ref<boolean>(false);
	const isShowDropdown = ref<boolean>(false);
	const isOpenModalSendWallets = ref<boolean>(false);

	const isShowBtnSend = computed<boolean>(
		() => bitcoinLikeNetworks.value.includes(currentBlockchainHotWallets.value) && !!includedWallets.value.length
	);
	const isShowBtnDownloadKeys = computed<boolean>(() => !!includedWallets.value.length);

	const debouncedSearch = debounce(getWallets, 500);

	const handleChangeView = (value: boolean) => {
		toggleView.value = value;
		localStorage.setItem(USER.HOT_WALLETS_VIEW, JSON.stringify(value));
	};

	const handleSortWallets = async () => {
		walletsFilter.value.is_sort_by_balance = !walletsFilter.value.is_sort_by_balance;
		await getWallets();
	};

	const handleSendWallet = async (type: "rules" | "processing") => {
		isShowDropdown.value = false;
		if (type === "processing") {
			await postWithdrawMultipleManualOrProcessing("processing", currentBlockchainHotWallets.value);
			notify(t("Success"), "success");
		}
		if (type === "rules") {
			isOpenModalSendWallets.value = true;
		}
	};

	const handleDownloadKeys = (typeFile: "json" | "csv") => {
		isShowDropdownKeys.value = false;
		openOtpGlobalModal(() => postWalletKeysHot(typeFile));
	};

	const handleClearSelectedElements = () => {
		includedWallets.value = [];
		wallets.value.forEach((item) => (item.isSelected = false));
	};

	const handleChangeSelectOnPage = () => {
		wallets.value.forEach((item) => (item.isSelected = true));
		const allElementsOnPage = wallets.value.map((item) => item.id);
		if (isSelectedAllWallets.value)
			excludedWallets.value = excludedWallets.value.filter((el) => !allElementsOnPage.includes(el));
		else includedWallets.value = Array.from(new Set([...includedWallets.value, ...allElementsOnPage]));
	};

	const handleChangeSelectAll = () => {
		wallets.value.forEach((item) => (item.isSelected = true));
		excludedWallets.value = [];
		isSelectedAllWallets.value = true;
	};

	watch(
		() => includedWallets.value,
		(newVal, prevVal) => {
			// if selected nothing turn off "selecting all wallets"
			if (includedWallets.value.length === 0) isSelectedAllWallets.value = false;

			// check some item at the table body
			if (
				isSelectedAllWallets.value &&
				(newVal.length === prevVal.length - 1 || newVal.length - 1 === prevVal.length)
			) {
				const diffVal =
					newVal.filter((item) => !prevVal.includes(item))[0] || prevVal.filter((item) => !newVal.includes(item))[0];

				if (excludedWallets.value.includes(diffVal)) {
					excludedWallets.value = excludedWallets.value.filter((item) => item !== diffVal);
				} else {
					excludedWallets.value.push(diffVal);
				}
			}
		}
	);
</script>

<template>
	<div class="filters">
		<div class="filters__top">
			<div class="inner">
				<ui-input
					is-empty-value-null
					class="inner__input inner__input--address"
					v-model="walletsFilter.address"
					size="sm"
					:placeholder="$t('Wallet Address')"
					@input="debouncedSearch"
				>
					<template #prepend>
						<ui-icon name="search  1" type="100" />
					</template>
				</ui-input>

				<ui-input
					is-empty-value-null
					class="inner__input"
					type="number"
					size="sm"
					v-model.number="balanceFiatFrom"
					placeholder="Min $"
					@input="debouncedSearch"
				/>

				<ui-input
					is-empty-value-null
					class="inner__input"
					type="number"
					size="sm"
					v-model.number="walletsFilter.balance_fiat_to"
					placeholder="Max $"
					@input="debouncedSearch"
				/>

				<span class="button" @click="handleSortWallets">
					<ui-icon-button
						class="button__sort"
						:class="{ rotate: !walletsFilter.is_sort_by_balance }"
						icon-color="#6b6d80"
						icon-name="filter"
					/>
				</span>
			</div>

			<div class="inner">
				<div class="inner__toggle">
					<div class="inner__toggle-item" @click="handleChangeView(true)">
						<ui-icon type="400" name="list" :color="toggleView ? '#303345' : '#A4A5B1'" size="md" />
					</div>
					<div class="inner__toggle-item" @click="handleChangeView(false)">
						<ui-icon type="400" name="grid-view" :color="toggleView ? '#A4A5B1' : '#303345'" size="md" />
					</div>
				</div>
			</div>
		</div>

		<div v-show="includedWallets.length" class="filters__bottom">
			<div class="inner">
				<div class="left">
					<ui-link @click="handleChangeSelectOnPage">{{ $t("Select all on page") }}</ui-link>
					<span class="left__line" />
					<div class="left__select">
						<span>
							{{
								$t("selected-hot-wallets", {
									numberSelected: isSelectedAllWallets ? allWallets - excludedWallets.length : includedWallets.length,
									numberAll: allWallets
								})
							}}
						</span>
						<ui-icon-button icon-name="close" class="pointer" @click="handleClearSelectedElements" container-small />
					</div>

					<ui-link @click="handleChangeSelectAll"> {{ $t("Select all") }} ({{ allWallets }})</ui-link>
				</div>

				<div class="right">
					<ui-dropdown
						v-if="isShowBtnSend"
						trigger="click"
						popper-class="global-dropdown__wallets"
						placement="bottom-end"
						v-model="isShowDropdown"
					>
						<template #reference>
							<ui-button type="outline" size="md">
								{{ $t("Send") }}
							</ui-button>
						</template>

						<template #default>
							<div class="global-dropdown__wallets-list">
								<div class="global-dropdown__wallets-item" @click="handleSendWallet('rules')">
									<span>{{ $t("According to the withdrawal rules") }}</span>
								</div>

								<div class="global-dropdown__wallets-item" @click="handleSendWallet('processing')">
									<span>{{ $t("To the processing") }}</span>
								</div>
							</div>
						</template>
					</ui-dropdown>

					<ui-dropdown
						v-if="isShowBtnDownloadKeys"
						trigger="click"
						popper-class="global-dropdown__wallets"
						placement="bottom-end"
						v-model="isShowDropdownKeys"
					>
						<template #reference>
							<ui-button type="outline" size="md">
								{{ $t("Download keys") }}
							</ui-button>
						</template>

						<template #default>
							<div class="global-dropdown__wallets-list">
								<div class="global-dropdown__wallets-item" @click="handleDownloadKeys('json')">
									<span>{{ $t("In JSON format") }}</span>
								</div>

								<div class="global-dropdown__wallets-item" @click="handleDownloadKeys('csv')">
									<span>{{ $t("In CSV format") }}</span>
								</div>
							</div>
						</template>
					</ui-dropdown>
				</div>
			</div>
		</div>
	</div>

	<dialog-show-addresses v-model:is-open="isOpenModalSendWallets" :currency-id="currentBlockchainHotWallets" />
</template>

<style scoped lang="scss">
	.filters {
		display: flex;
		flex-direction: column;

		&__top {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 20px;
			padding: 16px 24px;

			.button {
				cursor: pointer;
				border-radius: 8px;
				border: 1px solid $grey;
				background-color: $white;
				width: 32px;
				height: 32px;
				@extend .center;

				&.active {
					border: 1px solid $blue;
				}

				&__sort {
					transition: transform ease 0.3s;
					&.rotate {
						transform: rotate(180deg);
					}
				}
			}

			.inner {
				display: flex;
				align-items: center;
				gap: 8px;

				&__input {
					height: 32px;
					width: 82px;

					&--address {
						width: 196px;
					}
				}

				&__toggle {
					@extend .no-select;
					display: grid;
					grid-template-columns: 1fr 1fr;
					height: 32px;
					width: 80px;
					border-radius: 8px;
					border: 1px solid $grey;
					background-color: $white;
					cursor: pointer;

					&-item {
						@extend .center;
						transition: transform 0.3s ease-in-out;
						@media (hover: hover) {
							&:hover {
								transform: scale(1.1);
							}
						}
					}
				}
			}
		}

		&__bottom {
			min-height: 56px;
			display: flex;
			padding: 8px 24px;
			background-color: #eef2f7;
			border-top: 1px solid $grey;
			border-bottom: 1px solid $grey;

			.inner {
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 20px;
				flex-grow: 1;
			}

			.left {
				display: flex;
				align-items: center;
				gap: 16px;

				&__line {
					width: 1px;
					height: 20px;
					background-color: $grey-light;
				}

				&__select {
					display: flex;
					align-items: center;
					gap: 4px;
					color: $secondary;
					font-size: 14px;
					font-weight: 500;
					line-height: 16px;
				}

				&__select-all {
					display: flex;
					align-items: center;
					color: $blue;
					font-size: 14px;
					font-weight: 500;
					line-height: 16px;
				}
			}

			.right {
				display: flex;
				align-items: center;
				gap: 8px;
			}
		}
	}
</style>
