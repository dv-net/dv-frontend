<script setup lang="ts">
	import { UiCollapse, UiCollapseItem, UiIcon, UiSkeleton } from "@dv.net/ui-kit";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { computed, ref } from "vue";
	import LayoutBlock from "@dv-admin/views/transfers/components/layoutBlock/LayoutBlock.vue";
	import { storeToRefs } from "pinia";
	import { useTransferStore } from "@dv-admin/stores/transfer";
	import { formatAmountBlockchain, formatDollars, getCurrentCoin } from "@shared/utils/helpers/general";
	import { timeDifference } from "@dv-admin/utils/helpers/dateParse";
	import { copiedText } from "@shared/utils/helpers/general";
	import ShowStatusGeneral from "@dv-admin/components/ui/showStatusGeneral/ShowStatusGeneral.vue";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import imgAvif from "@dv-admin/assets/images/transfers/notFoundProgress.avif";
	import imgWebp from "@dv-admin/assets/images/transfers/notFoundProgress.webp";

	const { transferNew, isLoadingTransferNew } = storeToRefs(useTransferStore());

	const showCount: number = 4;
	const collapse = ref<string>("");
	const isShowAll = ref<boolean>(false);

	const transferNewFiltered = computed(() => {
		return isShowAll.value ? transferNew.value : transferNew.value.slice(0, showCount);
	});
</script>

<template>
	<layout-block
		:title="$t('Currently in progress')"
		:count="transferNew.length"
		:show-count="showCount"
		v-model:is-show-all="isShowAll"
	>
		<ui-skeleton v-if="isLoadingTransferNew" :rows="3" :rowHeight="44" :rowsGap="8" :item-border-radius="8" />
		<div v-else class="flex flex-column">
			<UiCollapse v-if="transferNew.length" class="global-collapse" :multiple="false" mode="custom" v-model="collapse">
				<UiCollapseItem
					v-for="(item, index) in transferNewFiltered"
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
										String(new Date()),
										item.created_at,
										$t("staticStrings.h"),
										$t("staticStrings.min"),
										$t("staticStrings.s")
									)
								}}
							</div>
							<div class="header__item global-center">
								<show-status-general :status="item.status" />
							</div>
						</div>
					</template>
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
										size-icon="xs"
										:is-link="false"
										size-hash="md"
										:currency-id="item.currency_id"
										:hash="to"
									/>
								</template>
								<div v-else>—</div>
							</div>
						</div>
					</div>
				</UiCollapseItem>
			</UiCollapse>
			<div class="notFound" v-else>
				<picture>
					<source :srcset="imgAvif" type="image/avif" />
					<source :srcset="imgWebp" type="image/webp" />
					<img :src="imgWebp" alt="Image" loading="lazy" />
				</picture>
				<p class="notFound__text">
					{{ $t("There are no tasks in the queue for processing. All tasks have been processed") }}
				</p>
			</div>
		</div>
	</layout-block>
</template>

<style scoped lang="scss">
	.header {
		display: grid;
		grid-template-columns: 90px 170px 1fr 100px 170px;
		gap: 20px;
		flex-grow: 1;
		&__item {
			align-content: center;
			&:not(:last-child) {
				border-right: 1px solid $grey;
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
		padding-top: 12px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		&__item {
			display: flex;
			flex-direction: column;
			gap: 4px;
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
	.notFound {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 22px;
		&__text {
			color: $secondary;
			font-size: 16px;
			font-weight: 500;
			line-height: 20px;
			max-width: 442px;
		}
		img {
			width: 160px;
			height: 160px;
		}
	}
</style>
