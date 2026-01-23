<script setup lang="ts">
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { UiButton, UiInput, UiTooltip } from "@dv.net/ui-kit";
	import { computed, ref } from "vue";
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import type { IProcessingWalletsAssets } from "@dv-admin/utils/types/api/apiGo.ts";

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();

	const selectedAsset = ref<IProcessingWalletsAssets | null>(null);
	const amountWithdrawProcessing = ref<number | null>(null);
	const amountUsdWithdrawProcessing = ref<number | null>(null);

	const isDisabledAllAmount = computed<boolean>(() => !Boolean(selectedAsset.value));

	const updateAmounts = (asset: IProcessingWalletsAssets) => {
		amountWithdrawProcessing.value = parseFloat(formatAmountBlockchain(asset.amount, asset.currency_id));
		amountUsdWithdrawProcessing.value = parseFloat(formatDollars(asset.amount_usd, ""));
	};

	const selectAsset = (asset: IProcessingWalletsAssets) => {
		selectedAsset.value = asset;
		updateAmounts(asset);
	};

	const selectAllAmount = () => {
		if (!selectedAsset.value) return;
		updateAmounts(selectedAsset.value);
	};

	const handleChangeAmount = () => {
		if (!selectedAsset.value || amountWithdrawProcessing.value === null) {
			return;
		}
		const assetAmount = parseFloat(selectedAsset.value.amount);
		const assetAmountUsd = parseFloat(selectedAsset.value.amount_usd);
		if (assetAmount === 0 || isNaN(assetAmount) || isNaN(assetAmountUsd)) {
			return;
		}
		const exchangeRate: number = assetAmountUsd / assetAmount;
		amountUsdWithdrawProcessing.value = amountWithdrawProcessing.value * exchangeRate;
	};
</script>

<template>
	<div class="block">
		<div class="block__column">
			<span class="block__label">{{ $t("Select a token") }}</span>
			<div class="block__tokens">
				<template v-for="item in data.assets" :key="item.currency_id">
					<template v-if="!selectedAsset || selectedAsset.currency_id !== item.currency_id">
						<ui-tooltip
							:text="`${formatAmountBlockchain(item.amount, item.currency_id)} • ${formatDollars(item.amount_usd)}`"
						>
							<button class="item" @click="selectAsset(item)">
								<span class="item__content">
									<blockchain-icon :type="item.currency_id as BlockchainType" width="16px" height="16px" />
									<span>{{ getCurrentCoin(item.currency_id) }}</span>
								</span>
							</button>
						</ui-tooltip>
					</template>
					<button v-else class="item" @click="selectAsset(item)">
						<span class="item__content">
							<blockchain-icon :type="item.currency_id as BlockchainType" width="16px" height="16px" />
							<span>{{ getCurrentCoin(item.currency_id) }}</span>
						</span>
						<span class="item__price">
							{{ formatAmountBlockchain(selectedAsset.amount, selectedAsset.currency_id) }} •
							{{ formatDollars(selectedAsset.amount_usd) }}
						</span>
					</button>
				</template>
			</div>
		</div>
		<div class="block__column">
			<span class="block__label">{{ $t("Transfer amount") }}</span>
			<form class="form">
				<ui-input v-model="amountWithdrawProcessing" type="number" is-empty-value-null @input="handleChangeAmount">
					<template #append>
						<div class="form__inner">
							<span v-if="amountUsdWithdrawProcessing" class="form__usd">
								≈ {{ formatDollars(amountUsdWithdrawProcessing) }}
							</span>
							<ui-button type="secondary" size="lg" :disabled="isDisabledAllAmount" @click="selectAllAmount">
								{{ $t("All") }}
							</ui-button>
						</div>
					</template>
				</ui-input>
				<ui-button mode="neutral" size="xl">{{ $t("Withdraw") }}</ui-button>
			</form>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.block {
		display: grid;
		grid-template-columns: 1fr 385px;
		gap: 20px;
		margin: 16px 8px 0;
		padding: 16px 0;
		border-top: 1px solid #e1e8f1;
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
				gap: 8px;
				padding: 4px 12px;
				border-radius: 12px;
				border: 1px solid #e1e8f1;
				background-color: #fff;
				min-height: 40px;
				&.selected {
					border: 1px solid #1968e5;
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
					color: #a4a5b1;
					font-size: 14px;
					font-weight: 400;
					line-height: 20px;
				}
			}
		}
		.form {
			display: flex;
			align-items: center;
			gap: 20px;
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
			&__usd {
				flex-shrink: 0;
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				line-height: 16px;
			}
		}
	}
</style>