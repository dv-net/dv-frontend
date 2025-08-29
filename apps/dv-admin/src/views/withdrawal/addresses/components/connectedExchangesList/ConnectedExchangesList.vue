<script setup lang="ts">
	import { UiCollapse, UiCollapseItem, UiTabs, UiTabsItem, UiButton, UiTag, UiSkeleton } from "@dv.net/ui-kit";
	import { computed, ref, watch } from "vue";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import { storeToRefs } from "pinia";
	import { useRoute } from "vue-router";
	import { getFreshAddressee } from "@dv-admin/utils/helpers/withdrawalAddresses";
	import type { IDepositAddressesItemResponse, IDepositAddressesResponse } from "@dv-admin/utils/types/api/apiGo";
	import NotFoundMessage from "@dv-admin/components/ui/notFoundMessage/NotFoundMessage.vue";
	import { formatAmountBlockchain, getCurrentCoin } from "@shared/utils/helpers/general";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";

	const {
		connectedExchanges,
		depositAddresses,
		withdrawalCurrencyRules,
		isLoadingUpdateDepositAddresses,
		isLoadingConnectedExchanges
	} = storeToRefs(useWithdrawalStore());
	const { updateDepositAddresses } = useWithdrawalStore();
	const { exchangeList } = storeToRefs(useExchangeSettingsStore());

	const route = useRoute();
	const currencyId = route.params.currencyId as string;
	const collapse = ref<string>("");
	const tab = ref<string>("");

	const filteredDepositAddresses = computed<IDepositAddressesItemResponse[]>(() => {
		const find: IDepositAddressesResponse | undefined = depositAddresses.value.find((item) => item.slug === tab.value);
		if (!find) return [];
		const addresses: string[] = withdrawalCurrencyRules.value.addressees.map((item) => item.address);
		return find.addresses
			.filter((item) => item.currency === currencyId)
			.map((item) => {
				return { ...item, is_used: addresses.includes(item.address) };
			});
	});

	const addAddress = (address: string) => {
		if (
			withdrawalCurrencyRules.value?.addressees?.length === 1 &&
			!withdrawalCurrencyRules.value?.addressees[0]?.address
		) {
			withdrawalCurrencyRules.value.addressees = [{ ...getFreshAddressee(), address, name: tab.value }];
		} else {
			withdrawalCurrencyRules.value.addressees.push({
				...getFreshAddressee(),
				address,
				name: tab.value
			});
		}
	};

	const handleAddAllAddresses = () => {
		const addresses: string[] = withdrawalCurrencyRules.value.addressees.map((item) => item.address);
		filteredDepositAddresses.value.forEach((item) => {
			if (addresses.includes(item.address)) return;
			addAddress(item.address);
		});
	};

	const handleReplaceAllAddresses = () => {
		withdrawalCurrencyRules.value.addressees = filteredDepositAddresses.value.map((item) => ({
			...getFreshAddressee(),
			address: item.address,
			name: tab.value
		}));
	};

	watch(connectedExchanges, () => {
		if (exchangeList.value?.current_exchange) {
			tab.value = exchangeList.value.current_exchange;
			return;
		}
		if (connectedExchanges.value.length) {
			tab.value = connectedExchanges.value[0].slug;
		}
	});
</script>

<template>
	<ui-skeleton v-if="isLoadingConnectedExchanges" :rows="1" :rowHeight="48" :item-border-radius="8" />
	<div v-if="!isLoadingConnectedExchanges && connectedExchanges.length" class="exchanges">
		<ui-collapse :multiple="false" mode="custom" v-model="collapse">
			<ui-collapse-item value="1">
				<template #header>
					<div class="flex gap-4">
						{{ $t("Do you have connected crypto exchanges") }}
						<tooltip-helper
							:title="$t('Do you have connected crypto exchanges')"
							:text="
								$t(
									'Wallet addresses received by us via the API of the connected crypto exchange. Please note that not all crypto exchanges give out all the deposit addresses you create.'
								)
							"
						/>
					</div>
				</template>
				<div class="exchanges__inner">
					<div class="exchanges__top">
						<ui-tabs v-model="tab" mode="light">
							<ui-tabs-item v-for="item in connectedExchanges" :key="item.slug" :value="item.slug">
								{{ item.exchange }}
							</ui-tabs-item>
						</ui-tabs>
						<ui-button
							class="button-gap-4"
							type="secondary"
							:loading="isLoadingUpdateDepositAddresses"
							@click="updateDepositAddresses(tab)"
						>
							{{ $t("Update addresses from the exchange") }}
							<tooltip-helper
								:title="$t('Update addresses from the exchange')"
								:text="
									$t(
										'We will automatically apply the settings to the selected crypto exchange from the system templates.'
									)
								"
							/>
						</ui-button>
					</div>
					<div>
						<div v-if="filteredDepositAddresses.length" class="table">
							<div v-for="item in filteredDepositAddresses" :key="item.address" class="table__row">
								<div class="table__column">
									<display-hash
										type="address"
										:hash="item.address"
										size-icon="sm"
										:count-prefix="1000"
										:is-link="false"
										:currency-id="item.currency"
									/>
									<ui-tag v-if="item.is_used" :text="$t('Used')" mode="positive" />
								</div>
								<div class="table__column table__column--amount">
									min: {{ formatAmountBlockchain(item.min_deposit_amount, item.currency) }}
									{{ getCurrentCoin(item.currency) }}
									<tooltip-helper
										:title="`min: ${formatAmountBlockchain(item.min_deposit_amount, item.currency)} ${getCurrentCoin(item.currency)}`"
										:text="
											$t(
												'Minimum deposit amount. Many crypto exchanges have different minimum thresholds for the deposited amount for each cryptocurrency.'
											)
										"
									/>
								</div>
								<div class="table__column table__column--actions">
									<ui-button
										class="button-gap-4"
										type="secondary"
										size="sm"
										:disabled="item.is_used"
										@click="addAddress(item.address)"
									>
										{{ $t(item.is_used ? "Added" : "Add to output addresses") }}
										<tooltip-helper
											v-if="!item.is_used"
											:title="$t('Add to output addresses')"
											:text="$t('Add the crypto exchange wallet to the addresses used by the withdrawal rules.')"
										/>
									</ui-button>
								</div>
							</div>
						</div>
						<not-found-message v-else size="sm" />
					</div>
					<div class="exchanges__actions">
						<ui-button left-icon-size="lg" :disabled="!filteredDepositAddresses.length" @click="handleAddAllAddresses">
							{{ $t("Add all") }}
						</ui-button>
						<ui-button type="secondary" :disabled="!filteredDepositAddresses.length" @click="handleReplaceAllAddresses">
							{{ $t("Replace all") }}
						</ui-button>
					</div>
				</div>
			</ui-collapse-item>
		</ui-collapse>
	</div>
</template>

<style scoped lang="scss">
	.exchanges {
		&:deep(.ui-collapse-item__content) {
			padding: 0;
		}
		&__inner {
			display: flex;
			flex-direction: column;
		}
		&__top {
			display: flex;
			justify-content: space-between;
			margin: 12px 0 16px;
		}
		&__actions {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-top: 16px;
		}
		.table {
			display: flex;
			flex-direction: column;
			border-radius: 8px;
			border: 1px solid $grey;
			max-height: 156px;
			overflow-y: auto;
			&__row {
				display: grid;
				grid-template-columns: 1fr auto auto;
				padding: 12px;
				border-bottom: 1px solid $grey;
				min-height: 52px;
				gap: 12px;
				&:last-child {
					border-bottom: none;
				}
			}
			&__column {
				display: flex;
				align-items: center;
				gap: 4px;
				&--amount {
					color: $black;
					font-size: 14px;
					font-weight: 400;
					line-height: 20px;
				}
				&--actions {
					justify-self: end;
				}
			}
		}
		.button-gap-4 {
			:deep(.ui-button__content) {
				gap: 4px;
			}
		}
	}
</style>
