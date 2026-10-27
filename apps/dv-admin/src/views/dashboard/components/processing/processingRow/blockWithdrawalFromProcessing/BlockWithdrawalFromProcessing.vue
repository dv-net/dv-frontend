<script setup lang="ts">
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { UiButton, UiForm, UiFormItem, UiInput, UiTooltip } from "@dv.net/ui-kit";
	import { computed, ref, watch } from "vue";
	import type {
		IProcessingWalletsResponse,
		IWithdrawalFromProcessingRequest
	} from "@dv-admin/utils/types/api/apiGo.ts";
	import {
		formatAmountBlockchain,
		formatDollars,
		generateUUID,
		getCurrentCoin
	} from "@shared/utils/helpers/general.ts";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import type { IProcessingWalletsAssets } from "@dv-admin/utils/types/api/apiGo.ts";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";

	const { t } = useI18n();
	const { notify } = useNotifications();
	const { postWithdrawalFromProcessing } = useDashboardStore();

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();

	const formRef = ref<HTMLFormElement | null>(null);
	const selectedAsset = ref<IProcessingWalletsAssets | null>(null);
	const amountUsdWithdrawProcessing = ref<number | null>(null);
	const defaultFormValues = {
		address_to: "",
		amount: null,
		currency_id: "",
		totp: "",
		request_id: ""
	};
	const form = ref<IWithdrawalFromProcessingRequest>({ ...defaultFormValues });

	const isDisabledAllAmount = computed<boolean>(() => !Boolean(selectedAsset.value));
	const isDisabledBtnWithdraw = computed<boolean>(() => !Boolean(selectedAsset.value));
	const rulesForm = computed<UiFormRules>(() => {
		return {
			address_to: [{ required: true, message: t("Enter address") }],
			amount: [
				{ required: true, message: t("Enter the amount") },
				{
					validator: () => Boolean(Number(form.value.amount) <= Number(selectedAsset.value?.amount)),
					message: t("Enter correct amount")
				}
			]
		};
	});

	const showTokenSelect = computed<boolean>(() => data.assets.length > 1);

	const tokenBalanceLabel = (asset: IProcessingWalletsAssets) => {
		const amount = formatAmountBlockchain(asset.amount, { currencyId: asset.currency_id });
		const fiatAmount = formatDollars(asset.amount_usd, { currency: "", countPartMoreOneDollar: 2 });
		if (amount === "0" || fiatAmount === "0") return amount;
		return `${amount} • ${formatDollars(asset.amount_usd, { countPartMoreOneDollar: 2 })}`;
	};

	const tokenTooltipAmount = (asset: IProcessingWalletsAssets) =>
		`${formatAmountBlockchain(asset.amount, { currencyId: asset.currency_id })} ${getCurrentCoin(asset.currency_id)}`;

	const tokenTooltipUsd = (asset: IProcessingWalletsAssets) =>
		formatDollars(asset.amount_usd, { countPartMoreOneDollar: 2 });

	const updateAmounts = (asset: IProcessingWalletsAssets) => {
		form.value.amount = parseFloat(formatAmountBlockchain(asset.amount, { currencyId: asset.currency_id }));
		amountUsdWithdrawProcessing.value = parseFloat(asset.amount_usd);
	};

	const selectAsset = (asset: IProcessingWalletsAssets) => {
		if (selectedAsset.value?.currency_id === asset.currency_id) return;
		form.value.currency_id = asset.currency_id;
		selectedAsset.value = asset;
		form.value.amount = null;
		amountUsdWithdrawProcessing.value = null;
	};

	const preselectAsset = () => {
		if (!data.assets.length) {
			selectedAsset.value = null;
			form.value.currency_id = "";
			return;
		}
		const current = data.assets.find((asset) => asset.currency_id === selectedAsset.value?.currency_id);
		const native = data.assets.find((asset) => asset.currency_id === data.currency.id);
		const asset = current ?? native ?? data.assets[0];
		if (current) {
			selectedAsset.value = current;
			return;
		}
		selectAsset(asset);
	};

	const selectAllAmount = () => {
		if (!selectedAsset.value) return;
		updateAmounts(selectedAsset.value);
	};

	const handleChangeAmount = () => {
		if (!selectedAsset.value || form.value.amount === null) {
			amountUsdWithdrawProcessing.value = null;
			return;
		}
		const assetAmount = parseFloat(selectedAsset.value.amount);
		const assetAmountUsd = parseFloat(selectedAsset.value.amount_usd);
		if (assetAmount === 0 || isNaN(assetAmount) || isNaN(assetAmountUsd)) {
			amountUsdWithdrawProcessing.value = null;
			return;
		}
		const exchangeRate: number = assetAmountUsd / assetAmount;
		amountUsdWithdrawProcessing.value = form.value.amount * exchangeRate;
	};

	const withdrawHandler = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			if (!form.value?.currency_id) {
				notify(t("Select a coin for withdrawal"));
				return;
			}
			form.value.request_id = generateUUID();
			await postWithdrawalFromProcessing(form.value, clearForm);
		} catch (error: any) {
			console.error(error);
		}
	};

	const clearForm = () => {
		form.value = { ...defaultFormValues };
		selectedAsset.value = null;
		amountUsdWithdrawProcessing.value = null;
		formRef.value?.resetValidate();
		preselectAsset();
	};

	watch(() => data.assets, preselectAsset, { immediate: true });

	defineExpose({
		clearForm
	});
</script>

<template>
	<div class="block">
		<div v-if="showTokenSelect" class="block__column">
			<span class="block__label">{{ $t("Select a token") }}</span>
			<div class="block__tokens">
				<ui-tooltip
					v-for="item in data.assets"
					:key="item.currency_id"
					:disabled="selectedAsset?.currency_id === item.currency_id"
					:title="`${$t('Balances')} ${getCurrentCoin(item.currency_id)}`"
				>
					<template #text>
						<span class="token-tooltip">
							<span class="token-tooltip__row">
								<span class="token-tooltip__label">{{ $t("Coin amount") }}:</span>
								<span class="token-tooltip__value">{{ tokenTooltipAmount(item) }}</span>
							</span>
							<span class="token-tooltip__row">
								<span class="token-tooltip__label">{{ $t("Dollar value") }}:</span>
								<span class="token-tooltip__value">{{ tokenTooltipUsd(item) }}</span>
							</span>
						</span>
					</template>
					<button
						class="item"
						:class="{ selected: selectedAsset?.currency_id === item.currency_id }"
						@click="selectAsset(item)"
					>
						<span class="item__content">
							<blockchain-icon :type="item.currency_id as BlockchainType" width="16px" height="16px" />
							<span>{{ getCurrentCoin(item.currency_id) }}</span>
						</span>
						<span class="item__price">
							<span class="item__price-inner">{{ tokenBalanceLabel(item) }}</span>
						</span>
					</button>
				</ui-tooltip>
			</div>
		</div>
		<ui-form class="form" ref="formRef" @submit.prevent="withdrawHandler" :rules="rulesForm" :model="form">
			<ui-form-item class="input-sum" name="amount" :label="$t('Transfer amount')">
				<ui-input
					v-model="form.amount"
					type="number"
					is-empty-value-null
					@input="handleChangeAmount"
					:placeholder="$t('Enter the amount')"
				>
					<template #append>
						<div class="input-sum__inner">
							<span v-if="amountUsdWithdrawProcessing" class="input-sum__amount">
								≈ {{ formatDollars(amountUsdWithdrawProcessing, { countPartMoreOneDollar: 2 }) }}
							</span>
							<ui-button type="secondary" size="lg" :disabled="isDisabledAllAmount" @click="selectAllAmount">
								{{ $t("All") }}
							</ui-button>
						</div>
					</template>
				</ui-input>
			</ui-form-item>
			<ui-form-item name="address_to" :label="$t('Where to withdraw')">
				<ui-input v-model="form.address_to" :placeholder="$t('Enter address')" />
			</ui-form-item>
			<ui-button
				class="w-full mt-28"
				native-type="submit"
				mode="neutral"
				size="xl"
				left-icon-name="send"
				left-icon-type="400"
				:disabled="isDisabledBtnWithdraw"
			>
				{{ $t("Withdraw") }}
			</ui-button>
		</ui-form>
	</div>
</template>

<style scoped lang="scss">
	.block {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin: 16px 8px 0;
		padding: 16px 0 0;
		border-top: 1px solid $grey;
		&__label {
			color: $secondary;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
		&__column {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		&__tokens {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 6px;
			.item {
				display: flex;
				align-items: center;
				padding: 4px 12px;
				border-radius: 12px;
				border: 1px solid $grey;
				background-color: $white;
				min-height: 40px;
				transition: border-color 0.25s ease;

				@media (hover: hover) {
					&:not(.selected):hover {
						border-color: $blue;
					}
				}

				&.selected {
					border-color: $blue;

					.item__price {
						grid-template-columns: 1fr;
						margin-left: 8px;
						opacity: 1;
					}
				}
				&__content {
					display: flex;
					align-items: center;
					gap: 4px;
					color: $black;
					font-size: 14px;
					font-weight: 700;
					line-height: 24px;
				}
				&__price {
					display: grid;
					grid-template-columns: 0fr;
					margin-left: 0;
					opacity: 0;
					transition:
						grid-template-columns 0.25s ease,
						margin-left 0.25s ease,
						opacity 0.2s ease;
				}
				&__price-inner {
					overflow: hidden;
					min-width: 0;
					color: $grey-opacity;
					font-size: 14px;
					font-weight: 400;
					line-height: 20px;
					white-space: nowrap;
				}
			}
		}
		.form {
			flex-grow: 1;
			display: grid;
			grid-template-columns: 300px 1fr 280px;
			gap: 20px;
			.input-sum {
				&:deep(.ui-input) {
					justify-content: space-between;
					.ui-input__inner {
						width: 100px;
					}
				}
				&__inner {
					display: flex;
					align-items: center;
					gap: 12px;
				}
				&__amount {
					overflow: hidden;
					display: flex;
					align-items: center;
					flex-shrink: 0;
					color: $secondary;
					font-size: 14px;
					font-weight: 500;
					line-height: 16px;
					max-width: 100px;
					white-space: nowrap;
				}
			}
		}
	}

	.token-tooltip {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 14px;
		line-height: 20px;

		&__row {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			gap: 16px;
		}

		&__label {
			color: $grey-opacity;
			font-weight: 400;
		}

		&__value {
			color: #fff;
			font-weight: 500;
			white-space: nowrap;
		}
	}
</style>
