<script setup lang="ts">
	import { useHotWalletsStore } from "@dv-admin/stores/hotWallets";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import {
		formatAmountBlockchain,
		formatDollars,
		getCurrentBlockchain,
		getCurrentCoin
	} from "@shared/utils/helpers/general.ts";
	import { UiCheckbox, UiIconButton } from "@dv.net/ui-kit";
	import type { IHotWalletsItem } from "@dv-admin/utils/types/api/apiGo.ts";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { getLinkSearch } from "@shared/utils/helpers/linkExplorer.ts";
	import SendButton from "@dv-admin/views/hotWallets/components/sendButton/SendButton.vue";

	const item = defineModel<IHotWalletsItem>({ required: true });
	const { handleSelectWallet } = useHotWalletsStore();
</script>

<template>
	<div class="card">
		<div class="card__top">
			<div class="currency">
				<div class="currency__icon">
					<ui-checkbox
						v-model="item.isSelected"
						@change="handleSelectWallet(item)"
						:class="{ currency__icon__checkbox: true, isChecked: item.isSelected }"
					/>

					<BlockchainIcon
						v-if="!item.isSelected"
						:type="item.currency_id"
						width="36px"
						height="36px"
						class="currency__icon__blockchain"
					/>
				</div>

				<div class="content">
					<span>{{ getCurrentCoin(item.currency_id) }}</span>
					<span class="content__label">{{ getCurrentBlockchain(item.currency_id) }}</span>
				</div>
			</div>

			<div class="price">
				<div class="content">
					<span>{{ formatDollars(item.amount_usd) }}</span>
					<span class="content__label">
						{{ formatAmountBlockchain(item.amount, item.currency_id) }} {{ getCurrentCoin(item.currency_id) }}
					</span>
				</div>
				<send-button :data="item" is-card placement="bottom-end" />
			</div>
		</div>
		<span class="card__line"></span>
		<div class="card__bottom">
			<div class="card__bottom-hash">
				<display-hash
					type="address"
					:count-prefix="15"
					:currency-id="item.currency_id"
					:hash="item.address"
					:is-link="false"
				/>
			</div>

			<router-link :to="getLinkSearch('address', item.address)" class="card__bottom-link">
				<ui-icon-button icon-name="new-windows" icon-color="rgb(107, 109, 128)" />
			</router-link>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		border-radius: 12px;
		border: 1px solid $grey;
		padding: 22px 16px 16px 16px;
		background-color: $white;

		&__top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 20px;

			.content {
				display: flex;
				flex-direction: column;
				justify-content: center;
				color: $black;
				font-size: 16px;
				font-weight: 500;
				line-height: 20px;

				&__label {
					color: $secondary;
					font-size: 12px;
					font-weight: 400;
					line-height: 16px;
				}
			}

			.currency {
				display: flex;
				align-items: center;
				gap: 12px;

				&__icon {
					@extend .center;
					width: 36px;
					height: 36px;

					&:hover {
						.currency__icon__checkbox {
							display: block;
						}

						.currency__icon__blockchain {
							position: absolute;
							z-index: -1;
						}
					}

					&__checkbox {
						transition: opacity 0.2s;
						display: none;

						svg {
							width: 100%;
							height: 100%;
						}

						&.isChecked {
							display: block;
						}
					}

					&__blockchain {
						display: block;
						transition: opacity 0.2s;
					}
				}
			}

			.price {
				display: flex;
				gap: 14px;
			}
		}

		&__line {
			background-color: $grey;
			height: 1px;
			width: 100%;
		}

		&__bottom {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 4px;

			&-hash {
				width: 100%;
				padding: 8px;
				border-radius: 6px;
				border: 1px solid $grey;
				background-color: $blue-opacity;
				max-height: 36px;

				&:deep(.hash) {
					display: flex;
					align-items: center;
					justify-content: space-between;
				}
			}

			&-link {
				flex-shrink: 0;
				@extend .center;
				color: #6b6d80;
				width: 36px;
				height: 36px;
				border-radius: 6px;
				border: 1px solid $grey;
				background-color: #fcfcfd;
			}
		}
	}
</style>
