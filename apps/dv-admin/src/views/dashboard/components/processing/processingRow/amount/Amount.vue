<script setup lang="ts">
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import { formatAmountBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();
</script>

<template>
	<div class="amount">
		{{ formatAmountBlockchain(data.balance.native_token, data.currency.id) }}
		{{ getCurrentCoin(data.currency.id) }}
	</div>
</template>

<style scoped lang="scss">
	.amount {
		color: $black;
		font-size: 18px;
		font-weight: 400;
		text-align: center;
		width: 100%;

		@include mediamin(768) {
			padding-left: 12px;
			text-align: unset;
			width: unset;
		}
	}
</style>
