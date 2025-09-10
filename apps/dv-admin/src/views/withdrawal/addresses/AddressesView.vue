<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { UiTabs, UiTabsItem, UiInput, UiButton, UiTable } from "@dv.net/ui-kit";
	import { computed, onMounted, onUnmounted, ref, watch } from "vue";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { useRoute } from "vue-router";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import { storeToRefs } from "pinia";
	import { capitalizeFirstLetter } from "@shared/utils/helpers/general";
	import type { IWithdrawalAddressItemResponse } from "@dv-admin/utils/types/api/apiGo";
	import { ADDRESS_REGEX } from "@shared/utils/constants/regex";
	import Authentication from "@dv-admin/views/withdrawal/addresses/components/authentication/Authentication.vue";
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";
	import ConnectedExchangesList from "@dv-admin/views/withdrawal/addresses/components/connectedExchangesList/ConnectedExchangesList.vue";
	import {
		areArraysEqualByFields,
		formatingWithdrawalAddresses,
		getFreshAddressee
	} from "@dv-admin/utils/helpers/withdrawalAddresses";
	import BannerAttention from "@dv-admin/components/ui/bannerAttention/BannerAttention.vue";
	import Rules from "@dv-admin/views/withdrawal/addresses/components/rules/Rules.vue";
	import { postApiAddressesConverter } from "@dv-admin/services/api/withdrawal";
	import BannerInfo from "@dv-admin/components/ui/bannerInfo/BannerInfo.vue";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useGeneralStore } from "@dv-admin/stores/general";

	const { notify } = useNotifications();
	const { t } = useI18n();
	const {
		withdrawalCurrencyRules,
		isLoading,
		isShowAuthentication,
		arrayErrorsAddresses,
		currentAddressTab,
		withdrawalCurrentCurrencyRulesAddressesHistory,
		isDataReceivedAddresses,
		isShowBannerInfo
	} = storeToRefs(useWithdrawalStore());
	const { getWithdrawalCurrencyRules, getConnectedExchanges, getExchangeDepositAddresses } = useWithdrawalStore();
	const { bitcoinLikeNetworks } = storeToRefs(useGeneralStore());

	const route = useRoute();
	const textarea = ref<HTMLTextAreaElement | null>(null);
	const isShowBannerWarning = ref<boolean>(false);
	const currencyId = route.params.currencyId as string;
	const multipleSelectionAddresses = ref<IWithdrawalAddressItemResponse[]>([]);

	const headers = computed<UiTableHeader[]>(() => [
		{ selection: true },
		{
			name: "address",
			label: t("Wallet Address")
		},
		{ name: "name", label: t("Wallet name") },
		{ name: "delete", width: "120" }
	]);

	const handleSelectionChange = (row: unknown[]) => {
		multipleSelectionAddresses.value = row as IWithdrawalAddressItemResponse[];
	};

	const handleAddNewAddress = () => {
		withdrawalCurrencyRules.value.addressees.push(getFreshAddressee());
	};

	const handleDeleteAddress = (row: IWithdrawalAddressItemResponse) => {
		if (!withdrawalCurrencyRules.value?.addressees || !withdrawalCurrencyRules.value?.addressees?.length) return;
		withdrawalCurrencyRules.value.addressees = withdrawalCurrencyRules.value.addressees.filter(
			(item) => item.id !== row.id
		);
	};

	const handleDeleteSelectedAddresses = () => {
		if (!withdrawalCurrencyRules.value?.addressees || !withdrawalCurrencyRules.value?.addressees?.length) return;
		const deleteIds: string[] = multipleSelectionAddresses.value.length
			? multipleSelectionAddresses.value.map((item) => item.id)
			: [];
		withdrawalCurrencyRules.value.addressees = withdrawalCurrencyRules.value.addressees.filter(
			(item) => !deleteIds.includes(item.id)
		);
	};

	// Validation before sending to backend
	const handleCheckAddresses = async () => {
		// Cannot delete address if it's specified in forwarding rules
		const filteredAddresses = withdrawalCurrencyRules.value.addressees.map((item) => item.address);
		if (
			bitcoinLikeNetworks.value.includes(currencyId) &&
			withdrawalCurrencyRules.value?.low_balance_rules?.mode === "manual" &&
			withdrawalCurrencyRules.value?.low_balance_rules?.manual_address &&
			!filteredAddresses.includes(withdrawalCurrencyRules.value.low_balance_rules.manual_address)
		) {
			return notify(t("You cannot delete an email address specified in the forwarding rules"));
		}
		arrayErrorsAddresses.value = [];
		if (!withdrawalCurrencyRules.value?.addressees?.length) {
			return (isShowAuthentication.value = true);
		}
		// To be able to clear all addresses by sending empty array
		if (
			withdrawalCurrencyRules.value?.addressees?.length === 1 &&
			!withdrawalCurrencyRules.value.addressees[0].address &&
			!withdrawalCurrencyRules.value.addressees[0].name
		) {
			withdrawalCurrencyRules.value.addressees = [];
		} else {
			// Clear empty inputs
			withdrawalCurrencyRules.value.addressees = withdrawalCurrencyRules.value.addressees.filter((item) =>
				Boolean(item.address)
			);
			withdrawalCurrencyRules.value.addressees.forEach((item) => {
				if (!ADDRESS_REGEX.test(item.address)) arrayErrorsAddresses.value.push(item.id);
			});
		}
		if (arrayErrorsAddresses.value.length) return (currentAddressTab.value = "1");

		// BCH converter
		if (currencyId === "BCH.Bitcoincash") {
			for (const item of withdrawalCurrencyRules.value.addressees) {
				try {
					const data = await postApiAddressesConverter(item.address, "bitcoincash");
					item.address = data.address;
				} catch (error) {
					console.error(error);
				}
			}
			isShowBannerInfo.value = true;
		}
		isShowAuthentication.value = true;
	};

	const filteredAddressees = computed<IWithdrawalAddressItemResponse[]>(() => {
		if (currentAddressTab.value === "1") {
			if (!withdrawalCurrencyRules.value?.addressees?.length) {
				// eslint-disable-next-line vue/no-side-effects-in-computed-properties
				withdrawalCurrencyRules.value.addressees = [getFreshAddressee()];
			}
			return withdrawalCurrencyRules.value.addressees;
		} else {
			return withdrawalCurrencyRules.value?.addressees ?? [];
		}
	});

	// Input and output data from Textarea
	const addressesTextarea = computed<string>(() => {
		if (!withdrawalCurrencyRules.value?.addressees?.length) return "";
		return withdrawalCurrencyRules.value.addressees
			.map(({ address, name }) => {
				const formattedName: string = name ? ` [${name}]` : "";
				return address ? `${address}${formattedName}` : formattedName || null;
			})
			.filter(Boolean)
			.join("\n");
	});
	// Processing entered addresses
	const handleGetOutputAddresses = () => {
		if (!textarea.value || !textarea.value.value) {
			return (withdrawalCurrencyRules.value.addressees = []);
		}
		withdrawalCurrencyRules.value.addressees = formatingWithdrawalAddresses(textarea.value.value);
	};

	// Check if user changed anything compared to initial data
	watch(
		() => withdrawalCurrencyRules.value.addressees,
		(array) => {
			// Don't check until data is received from server
			if (!isDataReceivedAddresses.value) {
				return (isShowBannerWarning.value = false);
			}
			// Transform our array for comparison suitability
			const newArray = array
				.map((item) => (!item.address && !item.name ? undefined : { ...item, name: item.name || null }))
				.filter(Boolean) as IWithdrawalAddressItemResponse[];
			// Function to check matching by specified fields
			const fields = ["name", "address"] as (keyof IWithdrawalAddressItemResponse)[];
			isShowBannerWarning.value = !areArraysEqualByFields<IWithdrawalAddressItemResponse>(
				withdrawalCurrentCurrencyRulesAddressesHistory.value,
				newArray,
				fields
			);
		},
		{ deep: true }
	);

	onMounted(async () => {
		await Promise.all([getConnectedExchanges(), getWithdrawalCurrencyRules(currencyId), getExchangeDepositAddresses()]);
	});

	onUnmounted(() => {
		isShowAuthentication.value = false;
		isShowBannerInfo.value = false;
	});
</script>

<template>
	<div class="page">
		<breadcrumbs
			:back-route-title="$t('Withdrawal rules')"
			:current-route-title="`${capitalizeFirstLetter(withdrawalCurrencyRules?.currency?.blockchain)} ${$t('wallets.many')}`"
		/>

		<h1 class="page__title global-title-h2">
			{{ capitalizeFirstLetter(withdrawalCurrencyRules?.currency?.blockchain) }} {{ $t("wallets.many") }}
		</h1>

		<ConnectedExchangesList />

		<banner-attention
			:is-show-banner="isShowBannerWarning"
			:text="$t('Attention! Wallets have been changed, to apply the settings, click the «Save wallets» button')"
		/>

		<rules :currencyId="currencyId" />

		<block-section class="page__block" :is-loading="isLoading" :title="$t('Withdrawal addresses')">
			<ui-tabs class="page__tabs" mode="light" v-model="currentAddressTab">
				<ui-tabs-item value="1">{{ $t("Entering wallets individually") }}</ui-tabs-item>
				<ui-tabs-item value="2">{{ $t("Enter all in Textarea") }}</ui-tabs-item>
			</ui-tabs>

			<form class="page__form">
				<ui-table
					v-if="currentAddressTab === '1'"
					:headers="headers"
					:data="filteredAddressees"
					table-layout="fixed"
					:class="{ 'global-opacity': isShowAuthentication }"
					@update:selected="handleSelectionChange"
				>
					<template #body-cell-address="{ row }">
						<ui-input v-model="row.address" size="sm" :class="{ error: arrayErrorsAddresses.includes(row.id) }" />
					</template>

					<template #body-cell-name="{ row }">
						<ui-input v-model="row.name" size="sm" />
					</template>

					<template #body-cell-delete="{ row }">
						<div class="w-full flex flex-x-end">
							<ui-button type="negative" size="sm" @click="handleDeleteAddress(row)">{{ $t("Delete") }}</ui-button>
						</div>
					</template>

					<template #footer>
						<div class="table__footer">
							<ui-button leftIconType="400" leftIconName="add-circle" type="secondary" @click="handleAddNewAddress">
								{{ $t("Add more") }}
							</ui-button>

							<ui-button
								v-if="multipleSelectionAddresses.length"
								leftIconType="400"
								leftIconName="delete"
								type="negative"
								@click="handleDeleteSelectedAddresses"
							>
								{{ $t("Delete selected") }}
							</ui-button>
						</div>
					</template>
				</ui-table>

				<global-input v-if="currentAddressTab === '2'" title="Wallet addresses">
					<textarea
						ref="textarea"
						class="textarea"
						:value="addressesTextarea"
						:disabled="isShowAuthentication"
						@blur="handleGetOutputAddresses"
					/>
				</global-input>

				<banner-info
					:is-show="isShowBannerInfo"
					:text="
						$t(
							`For your convenience, we automatically convert your address to the new format, since the old version of the address does not support signing transactions in the current version of the BitcoinCash blockchain. The correctness of the conversion can be checked on the official website: https://cashaddr.bitcoincash.org`
						)
					"
				/>

				<authentication />

				<div v-if="!isShowAuthentication" class="page__form-actions">
					<ui-button
						type="primary"
						size="xl"
						leftIconType="400"
						leftIconName="check-circle"
						leftIconSize="lg"
						@click="handleCheckAddresses"
					>
						{{ $t("Save wallets") }}
					</ui-button>
				</div>
			</form>
		</block-section>
	</div>
</template>

<style scoped lang="scss">
	.page {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 24px;

		&__title {
			margin-bottom: 8px;
		}

		&__tabs {
			margin: 16px 0 24px;
			width: max-content;
		}

		&__block {
			display: flex;
			flex-direction: column;
		}

		&__form {
			display: flex;
			flex-direction: column;
			gap: 16px;

			&-actions {
				display: flex;
				align-items: center;
				gap: 24px;
				margin-top: 8px;
			}

			.table {
				&:deep(.el-table__cell) {
					.cell {
						padding: 1px 12px;
					}
				}

				&:deep(.ui-input) {
					&.error {
						border: 2px solid red;
					}
				}

				&__footer {
					display: flex;
					align-items: center;
					gap: 12px;
				}
			}

			.textarea {
				border: 1px solid $grey;
				background: $white;
				border-radius: 8px;
				cursor: text;
				padding: 12px;
				resize: none;
				height: 160px;
				width: 100%;
				font-weight: 500;
				font-size: 14px;
				line-height: 20px;
				outline: none;
				color: $black;
				font-family: inherit;
				transition: all 0.3s ease;

				&::placeholder {
					color: $grey-opacity;
				}

				&:hover {
					border-color: #e0e4e9;
				}

				&:focus {
					border-color: $blue;
				}

				&:disabled {
					cursor: not-allowed;
					color: #a4a5b1;
					background: $white;
					border-color: $grey;
				}
			}
		}
	}
</style>
