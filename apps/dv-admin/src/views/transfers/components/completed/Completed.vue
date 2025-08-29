<script setup lang="ts">
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { computed, type Ref, ref } from "vue";
	import LayoutBlock from "@dv-admin/views/transfers/components/layoutBlock/LayoutBlock.vue";
	import { UiTabs, UiTabsItem, UiIcon, UiCollapse, UiCollapseItem, UiConfirm, UiPagination } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import { useTransferStore } from "@dv-admin/stores/transfer";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general";
	import { formatDate, timeDifference } from "@dv-admin/utils/helpers/dateParse";
	import type { IPagination, ITransferItem } from "@dv-admin/utils/types/api/apiGo";
	import { copiedText } from "@shared/utils/helpers/general";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import ShowStatusGeneral from "@dv-admin/components/ui/showStatusGeneral/ShowStatusGeneral.vue";
	import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";

	const {
		transferCompleted,
		transferFailed,
		transferAll,
		transferAllPagination,
		transferFailedPagination,
		transferCompletedPagination
	} = storeToRefs(useTransferStore());
	const { getTransferFailed, getTransferAll, getTransferCompleted, deleteTransfer } = useTransferStore();
	const { userRootSystemInfo } = storeToRefs(useSystemSettingsStore());

	const collapse = ref<string>("");
	const tab = ref<string>("1");
	const isShowAll = ref<boolean>(false);

	const transferData: Record<
		string,
		{
			data: Ref<ITransferItem[]>;
			pagination: Ref<IPagination | null>;
			fetchData: () => Promise<void>;
		}
	> = {
		"1": { data: transferAll, pagination: transferAllPagination, fetchData: getTransferAll },
		"2": { data: transferCompleted, pagination: transferCompletedPagination, fetchData: getTransferCompleted },
		"3": { data: transferFailed, pagination: transferFailedPagination, fetchData: getTransferFailed }
	};

	const transferFiltered = computed(() => transferData[tab.value].data.value);
	const transferFilteredPagination = computed(() => transferData[tab.value].pagination.value);

	const changeTabs = () => {
		collapse.value = "";
	};

	const fetchTransferData = async () => {
		await transferData[tab.value].fetchData();
		collapse.value = "";
	};
</script>

<template>
	<layout-block
		:title="$t('Completed tasks')"
		:count="transferAllPagination?.total || 0"
		:is-show-button="false"
		v-model:is-show-all="isShowAll"
		class="tasks"
	>
		<template #tabs>
			<ui-tabs mode="light" v-model="tab" @change="changeTabs">
				<ui-tabs-item value="1">{{ $t("All") }}</ui-tabs-item>
				<ui-tabs-item value="2">{{ $t("Success") }}</ui-tabs-item>
				<ui-tabs-item value="3">
					<div class="tasks__inner-tab">
						<span>{{ $t("Ended with an error") }}</span>
						<span v-if="transferFailedPagination?.total">({{ transferFailedPagination.total }})</span>
					</div>
				</ui-tabs-item>
			</ui-tabs>
		</template>
		<div class="flex flex-column gap-16">
			<UiCollapse
				v-if="transferFiltered.length"
				class="global-collapse"
				:multiple="false"
				mode="custom"
				v-model="collapse"
			>
				<UiCollapseItem
					v-for="(item, index) in transferFiltered"
					:value="index"
					:key="index"
					icon-closed="keyboard-arrow-down"
					icon-opened="keyboard-arrow-up"
				>
					<template #header>
						<div class="header">
							<div class="header__item column-id" @click.alt.stop="copiedText(String(item.number))">
								<span>ID:</span>
								<span>{{ item.number }}</span>
							</div>
							<div class="header__item column-event">
								<div class="column-event__icon">
									<ui-icon type="400" name="sync-alt" size="xs" />
								</div>
								<p class="column-event__text">
									{{ $t(item.kind === "from_address" ? "Withdrawal from hot" : "Withdrawal from processing") }}
								</p>
							</div>
							<div class="header__item price">
								<blockchain-icon :type="item.currency_id" width="16px" height="16px" />
								<span>{{ formatDollars(item.amount_usd) }}</span>
								<span class="price__info">
									({{ formatAmountBlockchain(item.amount, item?.currency_id) }} {{ getCurrentCoin(item?.currency_id) }})
								</span>
							</div>
							<div class="header__item time">
								{{
									timeDifference(
										item.updated_at,
										item.created_at,
										$t("staticStrings.h"),
										$t("staticStrings.min"),
										$t("staticStrings.s")
									)
								}}
							</div>
							<div class="header__item">
								<show-status-general :status="item.status" />
								<ui-confirm :method="() => deleteTransfer([item.id])" @click.stop :title="$t('Delete transfer?')">
									<ui-icon
										v-if="item.status === 'failed' && userRootSystemInfo?.app_profile === 'dev'"
										class="header__item-delete"
										name="delete"
										type="400"
										size="sm"
										color="#dd4c1e"
									/>
								</ui-confirm>
							</div>
						</div>
					</template>
					<div class="flex flex-column">
						<div class="content">
							<div class="content__item">
								<span class="content__inner-label">{{ $t("From the wallet") }}:</span>
								<div class="content__inner-wallet">
									<template v-if="item?.from_addresses?.length">
										<display-hash
											v-for="from in item.from_addresses"
											:key="from"
											type="address"
											size-icon="xs"
											size-hash="md"
											:currency-id="item.currency_id"
											:hash="from"
										/>
									</template>
									<div v-else>—</div>
								</div>
							</div>
							<div class="content__item">
								<span class="content__inner-label">{{ $t("To the wallet") }}:</span>
								<div class="content__inner-wallet">
									<template v-if="item?.to_addresses?.length">
										<display-hash
											v-for="to in item.to_addresses"
											:key="to"
											type="address"
											:is-link="false"
											size-icon="xs"
											size-hash="md"
											:currency-id="item.currency_id"
											:hash="to"
										/>
									</template>
									<div v-else>—</div>
								</div>
							</div>
							<div class="content__item">
								<span class="content__inner-label">{{ $t("Date") }}:</span>
								<span>{{ formatDate(item.created_at) }}</span>
							</div>
							<div v-if="item?.tx_hash" class="content__item content__item--hash">
								<span>{{ $t("Transaction hash") }}:</span>
								<display-hash
									type="transaction"
									size-icon="xs"
									size-hash="md"
									:currency-id="item.currency_id"
									:count-prefix="10"
									:hash="item?.tx_hash"
								/>
							</div>
						</div>
						<div v-if="item.message" class="error">
							<span class="fw-700">{{ $t("Error") }}:</span>
							<span class="error__message">{{ item.message }}</span>
						</div>
					</div>
				</UiCollapseItem>
			</UiCollapse>
			<div class="notFound" v-else>
				{{ $t("Not found") }}
			</div>

			<div
				v-if="
					transferFiltered.length &&
					transferFilteredPagination &&
					transferFilteredPagination.total > transferFilteredPagination.page_size
				"
			>
				<ui-pagination
					:per-page="transferFilteredPagination.page_size"
					:total="transferFilteredPagination.total"
					:isShowPerPageSelect="false"
					v-model:page="transferFilteredPagination.page"
					@update:page="fetchTransferData"
				/>
			</div>
		</div>
	</layout-block>
</template>

<style scoped lang="scss">
	.tasks {
		&__inner-tab {
			display: flex;
			align-items: center;
			gap: 4px;
		}

		&:deep(.ui-tabs) {
			width: max-content;
			margin: 8px 0 16px;
		}
	}

	.header {
		display: grid;
		grid-template-columns: 90px 170px 1fr 100px 170px;
		gap: 20px;
		flex-grow: 1;

		&__item {
			position: relative;
			display: flex;
			align-items: center;

			&:not(:last-child) {
				border-right: 1px solid $grey;
			}

			&-delete {
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
				right: 10px;
			}
		}
	}

	.column-id {
		display: flex;
		align-items: center;
		gap: 4px;

		& > span:first-child {
			color: $grey-opacity;
		}
	}

	.column-event {
		display: flex;
		align-items: center;
		gap: 8px;

		&__icon {
			display: flex;
			width: 20px;
			height: 20px;
			justify-content: center;
			align-items: center;
			flex-shrink: 0;
			color: $blue;
			border-radius: 4px;
			background: $blue-light;
		}

		&__text {
			color: $secondary;
			font-size: 12px;
			font-weight: 500;
			line-height: 16px;
		}
	}

	.price {
		display: flex;
		align-items: center;
		gap: 4px;

		&__info {
			color: $grey-opacity;
		}
	}

	.time {
		color: $grey-opacity;
	}

	.content {
		border-top: 1px solid $grey;
		padding: 12px 0;
		display: grid;
		grid-template-columns: 1fr 1fr 115px 190px;
		column-gap: 20px;

		&__item {
			display: flex;
			flex-direction: column;
			gap: 4px;

			&--hash {
				color: $secondary;
				font-size: 12px;
				font-weight: 500;
				line-height: 16px;
				display: flex;
				flex-direction: column;
				gap: 4px;
			}

			&:not(:last-child) {
				border-right: 1px solid $grey;
			}
		}

		&__inner-label {
			color: #a4a5b1;
		}

		&__inner-wallet {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}
	}

	.error {
		display: flex;
		flex-direction: column;
		border-top: 1px solid $grey;
		gap: 4px;
		color: #dd4c1e;
		font-size: 12px;
		font-weight: 400;
		line-height: 16px;
		padding-top: 12px;

		&__message {
			max-height: 100px;
			overflow-y: auto;
			word-break: break-word;
		}
	}

	.notFound {
		display: flex;
		justify-content: center;
	}
</style>
