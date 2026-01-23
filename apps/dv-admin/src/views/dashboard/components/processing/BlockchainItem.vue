<script setup lang="ts">
	import { formatAmountBlockchain, getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general.ts";
	import IconCorner from "@dv-admin/components/icons/dashboard/IconCorner.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { UiTooltip } from "@dv.net/ui-kit";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import IconDollarETH from "@dv-admin/components/icons/dashboard/IconDollarEth.vue";
	import { getDeclensionTransfers } from "@dv-admin/utils/helpers/declensions.ts";
	import IconDanger from "@dv-admin/components/icons/dashboard/IconDanger.vue";
	import { getColorBorderRow } from "@dv-admin/utils/helpers/dashboard.ts";
	import AnimatedSendIcon from "@dv-admin/views/dashboard/components/processing/AnimatedSendIcon.vue";

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();
</script>

<template>
	<div :class="['row', getColorBorderRow(data?.additional_data?.evm_data?.max_transfers_erc20)]">
		<div class="blockchain row__column">
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

		<div class="row__column amount">
			{{ formatAmountBlockchain(data.balance.native_token, data?.currency?.id) }}
			{{ getCurrentCoin(data?.currency?.id) }}
		</div>

		<div class="row__column row__column--payments">
			<div class="row__content">
				<icon-dollar-e-t-h />
				<span>
					{{ $t("Enough for") }} {{ data?.additional_data?.evm_data?.max_transfers_erc20 }}
					{{ $t(getDeclensionTransfers(Number(data?.additional_data?.evm_data?.max_transfers_erc20))) }}
				</span>
			</div>
		</div>

		<div
			:class="{
				'row__column row__column--warning': true,
				inactive: parseFloat(data?.additional_data?.evm_data?.max_transfers_erc20) >= 50
			}"
		>
			<div v-if="parseFloat(data?.additional_data?.evm_data?.max_transfers_erc20) < 50" class="row__content">
				<ui-tooltip
					mode="dark"
					position="top-start"
					is-gold-title
					:title="$t('We recommend to top up')"
					:text="$t('payments_dashboard', { count: data?.additional_data?.evm_data?.max_transfers_erc20 })"
				>
					<icon-danger />
				</ui-tooltip>
				<span class="text-recommended-top-up">{{ $t("We recommend to top up") }}</span>
			</div>
		</div>

		<div class="row__column row__column--payments">
			<animated-send-icon :blockchain="data.blockchain" />
		</div>
	</div>
</template>

<style scoped lang="scss">
	.row {
		display: grid;
		grid-template-columns: 1fr 180px 1fr 1fr 30px;
		gap: 20px;
		padding: 12px 16px;
		border-radius: 12px;
		border: 1px solid #ff9e00;

		&.red {
			border: 1px solid #dd4c1e;
		}

		&.green {
			border: 1px solid #1f9649;
		}

		&.orange {
			border: 1px solid #ff9e00;
		}

		&__column {
			border-right: 1px solid $grey;
			display: flex;
			align-items: center;

			.text-recommended-top-up {
				line-height: 16px;
				max-width: 180px;
			}

			&--payments {
				color: $black;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}

			&--warning {
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}

			&:last-child,
			&.inactive {
				border-right: none;
			}
		}

		&__content {
			display: flex;
			align-items: center;
			gap: 8px;
		}

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

		.amount {
			color: $black;
			font-size: 18px;
			font-weight: 400;
			line-height: 20px;
		}
	}
</style>
