<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { UiButton, UiCheckbox, UiFormItem, UiInput } from "@dv.net/ui-kit/dist";
	import { computed, ref } from "vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import type { IAddressBookRequest } from "@dv-admin/utils/types/api/apiGo";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general.ts";
	import { getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import { UiForm, UiSelect } from "@dv.net/ui-kit";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { storeToRefs } from "pinia";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { postApiWithdrawalAddressBook } from "@dv-admin/services/api/addressBook.ts";
	import type { IFormAddressBook } from "@dv-admin/utils/types/schemas";
	import {
		ADDRESS_BOOK_TYPE_LABELS,
		ADDRESS_BOOK_TYPES,
		startDataFormAddressBook
	} from "@dv-admin/utils/constants/addressBook";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";

	const { notify } = useNotifications();
	const { t } = useI18n();

	const { otpGlobalCode, dictionary } = storeToRefs(useGeneralStore());
	const { openOtpGlobalModal } = useGeneralStore();

	const formRef = ref<HTMLFormElement | null>(null);
	const form = ref<IFormAddressBook>({ ...startDataFormAddressBook });

	const rulesForm = computed<UiFormRules>(() => {
		return {
			address: [{ required: true, message: t("Enter address") }],
			blockchain: [
				{
					validator: () =>
						form.value.typeAddress === ADDRESS_BOOK_TYPES.UNIVERSAL ? Boolean(form.value.blockchain) : true,
					message: t("Choose a blockchain")
				}
			],
			currency_id: [
				{
					validator: () =>
						form.value.typeAddress === ADDRESS_BOOK_TYPES.REGULAR ? Boolean(form.value.currency_id) : true,
					message: t("Select currency")
				}
			]
		};
	});

	const optionsSelectTypeAddress = computed<IUiSelectOptions[]>(() => {
		return [
			{ label: t(ADDRESS_BOOK_TYPE_LABELS[ADDRESS_BOOK_TYPES.REGULAR]), value: ADDRESS_BOOK_TYPES.REGULAR },
			{ label: t(ADDRESS_BOOK_TYPE_LABELS[ADDRESS_BOOK_TYPES.UNIVERSAL]), value: ADDRESS_BOOK_TYPES.UNIVERSAL },
			{ label: t(ADDRESS_BOOK_TYPE_LABELS[ADDRESS_BOOK_TYPES.EVM]), value: ADDRESS_BOOK_TYPES.EVM }
		];
	});

	const optionsCurrencies = computed<{ currencies: IUiSelectOptions[]; blockchains: IUiSelectOptions[] }>(() => {
		if (!dictionary.value?.available_currencies?.length) {
			return { currencies: [], blockchains: [] };
		}
		return dictionary.value.available_currencies.reduce(
			(acc: { currencies: IUiSelectOptions[]; blockchains: IUiSelectOptions[] }, item) => {
				const coin: string = getCurrentCoin(item.id);
				const blockchain: string = getCurrentBlockchain(item.id);
				acc.currencies.push({ label: `${coin} (${blockchain})`, value: item.id });
				if (!acc.blockchains.find((el) => el.value === item.blockchain)) {
					acc.blockchains.push({ label: `${blockchain}`, value: item.blockchain });
				}
				return acc;
			},
			{ currencies: [], blockchains: [] }
		);
	});

	const showInputs = computed<{ currency: boolean; blockchain: boolean }>(() => {
		return {
			currency: form.value.typeAddress === ADDRESS_BOOK_TYPES.REGULAR,
			blockchain: form.value.typeAddress === ADDRESS_BOOK_TYPES.UNIVERSAL
		};
	});

	const handleAddAddress = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			const body: IAddressBookRequest = {
				address: form.value.address || "",
				create_withdrawal_rule: form.value.create_withdrawal_rule,
				totp: "",
				...(form.value.name ? { name: form.value.name } : {}),
				...(form.value.tag ? { tag: form.value.tag } : {})
			};
			switch (form.value.typeAddress) {
				case ADDRESS_BOOK_TYPES.REGULAR:
					body.currency_id = form.value.currency_id || "";
					break;
				case ADDRESS_BOOK_TYPES.UNIVERSAL:
					body.blockchain = form.value.blockchain || "";
					body.is_universal = true;
					break;
				case ADDRESS_BOOK_TYPES.EVM:
					body.is_evm = true;
					break;
				default:
					return;
			}
			if (!otpGlobalCode.value) {
				openOtpGlobalModal(() => handleAddAddress());
				return;
			}
			await postApiWithdrawalAddressBook({ ...body, totp: otpGlobalCode.value });
			form.value = { ...startDataFormAddressBook };
			notify(t("The address has been added to the address book"), "success");
		} catch (error: any) {
			console.error(error);
			throw error;
		}
	};
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Address book')" back-name-route="address-book" />
		<h1 class="global-title-h2 mb-8">{{ $t("Adding an address") }}</h1>

		<ui-form class="form" ref="formRef" :rules="rulesForm" :model="form" @submit.prevent="handleAddAddress">
			<block-section class="flex flex-column gap-24" mode="grey-border">
				<h2 class="global-title-h3">{{ $t("Basic settings") }}</h2>
				<div class="form__body">
					<ui-form-item :label="`${$t('Address type')} *`">
						<ui-select
							v-model="form.typeAddress"
							:placeholder="$t('Select the address type')"
							:options="optionsSelectTypeAddress"
							type="default"
							size="lg"
						/>
					</ui-form-item>
					<ui-form-item name="address" :label="`${$t('Address')} *`">
						<ui-input size="lg" v-model="form.address" is-empty-value-null :placeholder="$t('Enter address')" />
					</ui-form-item>
					<ui-form-item v-if="showInputs.currency" name="currency_id" :label="`${$t('Currency')} *`">
						<ui-select
							v-model="form.currency_id"
							size="lg"
							type="default"
							with-search
							:options="optionsCurrencies.currencies"
							:placeholder="$t('Select currency')"
						>
							<template #selected>
								<blockchain-card v-if="form.currency_id" :type="form.currency_id as BlockchainType" />
							</template>
							<template #default="{ option }">
								<blockchain-card :type="option.value as BlockchainType" />
							</template>
						</ui-select>
					</ui-form-item>
					<ui-form-item v-if="showInputs.blockchain" name="blockchain" :label="`${$t('Blockchain')} *`">
						<ui-select
							v-model="form.blockchain"
							size="lg"
							type="default"
							with-search
							:options="optionsCurrencies.blockchains"
							:placeholder="$t('Choose a blockchain')"
						>
							<template #selected>
								<div
									v-if="form?.blockchain && form.blockchain in blockchainCurrencyId"
									class="flex flex-y-center gap-8"
								>
									<blockchain-icon :type="blockchainCurrencyId[form.blockchain] as BlockchainType" />
									<span class="fz-16 fw-400">{{ getCurrentBlockchain(blockchainCurrencyId[form.blockchain]) }}</span>
								</div>
								<span v-else class="fz-16 fw-400">{{ form.blockchain }}</span>
							</template>
							<template #default="{ option }">
								<div v-if="option.value in blockchainCurrencyId" class="flex flex-y-center gap-8">
									<blockchain-icon :type="blockchainCurrencyId[option.value] as BlockchainType" />
									<span class="fz-16 fw-400">{{ option.label }}</span>
								</div>
								<span v-else class="fz-16 fw-400">{{ option.label }}</span>
							</template>
						</ui-select>
					</ui-form-item>
					<ui-form-item :label="$t('Wallet name')">
						<ui-input size="lg" v-model="form.name" is-empty-value-null :placeholder="$t('Enter wallet name')" />
					</ui-form-item>
					<ui-form-item :label="$t('Wallet tag')">
						<ui-input size="lg" v-model="form.tag" is-empty-value-null :placeholder="$t('Enter wallet tag')" />
					</ui-form-item>
					<ui-checkbox v-model="form.create_withdrawal_rule">
						{{ $t("Add this address to the output rules") }}
					</ui-checkbox>
				</div>
			</block-section>
			<ui-button mode="neutral" size="xl" native-type="submit">
				{{ $t("Add address") }}
			</ui-button>
		</ui-form>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;
		.form {
			display: flex;
			flex-direction: column;
			gap: 24px;
			max-width: 720px;
			width: 100%;
			&__body {
				display: grid;
				grid-template-columns: 1fr 1fr;
				column-gap: 12px;
			}
		}
	}
</style>
