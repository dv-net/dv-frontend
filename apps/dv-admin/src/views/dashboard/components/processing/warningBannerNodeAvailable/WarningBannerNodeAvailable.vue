<script setup lang="ts">
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import ChainInfo from "@dv-admin/views/dashboard/components/processing/processingRow/chainInfo/ChainInfo.vue";
	import { computed } from "vue";
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import { UiButton, UiIcon } from "@dv.net/ui-kit";

	const { currencyId } = defineProps<{ currencyId: BlockchainType }>();

	const fakeData = computed<IProcessingWalletsResponse>(() => ({
		address: "unknown",
		assets: [],
		balance: {
			native_token: "0",
			native_token_usd: "0"
		},
		blockchain: "",
		currency: {
			id: currencyId,
			code: "",
			name: "",
			blockchain: "",
			precision: 6,
			is_bitcoin_like: false,
			is_evm_like: false
		}
	}));
</script>

<template>
	<div class="warning-banner">
		<div class="warning-banner__inner">
			<div class="warning-banner__column">
				<chain-info :data="fakeData" />
			</div>
			<div class="warning-banner__column">
				<div class="flex flex-y-center gap-16 ml-12 w-full">
					<div class="plate">
						<ui-icon type="filled" name="error" />
						<span class="plate__text">
							{{ $t("The node is temporarily unavailable. Balance and payment information are currently unavailable") }}
						</span>
					</div>
					<ui-button type="secondary" :to="{ name: 'support' }">{{ $t("Support") }}</ui-button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.warning-banner {
		display: flex;
		padding: 12px 8px;
		border-radius: 12px;
		border: 1px solid #dd4c1e;
		flex-shrink: 0;
		min-height: 64px;
		&__inner {
			flex-grow: 1;
			display: grid;
			grid-template-columns: 230px 1fr;
		}
		&__column {
			display: flex;
			align-items: center;
			padding: 0 8px;
			&:not(:last-child) {
				border-right: 1px solid #e1e8f1;
			}
			.plate {
				min-height: 32px;
				display: flex;
				padding: 6px 8px;
				align-items: center;
				gap: 8px;
				flex-grow: 1;
				border-radius: 10px;
				border: 1px solid #dd4c1e;
				color: #dd4c1e;
				font-size: 12px;
				font-weight: 500;
				line-height: 16px;
			}
		}
	}
</style>