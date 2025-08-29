<script setup lang="ts">
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general";
	import type { IProps } from "@dv-admin/components/ui/priceOutput/types";

	defineProps<IProps>();
</script>

<template>
	<div class="price">
		<span>{{ formatDollars(amountUsd) }}</span>
		<span>•</span>
		<span class="price__opacity">{{ formatAmountBlockchain(amount, currencyId) }}</span>
		<span class="price__opacity">{{ getCurrentCoin(currencyId) }}</span>
	</div>
</template>

<style scoped lang="scss">
	.price {
		color: $black;
		font-size: 14px;
		font-weight: 400;
		line-height: 20px;
		display: flex;
		align-items: center;
		gap: 4px;
		&__opacity {
			color: $secondary;
			text-transform: uppercase;
		}
	}
</style>
