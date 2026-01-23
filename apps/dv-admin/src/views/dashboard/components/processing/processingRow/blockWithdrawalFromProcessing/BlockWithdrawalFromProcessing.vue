<script setup lang="ts">
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { UiButton, UiInput, UiTooltip } from "@dv.net/ui-kit";
	import { ref } from "vue";

	const input = ref<number | null>(200);
</script>

<template>
	<div class="block">
		<div class="block__column">
			<span class="block__label">{{ $t("Select a token") }}</span>
			<div class="block__tokens">
				<div class="item">
					<div class="item__content">
						<blockchain-icon type="USDT.Polygon" width="16px" height="16px" />
						<span>USDT</span>
					</div>
					<div class="item__price">267 • $2132</div>
				</div>
				<ui-tooltip text="0.05454267 • $243">
					<div class="item">
						<div class="item__content">
							<blockchain-icon type="TRX.Tron" width="16px" height="16px" />
							<span>TRX</span>
						</div>
					</div>
				</ui-tooltip>
			</div>
		</div>
		<div class="block__column">
			<span class="block__label">{{ $t("Transfer amount") }}</span>
			<form class="form">
				<ui-input v-model="input" type="number" is-empty-value-null>
					<template #append>
						<div class="form__inner">
							<span class="form__usd">≈ $1957</span>
							<ui-button type="secondary" size="lg">{{ $t("All") }}</ui-button>
						</div>
					</template>
				</ui-input>
				<ui-button mode="neutral" size="xl">{{ $t("Withdraw") }}</ui-button>
			</form>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.block {
		display: grid;
		grid-template-columns: 1fr 385px;
		gap: 20px;
		margin: 16px 8px 0;
		padding: 16px 0;
		border-top: 1px solid #e1e8f1;
		&__label {
			color: $secondary;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
		&__column {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		&__tokens {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 6px;
			.item {
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 4px 12px;
				border-radius: 12px;
				border: 1px solid #e1e8f1;
				background-color: #fff;
				min-height: 40px;
				&.selected {
					border: 1px solid #1968e5;
				}
				@media (hover: hover) {
					&:hover {
						cursor: pointer;
					}
				}
				&__content {
					display: flex;
					align-items: center;
					gap: 4px;
					color: $black;
					font-size: 14px;
					font-weight: 700;
					line-height: 24px;
				}
				&__price {
					color: #a4a5b1;
					font-size: 14px;
					font-weight: 400;
					line-height: 20px;
				}
			}
		}
		.form {
			display: flex;
			align-items: center;
			gap: 20px;
			&:deep(.ui-input) {
				justify-content: space-between;
				.ui-input__inner {
					width: 100px;
				}
			}
			&__inner {
				display: flex;
				align-items: center;
				gap: 12px;
			}
			&__usd {
				flex-shrink: 0;
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				line-height: 16px;
			}
		}
	}
</style>