<script setup lang="ts">
	import { UiForm, UiSelect, UiInput, UiButton, UiFormItem, UiLink, UiSkeleton } from "@dv.net/ui-kit";
	import { computed, onMounted, ref } from "vue";
	import type {
		IProcessingWalletsResponse,
		IWithdrawalFromProcessingRequest
	} from "@dv-admin/utils/types/api/apiGo.ts";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { storeToRefs } from "pinia";
	import { useRoute, useRouter } from "vue-router";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { formatAmountBlockchain, formatDollars } from "@shared/utils/helpers/general.ts";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { v4 as uuidv4 } from "uuid";

	const route = useRoute();
	const router = useRouter();
	const { t } = useI18n();

	const { postWithdrawalFromProcessing, getProcessingWallets } = useDashboardStore();
	const { processingWallets, isLoadingProcessingWallets } = storeToRefs(useDashboardStore());
	const { userSettings, isLoading } = storeToRefs(useUserSettingsStore());

	const currentBlockchain = route.params.blockchain as string;
	const stablecoins: string[] = ["DAI", "USD"];
	const defaultFormValues = {
		address_to: "",
		amount: null,
		currency_id: "",
		totp: "",
		request_id: ""
	};
	const currentWallet = ref<IProcessingWalletsResponse>();
	const formRef = ref<HTMLFormElement | null>(null);
	const form = ref<IWithdrawalFromProcessingRequest>({ ...defaultFormValues });
	const selectedCurrency = ref<{ value: string; label: string; amount: string; identity: string }>();

	const isEnabledWithdrawal = computed<boolean>(
		() => userSettings.value.find((el) => el.name === "withdraw_from_processing")?.value === "enabled"
	);

	const isInputsDisabled = computed<boolean>(
		() => selectedCurrency.value?.amount === "0" || !isEnabledWithdrawal.value
	);

	const formattedCurrencies = computed(
		() =>
			currentWallet.value?.assets.map((currency) => ({
				value: currency.currency_id,
				label: stablecoins.every((el) => !currency.identity.includes(el))
					? `${currency.identity} ${formatAmountBlockchain(currency.amount, currency.identity)} / ${formatDollars(currency.amount_usd)}`
					: `${currency.identity} ${formatDollars(currency.amount)}`,
				amount: currency.amount,
				identity: currency.identity
			})) || []
	);

	const rulesForm = computed<UiFormRules>(() => {
		return {
			currency_id: [{ required: true, message: t("Select currency") }],
			address_to: [{ required: true, message: t("Enter address") }],
			amount: [
				{ required: true, message: t("Enter the amount") },
				{
					validator: () => Boolean(Number(form.value.amount) <= Number(selectedCurrency.value?.amount)),
					message: t("Enter correct amount")
				}
			]
		};
	});

	const withdrawHandler = async () => {
		if (!formRef.value || !(await formRef.value.validate())) return;
		form.value.request_id = uuidv4();
		await postWithdrawalFromProcessing(form.value, clearForm);
	};

	const clearForm = () => {
		form.value = { ...defaultFormValues };
	};

	const currencyChangeHandler = async (selected: string | null) => {
		selectedCurrency.value = formattedCurrencies.value.find((item) => item.value === selected);
		form.value.amount = null;
		formRef.value?.resetValidate();
	};

	onMounted(async () => {
		if (!processingWallets.value?.length) await getProcessingWallets();
		currentWallet.value = processingWallets.value.find((wallet) => wallet.blockchain === currentBlockchain);
	});
</script>

<template>
	<div class="page">
		<breadcrumbs
			:current-route-title="$t('Withdrawal from processing')"
			:back-route-title="$t('Dashboard')"
			back-name-route="dashboard"
		/>

		<h1 class="global-title-h2 mt-24 mb-32">
			{{ $t("Withdrawal from processing") }} {{ $t("wallets.many3") }} - {{ currentBlockchain.toUpperCase() }}
		</h1>

		<ui-skeleton
			v-if="isLoadingProcessingWallets || isLoading"
			:row-height="234"
			:rows="1"
			:item-border-radius="16"
			style="width: 770px"
		/>

		<block-section v-else mode="grey-border" class="withdrawal-form-container">
			<ui-form ref="formRef" @submit.prevent="withdrawHandler" :rules="rulesForm" :model="form" class="withdrawal-form">
				<div class="flex gap-16">
					<ui-form-item name="currency_id" class="w-full" :label="$t('Currency')">
						<ui-select
							v-model="form.currency_id"
							type="default"
							:options="formattedCurrencies"
							:placeholder="$t('Select currency')"
							:teleport="false"
							@update:model-value="currencyChangeHandler"
							:disabled="!isEnabledWithdrawal"
						>
							<template #selected v-if="form.currency_id">{{ selectedCurrency?.label }}</template>
						</ui-select>
					</ui-form-item>

					<ui-form-item name="amount" class="w-full" :label="$t('Total')">
						<ui-input
							v-model="form.amount"
							:placeholder="$t('Enter the amount')"
							type="number"
							:disabled="isInputsDisabled"
						>
							<template #append>
								<ui-link
									v-if="selectedCurrency?.amount !== '0'"
									@click="selectedCurrency?.amount && (form.amount = Number(selectedCurrency?.amount))"
									:disabled="isInputsDisabled"
								>
									Max
								</ui-link>
							</template>
						</ui-input>
					</ui-form-item>
				</div>

				<div class="flex w-full gap-16">
					<ui-form-item name="address_to" class="w-full" :label="$t('Address')">
						<ui-input v-model="form.address_to" :placeholder="$t('Enter address')" :disabled="isInputsDisabled" />
					</ui-form-item>

					<ui-button mode="neutral" native-type="submit" size="xl" :disabled="isInputsDisabled" class="mt-28">
						{{ $t("Withdraw") }}
					</ui-button>
				</div>
			</ui-form>
		</block-section>

		<block-section v-if="!isLoading && !isEnabledWithdrawal" class="alert" mode="white-border-red" padding="lg">
			{{ $t("Sending funds from processing wallets is prohibited.") }}

			<ui-button mode="neutral" size="md" @click="router.push({ name: 'settings-system-general' })">
				{{ $t("Change this in the settings") }}
			</ui-button>
		</block-section>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		.withdrawal-form-container {
			padding-block: 32px 8px;
			width: fit-content;
			.withdrawal-form {
				width: 720px;
				margin: auto;
			}
		}
		.alert {
			display: flex;
			flex-direction: column;
			width: fit-content;
			gap: 16px;
			margin-top: 24px;
		}
	}
</style>
