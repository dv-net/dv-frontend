<script setup lang="ts">
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import CurrencyIcon from "@pay/components/ui/currencyIcon/CurrencyIcon.vue";
	import type { IProps } from "@pay/views/payerForm/components/steps/cardCurrency/types.ts";
	import { usePayerFormStore } from "@pay/stores/payerForm";

	const { getAmountRate } = usePayerFormStore();

	const {
		currency,
		currencyLabel,
		mode = "white",
		height = 56,
		selected = false,
		isHoverActive = true,
		isShowPrice = true
	} = defineProps<IProps>();
</script>

<template>
	<div
		v-if="currency"
		class="card"
		:class="[`mode-${mode}`, { selected }, { 'hover-active': isHoverActive }]"
		:style="`min-height: ${height}px`"
	>
		<div class="card__block">
			<currency-icon :type="currency as CurrencyType" />
			<div class="card__inner">
				<span>{{ currency }}</span>
				<span v-if="currencyLabel" class="card__label">({{ currencyLabel }})</span>
			</div>
		</div>
		<span v-if="isShowPrice" class="card__price">≈ {{ getAmountRate(currency) }}</span>
	</div>
</template>

<style scoped lang="scss">
	.card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 8px 24px;
		border-radius: 8px;
		border: 1px solid $main-border-color;
		min-height: 56px;
		transition: border 0.3s ease-in-out;
		&.selected {
			border: 1px solid #1968e5;
		}
		&.mode-grey {
			background-color: #f6f6f6;
		}
		&.mode-white {
			background-color: $form-background;
		}
		@media (hover: hover) {
			&:hover {
				&.hover-active {
					cursor: pointer;
					border: 1px solid #1968e5;
				}
			}
		}
		&__block {
			display: flex;
			align-items: center;
			gap: 8px;
		}
		&__inner {
			display: flex;
			align-items: center;
			gap: 4px;
		}
		&__label {
			color: $main-text-grey-color;
			font-size: 16px;
			font-weight: 400;
			line-height: 20px;
		}
		&__price {
			color: $main-text-grey-color;
			font-weight: 500;
		}
	}
</style>
