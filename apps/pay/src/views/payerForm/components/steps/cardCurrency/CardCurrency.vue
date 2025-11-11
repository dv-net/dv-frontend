<script setup lang="ts">
	import type { CurrencyType } from "@pay/utils/types/blockchain";
	import CurrencyIcon from "@pay/components/ui/currencyIcon/CurrencyIcon.vue";
	import type { IProps } from "@pay/views/payerForm/components/steps/cardCurrency/types.ts";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { formatAmountBlockchain } from "@shared/utils/helpers/general.ts";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";

	const { getAmountRate } = usePayerFormStore();

	const {
		currency,
		currencyLabel,
		blockchains,
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
				<span class="card__currency">{{ currency }}</span>
				<span v-if="currencyLabel" class="card__label">{{ currencyLabel }}</span>
			</div>
		</div>
		<div class="card__blockchains">
			<div
				v-for="item in blockchains"
				:key="item.blockchain"
				class="card__blockchain"
				:class="{ 'active': item.isActive }"
			>
				<blockchain-icon :type="blockchainCurrencyId[item.blockchain.toLocaleLowerCase('en')] as BlockchainType" width="12px" height="12px" />
				<span>{{ item.blockchain }}</span>
			</div>
		</div>
		<span v-if="isShowPrice" class="card__price">≈ {{ formatAmountBlockchain(getAmountRate(currency), undefined, undefined, "—", true) }}</span>
	</div>
</template>

<style scoped lang="scss">
	.card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 20px;
		border-radius: 12px;
		border: 1px solid $main-border-color;
		transition: border 0.3s ease-in-out;
		word-break: break-word;
		font-size: 16px;
		@include mediamax(768) {
			font-size: 14px;
			padding: 8px 12px;
		}
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
			gap: 12px;
		}
		&__inner {
			display: flex;
			flex-direction: column;
			justify-content: center;
			min-width: 76px;
			padding-right: 8px;
		}
		&__currency {
			font-size: 16px;
			font-weight: 500;
			line-height: 20px;
		}
		&__label {
			color: $main-text-grey-color;
			font-size: 10px;
			font-weight: 500;
			line-height: 12px;
		}
		&__blockchains {
			flex-grow: 1;
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 4px;
			padding: 0 38px 0 0;
			@include mediamax(768) {
				display: none;
			}
		}
		&__blockchain {
			display: flex;
			align-items: center;
			gap: 4px;
			padding: 4px 6px 4px 4px;
			@extend .center;
			border-radius: 100px;
			background-color: #f7f9fb;
			color: $main-text-grey-color;
			font-size: 10px;
			font-weight: 500;
			&.active {
				background-color: #D9EFFF;
				color: #303345;
			}
		}
		&__price {
			flex-shrink: 0;
			color: $main-text-grey-color;
			font-weight: 500;
		}
	}
</style>
