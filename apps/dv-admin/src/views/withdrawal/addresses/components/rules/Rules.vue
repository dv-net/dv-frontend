<script setup lang="ts">
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { UiButton, UiInput, UiSelect } from "@dv.net/ui-kit";
	import { computed, ref, watch } from "vue";
	import { storeToRefs } from "pinia";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import type { IWithdrawalRules, IWithdrawalRulesRequest } from "@dv-admin/utils/types/api/apiGo";
	import { patchApiWithdrawalCurrencyRules } from "@dv-admin/services/api/withdrawal";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general";
	import {
		convertCurrencyInUsd,
		formatAmountBlockchain,
		formatDollars,
		getCurrentBlockchain,
		getCurrentCoin
	} from "@shared/utils/helpers/general";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import { useGeneralStore } from "@dv-admin/stores/general";
	const { notify } = useNotifications();
	const { t } = useI18n();

	const props = defineProps<{ currencyId: string }>();

	const { withdrawalCurrencyRules } = storeToRefs(useWithdrawalStore());
	const { getWithdrawalCurrencyRules } = useWithdrawalStore();
	const { depositAddresses } = storeToRefs(useWithdrawalStore());
	const { exchangeList } = storeToRefs(useExchangeSettingsStore());
	const { bitcoinLikeNetworks } = storeToRefs(useGeneralStore());

	const isLoading = ref<boolean>(false);
	const copyRules = ref<any>({});
	const currentCurrency = ref<string>("USDT");
	const rules = ref<IWithdrawalRules>({
		amount: null,
		lowBalanceRule: "disabled",
		lowBalanceAddress: null
	});

	const priceMinOutput = computed<number>(() => {
		const findAddresses = depositAddresses.value.find((item) => item.slug === exchangeList.value?.current_exchange);
		if (!findAddresses || !findAddresses.addresses.length) return 30;
		const filteredAddresses = findAddresses.addresses.filter((item) => item.currency === props.currencyId);
		if (!filteredAddresses.length || !filteredAddresses[0]?.min_deposit_amount) return 30;
		return (
			Math.ceil(convertCurrencyInUsd(filteredAddresses[0].min_deposit_amount, withdrawalCurrencyRules.value.rate)) || 30
		);
	});

	const options = computed<IUiSelectOptions[]>(() => {
		return [
			{ label: t("Random from output addresses"), value: "random" },
			{ label: t("Leave on hot"), value: "disabled" },
			{ label: t("Processing and saving there"), value: "processing" },
			{ label: t("Select from output addresses"), value: "manual" }
		];
	});

	const optionsCurrency = computed<IUiSelectOptions[]>(() => {
		return [
			{ label: "USD", value: "USDT" },
			{
				label: `${getCurrentCoin(props.currencyId)} (${getCurrentBlockchain(props.currencyId)})`,
				value: props.currencyId
			}
		];
	});

	const isTargetSelectManual = computed<boolean>(() => rules.value.lowBalanceRule === "manual");
	const isDisabledBtn = computed<boolean>(() => {
		return JSON.stringify(copyRules.value) === JSON.stringify(rules.value);
	});
	const isDisabledSelectAddresses = computed<boolean>(() => {
		if (!withdrawalCurrencyRules.value?.addressees?.length) return true;
		// When input is empty it has a placeholder, so check for address presence
		if (withdrawalCurrencyRules.value.addressees.length === 1 && !withdrawalCurrencyRules.value.addressees[0].address)
			return true;
		return false;
	});

	const handleChangeLowBalanceRules = () => {
		rules.value.lowBalanceAddress = null;
	};

	const handleSaveRules = async () => {
		try {
			if (!rules.value.amount) {
				notify(t("Please enter the correct number of forwarding rules"));
				return;
			}
			isLoading.value = true;
			const body: IWithdrawalRulesRequest = {
				interval: "every-one-min",
				min_balance: currentCurrency.value === "USDT" ? null : rules.value.amount,
				min_balance_usd: currentCurrency.value === "USDT" ? rules.value.amount : null,
				status: "enabled",
				...(bitcoinLikeNetworks.value.includes(props.currencyId)
					? { low_balance_rules: { mode: rules.value.lowBalanceRule, manual_address: rules.value.lowBalanceAddress } }
					: {})
			};
			await patchApiWithdrawalCurrencyRules(withdrawalCurrencyRules.value.currency.id, body);
			await getWithdrawalCurrencyRules(props.currencyId);
			notify(t("Transfers rules are changed"), "success");
			copyRules.value = { ...rules.value };
		} catch (error: any) {
			console.error(error.message);
		} finally {
			isLoading.value = false;
		}
	};

	const handleChangeSelect = () => {
		if (currentCurrency.value === "USDT") {
			rules.value.amount = parseFloat(
				formatDollars(
					convertCurrencyInUsd(rules.value.amount, withdrawalCurrencyRules.value.rate),
					"",
					"0",
					0,
					2,
					false
				)
			);
		} else {
			rules.value.amount = parseFloat(
				formatAmountBlockchain(
					convertCurrencyInUsd(rules.value.amount, withdrawalCurrencyRules.value.rate, "usdToCurrency"),
					props.currencyId,
					undefined,
					"0"
				)
			);
		}
	};

	watch(
		withdrawalCurrencyRules,
		() => {
			if (withdrawalCurrencyRules.value.native_balance) {
				rules.value.amount = withdrawalCurrencyRules.value.native_balance as any;
				currentCurrency.value = props.currencyId;
			}
			if (withdrawalCurrencyRules.value.usd_balance) {
				rules.value.amount = parseFloat(withdrawalCurrencyRules.value.usd_balance);
				currentCurrency.value = "USDT";
			}
			rules.value.lowBalanceRule = !withdrawalCurrencyRules.value?.low_balance_rules?.mode
				? "disabled"
				: withdrawalCurrencyRules.value.low_balance_rules.mode;
			rules.value.lowBalanceAddress = !withdrawalCurrencyRules.value?.low_balance_rules?.manual_address
				? null
				: withdrawalCurrencyRules.value.low_balance_rules.manual_address;
			copyRules.value = { ...rules.value };
		},
		{ immediate: true }
	);
</script>

<template>
	<block-section v-if="Object.keys(withdrawalCurrencyRules).length" class="rules" :title="$t('Forwarding rules')">
		<div class="flex flex-column gap-16">
			<div class="rules__inputs">
				<global-input title="Send amounts higher">
					<ui-input
						v-model="rules.amount"
						is-empty-value-null
						type="number"
						:placeholder="$t('Enter the amount')"
						class="rules__inputs-currency"
					>
						<template #append>
							<ui-select
								size="sm"
								v-model="currentCurrency"
								filled
								:options="optionsCurrency"
								@click.stop
								@change="handleChangeSelect"
							/>
						</template>
					</ui-input>
				</global-input>
				<global-input v-if="bitcoinLikeNetworks.includes(props.currencyId)" title="What to do with small amounts">
					<ui-select v-model="rules.lowBalanceRule" :options="options" @change="handleChangeLowBalanceRules" />
				</global-input>
				<div v-if="isTargetSelectManual"></div>
				<ui-select
					v-if="isTargetSelectManual"
					v-model="rules.lowBalanceAddress"
					:placeholder="$t('Forwarding email address')"
					:options="withdrawalCurrencyRules.addressees.map((item) => item.address)"
					:disabled="isDisabledSelectAddresses"
				/>
			</div>
			<p class="rules__banner" :class="{ full: bitcoinLikeNetworks.includes(props.currencyId) }">
				{{ $t("minAmountWithdrawal", { price: priceMinOutput }) }}
			</p>
		</div>
		<ui-button class="mt-24" :disabled="isDisabledBtn" :loading="isLoading" @click="handleSaveRules">
			{{ $t("Save") }}
		</ui-button>
	</block-section>
</template>

<style lang="scss" scoped>
	.rules {
		margin: 16px 0;
		&__banner {
			border-radius: 4px;
			background-color: #ecf0f5;
			padding: 8px 12px;
			color: $black;
			font-size: 12px;
			font-weight: 500;
			line-height: 16px;
			max-width: max-content;
			&.full {
				max-width: unset;
			}
		}
		&__inputs {
			display: grid;
			grid-template-columns: 380px 1fr;
			gap: 16px;
			&-currency {
				&:deep(.ui-select__wrapper) {
					.ui-select {
						height: 28px;
						width: 150px;
						background: #ecf0f5;
						box-shadow: unset;
						&__value {
							font-size: 12px;
							color: $black;
							font-weight: 500;
						}
					}
				}
			}
		}
	}
</style>
