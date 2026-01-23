<script setup lang="ts">
	import { getCurrentBlockchain } from "@shared/utils/helpers/general.ts";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import IconCorner from "@dv-admin/components/icons/dashboard/IconCorner.vue";
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();
</script>

<template>
	<div></div>
	<div class="blockchain">
		<blockchain-icon :type="data.currency.id" width="40px" height="40px" />
		<div class="blockchain__content">
			<span class="blockchain__title">
				{{ getCurrentBlockchain(data.currency.id) }}
			</span>
			<div class="blockchain__hash">
				<icon-corner />
				<display-hash
					type="address"
					:hash="data.address"
					:count-prefix="5"
					:is-link="false"
					:currency-id="data.currency.id"
					size-icon="sm"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.blockchain {
		display: flex;
		align-items: center;
		gap: 8px;
		&__title {
			color: $black;
			font-size: 18px;
			font-weight: 500;
			line-height: 24px;
		}
		&__content {
			display: flex;
			flex-direction: column;
		}
		&__hash {
			display: flex;
		}
	}
</style>