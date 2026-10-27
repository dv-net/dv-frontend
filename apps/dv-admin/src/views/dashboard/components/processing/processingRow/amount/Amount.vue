<script setup lang="ts">
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general.ts";

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();
</script>

<template>
	<div class="amount">
		<span class="amount__value">
			{{ formatAmountBlockchain(data.balance.native_token, { currencyId: data.currency.id }) }}
			{{ getCurrentCoin(data.currency.id) }}
		</span>
		<span v-if="Number(data.balance.native_token_usd)" class="amount__usd">
			{{ formatDollars(data.balance.native_token_usd, { countPartMoreOneDollar: 2 }) }}
		</span>
	</div>
</template>

<style scoped lang="scss">
	.amount {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		padding-left: 12px;

		&__value {
			color: $black;
			font-size: 18px;
			font-weight: 400;
			line-height: 24px;
		}

		&__usd {
			color: $grey-opacity;
			font-size: 13px;
			font-weight: 500;
			line-height: 16px;
		}
	}
</style>
