<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import IconWalletBalance from "@dv-admin/components/icons/dashboard/tronSettings/IconWalletBalance.vue";
	import IconLighting from "@dv-admin/components/icons/dashboard/tronSettings/IconLighting.vue";
	import { UiIcon, UiSkeleton, UiTooltip } from "@dv.net/ui-kit";
	import { formatAmountBlockchain, formatDollars } from "@shared/utils/helpers/general";
	import { calculationEnergyAndBandwidth } from "@dv-admin/utils/helpers/calculationEnergyAndBandwidth";
	import { storeToRefs } from "pinia";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { computed } from "vue";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import type { IProcessingWalletsResponse } from "@dv-admin/utils/types/api/apiGo.ts";

	const { isLoading } = storeToRefs(useUserSettingsStore());
	const { processingWallets } = storeToRefs(useDashboardStore());

	const tron = computed<IProcessingWalletsResponse | undefined>(() =>
		processingWallets.value.find((el) => el.currency.id === "TRX.Tron")
	);
</script>

<template>
	<block-section mode="grey-border" class="tron-settings-head__container">
		<div class="tron-settings-head">
			<ui-skeleton v-if="isLoading" :rows="1" :row-height="151" first-color="#fff" :item-border-radius="16" />
			<block-section v-else class="tron-settings-head__left-side">
				<div class="hash-container">
					<span class="hash-title">{{ $t("Your processing wallet") }}:</span>
					<display-hash
						v-if="tron"
						:countPrefix="20"
						type="address"
						:hash="tron.address"
						:currency-id="tron.currency.id"
						:is-link="false"
					/>
				</div>
				<div class="tron-settings-head__balance-container">
					<IconWalletBalance class="tron-settings-head__balance-container__icon" />
					<div class="tron-settings-head__balance-container__title">{{ $t("Wallet balance") }}</div>
					<div class="tron-settings-head__balance-container__balance">
						<span>{{ formatAmountBlockchain(tron?.balance.native_token) }} TRX</span> /
						<span>{{ formatDollars(tron?.balance.native_token_usd) }}</span>
					</div>
				</div>
			</block-section>

			<ui-skeleton v-if="isLoading" :rows="1" :row-height="151" first-color="#fff" />
			<div v-else class="right">
				<div class="right__title">
					<span>{{ $t("Total energy") }}</span>
					<ui-tooltip mode="dark" :title="$t('Full information about resources')" is-gold-title :teleport="false">
						<template #text
							><slot name="infoText" />
							<div class="tooltip">
								<div class="tooltip__item">
									<span>{{ $t("Total energy available") }}:</span>
									<span class="fw-500">
										{{ formatDollars(tron?.additional_data?.tron_data?.total_energy, "") }}
									</span>
								</div>
								<div class="tooltip__item">
									<span>{{ $t("On the wallet") }}:</span>
									<span class="fw-500">
										{{ formatDollars(tron?.additional_data?.tron_data?.stacked_energy, "") }}
									</span>
								</div>
								<div class="tooltip__item">
									<span>{{ $t("Delegated from outside") }}:</span>
									<span class="fw-500">
										{{
											formatDollars(
												tron?.additional_data?.tron_data?.total_energy -
													tron?.additional_data?.tron_data?.stacked_energy,
												""
											)
										}}
									</span>
								</div>
							</div>
						</template>
						<ui-icon class="pointer" name="help" type="filled" size="md" color="#A4A5B1" />
					</ui-tooltip>
				</div>
				<div class="right__bars">
					<div class="bar">
						<div class="bar__content">
							<span class="bar__content-label">
								<icon-lighting />
								<span>{{ $t("Energy") }}</span>
							</span>
							<span class="bar__content-amount">
								{{ formatDollars(calculationEnergyAndBandwidth(processingWallets, "energy").meaningStripe, "") }}
								{{ $t("out of") }}
								{{ formatDollars(tron?.additional_data?.tron_data?.total_energy, "") }}
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
							<span class="bar__content-label">
								<ui-icon type="400" name="linked-services" color="#1F9649" />
								<span>{{ $t("Bandwidth") }}</span>
							</span>
							<span class="bar__content-amount">
								{{ formatDollars(calculationEnergyAndBandwidth(processingWallets, "bandwidth").meaningStripe, "") }}
								{{ $t("out of") }}
								{{ formatDollars(tron?.additional_data?.tron_data?.total_bandwidth, "") }}
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
			</div>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.tron-settings-head {
		display: flex;
		gap: 32px;

		&__container {
			&.block-section {
				border-radius: 16px 16px 0 0;
				padding: 32px 24px;
			}
		}

		&__left-side {
			width: 52%;
			max-width: 512px;

			&.block-section {
				padding: 0;
			}

			.hash-container {
				display: flex;
				flex-wrap: wrap;
				gap: 4px;
				padding: 15px 31px 9px 20px;
				border-bottom: 1px solid $grey;
			}

			.hash-title {
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}
		}

		.right {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			width: 48%;
			max-width: 482px;
			padding: 5px 0;
			&__title {
				display: flex;
				align-items: center;
				gap: 4px;
				color: $grey-opacity;
				font-size: 14px;
				font-weight: 400;
				line-height: 20px;
				&:deep(.ui-tooltip__content) {
					min-width: 276px;
				}
				.tooltip {
					display: flex;
					flex-direction: column;
					gap: 8px;
					&__item {
						display: flex;
						align-items: center;
						justify-content: space-between;
						color: $white;
						font-size: 12px;
						font-weight: 400;
						line-height: 16px;
					}
				}
			}
			&__bars {
				display: flex;
				flex-direction: column;
				justify-content: center;
				gap: 28px;

				.bar {
					display: flex;
					flex-direction: column;
					width: 100%;
					gap: 12px;

					&__content {
						display: flex;
						justify-content: space-between;
						color: #303345;
						font-size: 12px;
						font-weight: 500;
						line-height: 16px;

						&-label {
							display: flex;
							gap: 4px;
							color: $secondary;
							font-size: 16px;
							font-weight: 500;
							line-height: 20px;
						}

						&-amount {
							font-size: 18px;
							font-weight: 500;
							line-height: 20px;
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
						height: 8px;
						border-radius: 16px;
						width: 100%;
					}
					&__totalused {
						position: absolute;
						left: 0;
						height: 100%;
						background-color: #1f9649;
						border-radius: 16px;
					}
				}
			}
		}

		&__balance-container {
			display: grid;
			grid-template-areas: "icon title" "icon balance";
			grid-template-columns: 56px auto;
			column-gap: 16px;
			padding: 20px;

			&__icon {
				grid-area: icon;
			}

			&__title {
				grid-area: title;
				color: $secondary;
				font-size: 18px;
				font-weight: 500;
				line-height: 24px;
			}

			&__balance {
				grid-area: balance;
				color: $black;
				font-size: 28px;
				font-weight: 600;
				line-height: 40px;
			}
		}
	}
</style>
