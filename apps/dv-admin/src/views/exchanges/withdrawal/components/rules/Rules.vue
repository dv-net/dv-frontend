<script setup lang="ts">
	import { computed, ref } from "vue";
	import { storeToRefs } from "pinia";
	import { useRouter, useRoute } from "vue-router";
	import { UiButton, UiIcon, UiInput, UiLink, UiSelect } from "@dv.net/ui-kit";
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";
	import { useWithdrawalExchangeStore } from "@dv-admin/stores/withdrawal/withdrawalExchange";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general";
	import type { IExchangeCalculationCommissions, IWithdrawalSettingRequest } from "@dv-admin/utils/types/api/apiGo";
	import { capitalizeFirstLetter, convertCurrencyInUsd, formatDollars } from "@shared/utils/helpers/general";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import { useI18n } from "vue-i18n";
	const { isLoadingPostWithdrawalSetting, withdrawalRules, exchangeChainsList, withdrawalCurrenciesRateSource } =
		storeToRefs(useWithdrawalExchangeStore());
	const { postExchangeWithdrawalSetting } = useWithdrawalExchangeStore();

	const START_FORM: IWithdrawalSettingRequest = { address: "", currency_id: "", min_amount: "", ticker: "", chain: "" };

	const props = defineProps<{ slug: string }>();

	const route = useRoute();
	const router = useRouter();
	const { locale } = useI18n();

	const showInfoMessages = ref<IWithdrawalSettingRequest | null>(null);
	const form = ref<IWithdrawalSettingRequest>({ ...START_FORM });

	const transformationExchangeTickerList = computed<IUiSelectOptions[]>(() => {
		const uniqueTickers = new Set<string>();
		exchangeChainsList.value.forEach((item) => uniqueTickers.add(item.ticker_label));
		return [...uniqueTickers].map((item: string) => ({ value: item, label: item.toLocaleUpperCase("en") }));
	});

	const transformationExchangeChainsList = computed<IUiSelectOptions[]>(() => {
		if (!form.value.ticker) return [];
		return exchangeChainsList.value
			.filter((item) => item.ticker === form.value.ticker)
			.map((item) => ({
				value: item.chain,
				label: `${capitalizeFirstLetter(item.chain_label.toLocaleLowerCase("en"))} (${item.chain.toLocaleUpperCase("en")})`
			}));
	});

	const isDisabledButton = computed<boolean>(() => {
		return !form.value.ticker || !form.value.chain || !form.value.address || !form.value.min_amount;
	});

	const calculationCommissions = computed<IExchangeCalculationCommissions | null>(() => {
		if (!form.value.ticker || !form.value.chain) return null;
		const ticker: string = form.value.ticker.toLowerCase();
		const arrayTickerConst: string[] = ["usdt", "usdc"];
		const findRule = withdrawalRules.value.find(
			(item) => item.chain.toLowerCase() === form.value.chain.toLowerCase() && item.currency.toLowerCase() === ticker
		);
		if (!findRule) return null;
		const findRate = withdrawalCurrenciesRateSource.value.find(
			(item) => item.from.toLowerCase() === ticker && item.to.toLowerCase() === "usdt"
		);
		let rate_usd: string = "";
		if (arrayTickerConst.includes(ticker)) rate_usd = "1";
		if (findRate && !arrayTickerConst.includes(ticker)) {
			rate_usd = findRate.value;
		}
		return {
			currency: findRule.currency,
			min_amount: findRule.min_withdraw_amount,
			min_amount_usd: parseFloat(
				formatDollars(convertCurrencyInUsd(findRule.min_withdraw_amount, rate_usd), "", "0", 2)
			),
			fee: findRule.fee,
			fee_usd: parseFloat(formatDollars(convertCurrencyInUsd(findRule.fee, rate_usd), "", "0", 2))
		};
	});

	const handleAddRule = async () => {
		await postExchangeWithdrawalSetting(props.slug, form.value);
		showInfoMessages.value = { ...form.value };
		form.value = { ...START_FORM };
	};

	const handleGoDocs = () => {
		window.open(`https://docs.dv.net/${locale.value}/exchanges/${route.params.slug}.html`, "_blank");
	};
</script>

<template>
	<form @submit.prevent="handleAddRule" class="rules">
		<div class="rules__row">
			<global-input title="Cryptocurrency">
				<ui-select
					v-model="form.ticker"
					type="default"
					:placeholder="$t('Select cryptocurrency')"
					:options="transformationExchangeTickerList"
				/>
			</global-input>
			<global-input title="Chain">
				<ui-select
					v-model="form.chain"
					type="default"
					:placeholder="$t('Select chain')"
					:disabled="!transformationExchangeChainsList.length"
					:options="transformationExchangeChainsList"
				/>
			</global-input>
		</div>
		<div class="rules__row">
			<global-input title="Wallet Address">
				<template #subtitle>
					<tooltip-helper
						:title="$t('Wallet address for withdrawal from the crypto exchange')"
						icon-type="400"
						icon-color="#A4A5B1"
						position="bottom"
						:timeout="2000"
					>
						<template #infoText>
							<div class="ui-tooltip__text">
								<div>
									{{
										$t(
											"You can specify a wallet from which to withdraw funds from the crypto exchange, for this you need to add it to the white list on the crypto exchange"
										)
									}}
									{{ $t("according to the") }}
									<span class="rules__instruction-button" @click="handleGoDocs">
										<span>{{ $t("Instructions") }}</span>
										<ui-icon name="arrow-forward" type="filled" size="sm" style="vertical-align: middle" />
									</span>
								</div>
							</div>
						</template>
					</tooltip-helper>
				</template>
				<ui-input v-model="form.address" :placeholder="$t('Enter address')" />
			</global-input>
			<global-input title="Minimum withdrawal amount">
				<ui-input v-model="form.min_amount" :placeholder="$t('Enter the minimum withdrawal amount')">
					<template #append>
						<ui-link v-if="calculationCommissions" @click="form.min_amount = calculationCommissions.min_amount">
							Min
						</ui-link>
					</template>
				</ui-input>
			</global-input>
		</div>
		<div v-if="showInfoMessages" class="rules__rule-added-badge">
			<span class="icon-container">
				<ui-icon name="check-circle" type="filled" size="lg" color="#1f9649" />
			</span>
			<span style="color: #6b6d80">{{ $t("A rule will be added:") }}</span>
			{{ $t("The crypto exchange will transfer all funds as soon as the amount on") }}
			<span class="saved-params">
				{{ showInfoMessages.ticker.toUpperCase() }} - {{ showInfoMessages.chain.toUpperCase() }}
			</span>
			{{ $t("is more than") }}
			<span class="saved-params">{{ showInfoMessages.min_amount }}</span>
			{{ $t("to the wallet") }}
			<display-hash
				type="address"
				:isShowIconCopy="false"
				:isLink="false"
				:hash="showInfoMessages.address"
				:currency-id="exchangeChainsList.find((el) => el.chain === showInfoMessages?.chain)?.currency_id"
			/>
		</div>
		<div class="rules__row mt-8">
			<div class="flex gap-12">
				<ui-button
					type="primary"
					native-type="submit"
					size="xl"
					mode="neutral"
					:disabled="isDisabledButton"
					:loading="isLoadingPostWithdrawalSetting"
				>
					{{ $t("Add rule") }}
				</ui-button>
				<ui-button
					type="outline"
					size="xl"
					@click="router.push({ name: 'exchanges-withdrawal-history', params: { slug } })"
				>
					{{ $t("Withdrawal history") }}
				</ui-button>
			</div>

			<div v-if="calculationCommissions" class="commissions">
				<div class="commissions__row">
					<span>{{ $t("Minimum withdrawal") }}:</span>
					<span class="commissions__native">
						{{ calculationCommissions.min_amount }} {{ calculationCommissions.currency.toUpperCase() }}
					</span>
					<span>~ ${{ calculationCommissions.min_amount_usd }}</span>
				</div>
				<div class="commissions__row">
					<span>{{ $t("Commission") }}:</span>
					<span class="commissions__native">
						{{ calculationCommissions.fee }} {{ calculationCommissions.currency.toUpperCase() }}
					</span>
					<span>~ ${{ calculationCommissions.fee_usd }}</span>
				</div>
			</div>
		</div>
	</form>
</template>

<style scoped lang="scss">
	.rules {
		display: flex;
		flex-direction: column;
		gap: 16px;
		&__row {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 16px;
			.commissions {
				display: flex;
				flex-direction: column;
				gap: 4px;
				font-size: 14px;
				&__row {
					display: flex;
					align-items: center;
					gap: 4px;
					color: $secondary;
				}
				&__native {
					color: $black;
				}
			}
		}
		&__instruction-button {
			cursor: pointer;
			text-decoration: underline;
			font-weight: 500;
			&:hover {
				color: rgba($white, 0.7);
			}
		}
		&__instruction {
			display: flex;
			flex-direction: column;
			gap: 8px;
			margin-top: 8px;
			padding-top: 8px;
			border-top: 1px solid $grey-light;
		}
		&__rule-added-badge {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			background: #e6faed;
			border: 1px solid #1f9649;
			border-left: 4px solid #1f9649;
			padding: 12px 16px;
			border-radius: 8px;
			font-size: 12px;
			font-weight: 500;
			line-height: 16px;
			gap: 3px;
			:deep(.ui-link) {
				font-size: 12px;
			}
			.icon-container {
				display: flex;
			}
			.saved-params {
				color: #1968e5;
			}
		}
	}
</style>
