<script setup lang="ts">
	import { calculationEnergyAndBandwidth } from "@dv-admin/utils/helpers/calculationEnergyAndBandwidth";
	import {
		formatAmountBlockchain,
		formatDollars,
		getCurrentBlockchain,
		getCurrentCoin
	} from "@shared/utils/helpers/general";
	import IconCorner from "@dv-admin/components/icons/dashboard/IconCorner.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { UiAnimation, UiTooltip } from "@dv.net/ui-kit";
	import IconWarning from "@dv-admin/components/icons/dashboard/IconWarning.vue";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo";
	import { storeToRefs } from "pinia";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { computed, ref } from "vue";
	import { TRANSFER_TYPES } from "@dv-admin/utils/constants/settings";
	import { settings2Animation } from "@dv.net/ui-kit/dist/helpers/animations-list";
	import IconDollarETH from "@dv-admin/components/icons/dashboard/IconDollarETH.vue";
	import { getDeclensionTransfers } from "@dv-admin/utils/helpers/declensions";
	import IconDanger from "@dv-admin/components/icons/dashboard/IconDanger.vue";
	import IconCloud from "@dv-admin/components/icons/dashboard/IconCloud.vue";
	import { getColorBorderRow } from "@dv-admin/utils/helpers/dashboard";
	import AnimatedSendIcon from "@dv-admin/views/dashboard/components/processing/components/AnimatedSendIcon.vue";

	const { processingWallets } = storeToRefs(useDashboardStore());
	const { userSettings } = storeToRefs(useUserSettingsStore());

	const { data } = defineProps<{ data: IProcessingWalletsResponse }>();

	const animationRef = ref<any>("animationRef");

	const currentTronType = computed<string | null>(() => {
		const find = userSettings.value.find((item) => item.name === "transfer_type");
		return find ? find.value : null;
	});

	const currentCountTransfers = computed(() => {
		const countValue: number = parseFloat(data?.additional_data?.tron_data?.tron_transfer_data?.max_transfers_trc20);
		if (isNaN(countValue) || !isFinite(countValue)) return "0";
		return String(Math.ceil(countValue * 0.75));
	});
</script>

<template>
	<div class="tron">
		<div
			class="tron__top"
			:class="[
				{ resources: currentTronType === TRANSFER_TYPES.RESOURCES },
				{ 'cloud-delegate': currentTronType === TRANSFER_TYPES.CLOUD_DELEGATE },
				{
					'burntrx-no-replenishment':
						currentTronType === TRANSFER_TYPES.BURNTRX && parseFloat(currentCountTransfers) > 50
				},
				currentTronType === TRANSFER_TYPES.BURNTRX ? getColorBorderRow(currentCountTransfers) : ''
			]"
		>
			<div class="tron__column blockchain">
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
							:size-icon="'sm'"
						/>
					</div>
				</div>
			</div>
			<div class="tron__column tron__column--amount">
				{{ formatAmountBlockchain(data.balance.native_token, data?.currency?.id) }}
				{{ getCurrentCoin(data?.currency?.id) }}
			</div>

			<!--	Transfer type "resources" - display bars 	-->
			<div v-if="currentTronType === TRANSFER_TYPES.RESOURCES" class="tron__column bars">
				<div class="bar">
					<div class="bar__content">
						<span class="center gap-4">
							<span class="bar__content-label">Energy</span>
							<tooltip-helper
								title="Energy"
								:text="
									$t(
										'A resource required to execute smart contracts without paying additional fees. To receive, use staking.'
									)
								"
								icon-size="sm"
							/>
						</span>
						<span>
							{{ formatDollars(calculationEnergyAndBandwidth(processingWallets, "energy").meaningStripe, "") }}
							{{ $t("out of") }}
							{{ formatDollars(data?.additional_data?.tron_data?.total_energy, "") }}
						</span>
					</div>
					<ui-tooltip
						class="bar__tooltip"
						mode="dark"
						position="top-start"
						title="Energy"
						is-gold-title
						:text="`${formatDollars(calculationEnergyAndBandwidth(processingWallets, 'energy').meaningStripe, '')} ${$t('Energy is reserved to replenish the costs incurred during previous transmissions')}`"
					>
						<div class="bar__inner">
							<div
								class="bar__totalused"
								:style="{ width: calculationEnergyAndBandwidth(processingWallets, 'energy').widthUse + '%' }"
							/>
						</div>
					</ui-tooltip>
				</div>
				<div class="bar">
					<div class="bar__content">
						<span class="center gap-4">
							<span class="bar__content-label">Bandwidth</span>
							<tooltip-helper
								title="Bandwidth"
								:text="
									$t(
										'A resource that allows you to make regular transactions (for example, transfer TRX) without a fee. To receive, use staking.'
									)
								"
								icon-size="sm"
							/>
						</span>
						<span>
							{{ formatDollars(calculationEnergyAndBandwidth(processingWallets, "bandwidth").meaningStripe, "") }}
							{{ $t("out of") }} {{ formatDollars(data?.additional_data?.tron_data?.total_bandwidth, "") }}
						</span>
					</div>
					<ui-tooltip
						class="bar__tooltip"
						mode="dark"
						position="top-start"
						title="Bandwidth"
						is-gold-title
						:text="`${formatDollars(calculationEnergyAndBandwidth(processingWallets, 'bandwidth').meaningStripe, '')} ${$t('Bandwidth is reserved to cover costs incurred during previous transmissions')}`"
					>
						<div class="bar__inner">
							<div
								class="bar__totalused"
								:style="{ width: calculationEnergyAndBandwidth(processingWallets, 'bandwidth').widthUse + '%' }"
							/>
						</div>
					</ui-tooltip>
				</div>
			</div>

			<!--	Transfer type "cloud_delegate" - display balance from dashboard 	-->
			<div v-if="currentTronType === TRANSFER_TYPES.CLOUD_DELEGATE" class="tron__column tron__column--cloud-delegate">
				<div class="cloud">
					<div class="cloud__content">
						<icon-cloud />
						<span class="cloud__name">DV.net Cloud:</span>
					</div>
					<span class="cloud__price">{{ $t("Payment price") }}: —</span>
				</div>
			</div>

			<div v-if="currentTronType === TRANSFER_TYPES.CLOUD_DELEGATE" class="tron__column tron__column--cloud-delegate">
				<span>{{ $t("Consumption today") }}: —</span>
			</div>

			<!--	Transfer type "burntrx" - display remainder 	-->
			<div v-if="currentTronType === TRANSFER_TYPES.BURNTRX" class="tron__column tron__column--burntrx">
				<div class="flex flex-y-center gap-4">
					<icon-dollar-e-t-h />
					<span>
						{{ $t("Enough for") }} {{ currentCountTransfers }}
						{{ $t(getDeclensionTransfers(Number(currentCountTransfers))) }}
					</span>
				</div>
			</div>

			<div
				v-if="currentTronType === TRANSFER_TYPES.BURNTRX && parseFloat(currentCountTransfers) < 50"
				class="tron__column tron__column--warning"
			>
				<div class="flex flex-y-center gap-8">
					<ui-tooltip
						mode="dark"
						position="top-start"
						is-gold-title
						:title="$t('We recommend to top up')"
						:text="$t('payments_dashboard', { count: currentCountTransfers })"
					>
						<icon-danger />
					</ui-tooltip>
					<span>{{ $t("We recommend to top up") }}</span>
				</div>
			</div>

			<div class="tron__column">
				<animated-send-icon :blockchain="data.blockchain" />
			</div>

			<div class="tron__column">
				<ui-tooltip
					:title="$t('TRON Processing Settings')"
					:text="
						$t(
							'In the Processing Settings section for TRON, you can change the processing mode as well as view detailed information and resource usage statistics.'
						)
					"
				>
					<router-link :to="{ name: 'dashboard-tron-settings' }">
						<ui-animation
							ref="animationRef"
							:width="26"
							:height="26"
							:icon-component="settings2Animation"
							@mouseover="animationRef && animationRef?.lottie?.play()"
							@mouseleave="animationRef && animationRef?.lottie?.stop()"
						/>
					</router-link>
				</ui-tooltip>
			</div>
		</div>
		<div class="tron__bottom">
			<div class="tron__warning">
				<icon-warning />
				<p class="tron__warning-text">
					{{ $t("We recommend staking resources") }}
				</p>
				<tooltip-helper
					:title="$t('We recommend staking resources')"
					:text="$t('Staking is a temporary blocking of TRX on the wallet to receive Energy and Bandwidth.')"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.tron {
		display: flex;
		flex-direction: column;

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

		&__top {
			padding: 12px 16px;
			display: grid;
			gap: 20px;
			border-radius: 12px 12px 0 0;
			border: 1px solid #1f9649;
			grid-template-columns: 232px 150px 1fr 1fr 45px 30px;

			&.resources {
				grid-template-columns: 232px 150px 1fr 45px 30px;
			}

			&.burntrx-no-replenishment {
				grid-template-columns: 232px 150px 1fr 45px 30px;
			}

			&.cloud-delegate {
				grid-template-columns: 232px 150px 270px 1fr 45px 30px;
			}

			&.red {
				border: 1px solid #dd4c1e;
			}

			&.green {
				border: 1px solid #1f9649;
			}

			&.orange {
				border: 1px solid #ff9e00;
			}
		}

		&__column {
			border-right: 1px solid $grey;
			display: flex;
			align-items: center;

			&--burntrx {
				color: $black;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}

			&--cloud-delegate {
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}

			.cloud {
				display: flex;
				align-items: center;
				gap: 8px;

				&__content {
					display: flex;
					align-items: center;
					gap: 4px;
				}

				&__name {
					color: $black;
					font-size: 14px;
				}
			}

			&--burntrx {
				color: $black;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}

			&--amount {
				color: $black;
				font-size: 18px;
				font-weight: 400;
				line-height: 20px;
			}

			&--warning {
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}

			&.bars {
				display: flex;
				align-items: center;
				gap: 16px;
				padding-right: 16px;
			}

			.bar {
				display: flex;
				flex-direction: column;
				max-width: 223px;
				width: 100%;
				gap: 4px;

				&__content {
					display: flex;
					justify-content: space-between;
					color: #303345;
					font-size: 12px;
					font-weight: 500;
					line-height: 16px;

					&-label {
						color: #1f9649;
					}
				}

				&:deep(.bar__tooltip) {
					.ui-tooltip__trigger {
						width: 100%;
					}
				}

				&__inner {
					overflow: hidden;
					position: relative;
					display: flex;
					background-color: #ecf0f5;
					height: 4px;
					border-radius: 16px;
					width: 100%;
				}

				&__stacked {
					position: absolute;
					left: 0;
					height: 100%;
					background-color: #dd4c1e;
					border-radius: 16px;
				}

				&__use {
					position: absolute;
					z-index: 1;
					left: 0;
					height: 100%;
					background-color: #1f9649;
					border-radius: 16px;
				}

				&__totalused {
					position: absolute;
					left: 0;
					height: 100%;
					background-color: #1f9649;
					border-radius: 16px;
				}
			}

			&:last-child {
				border-right: none;
			}
		}

		&__bottom {
			border-radius: 0 0 12px 12px;
			border: 1px solid $grey-light;
			border-top: none;
			background-color: #fff7eb;
			padding: 6px 16px;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		&__warning {
			display: flex;
			gap: 4px;

			&-text {
				color: $black;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}
		}
	}
</style>
