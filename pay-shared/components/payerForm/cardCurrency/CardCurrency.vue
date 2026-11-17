<script setup lang="ts">
	import type { CurrencyType } from "@shared/utils/types/blockchain";
	import CurrencyIcon from "@pay-shared/components/ui/currencyIcon/CurrencyIcon.vue";
	import type { ICardCurrencyProps } from "./types";
	import { formatAmountBlockchain } from "@shared/utils/helpers/general.ts";
	import { blockchainCurrencyId } from "@shared/utils/constants/blockchain";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";

	const {
		currency,
		currencyLabel,
		blockchains,
		mode = "white",
		height = 56,
		selected = false,
		isHoverActive = true,
		isShowPrice = true,
		amountRate = "0"
	} = defineProps<ICardCurrencyProps>();
</script>

<template>
	<div
		v-if="currency"
		class="card"
		:class="[`mode-${mode}`, { selected }, { 'hover-active': isHoverActive }]"
		:style="`min-height: ${height}px`"
		:role="isHoverActive ? 'button' : undefined"
		:tabindex="isHoverActive ? 0 : undefined"
		@keydown.enter.space.self.prevent="($event.currentTarget as HTMLElement).click()"
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
				:class="{ active: item.isActive }"
			>
				<blockchain-icon
					:type="blockchainCurrencyId[item.blockchain.toLocaleLowerCase('en')] as BlockchainType"
					width="12px"
					height="12px"
				/>
				<span>{{ item.blockchain }}</span>
			</div>
		</div>
		<span v-if="isShowPrice" class="card__price">
			≈ {{ formatAmountBlockchain(amountRate, { thousandSeparator: "," }) }}
		</span>
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
		transition:
			background-color 0.22s ease,
			border-color 0.22s ease,
			box-shadow 0.22s ease,
			transform 0.22s ease;
		word-break: break-word;
		font-size: 16px;
		@include mediamax(768) {
			font-size: 14px;
			padding: 8px 12px;
		}
		&.mode-grey {
			background-color: #f6f6f6;
		}
		&.mode-white {
			background-color: $form-background;
		}
		&.hover-active {
			cursor: pointer;
			@media (hover: hover) {
				&:hover {
					border-color: #c5d7f8;
					background-color: $form-background;
					box-shadow: 0 10px 22px -14px rgba($main-text-link-and-price-color, 0.55);
					transform: translateY(-1px);
					.card__block :deep(.icon) {
						transform: scale(1.045);
						filter: drop-shadow(0 6px 6px rgba(20, 20, 20, 0.22));
					}
				}
			}
			&:active {
				transform: translateY(0) scale(0.985);
			}
			&:focus-visible {
				outline: 2px solid $main-text-link-and-price-color;
				outline-offset: 2px;
			}
		}
		&.selected,
		&.selected:hover {
			border-color: $main-text-link-and-price-color;
		}
		.card__block :deep(.icon) {
			transition:
				transform 0.22s ease,
				filter 0.22s ease;
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
			@extend .center;
			gap: 4px;
			padding: 4px 6px 4px 4px;
			border-radius: 100px;
			background-color: #f7f9fb;
			color: $main-text-grey-color;
			font-size: 10px;
			font-weight: 500;
			&.active {
				background-color: #d9efff;
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
