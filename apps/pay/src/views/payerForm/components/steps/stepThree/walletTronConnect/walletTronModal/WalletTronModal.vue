<script setup lang="ts">
import { UiIcon } from "@dv.net/ui-kit";
import type { ITronExtensionWallet } from "@pay/views/payerForm/components/steps/stepThree/walletTronConnect/IProps.ts";

const isShow = defineModel<boolean>("isShow", { required: true, default: false });

defineProps<{ wallets: ITronExtensionWallet[] }>();

const emit = defineEmits<{ select: [ITronExtensionWallet] }>();

const handleClose = () => {
	isShow.value = false
};
const handleSelect = (wallet: ITronExtensionWallet) => {
	handleClose()
	emit("select", wallet)
};
</script>

<template>
	<div v-if="isShow" class="modal">
			<div class="modal__overlay" @click="handleClose" />
			<div class="modal__dialog" role="dialog" aria-modal="true">
				<div class="header">
					<h3 class="header__text">{{ $t("Connect wallet") }}</h3>
					<ui-icon
						class="header__icon"
						name="close"
						type="400"
						size="sm"
						@click="handleClose"
					/>
				</div>
				<div class="modal__list">
					<div
						v-for="wallet in wallets"
						:key="wallet.id"
						class="row"
						:class="{ 'row--disabled': !wallet.detected }"
						@click="handleSelect(wallet)"
					>
						<div class="row__info">
							<img :src="wallet.icon" :alt="wallet.name" />
							<span>{{ wallet.name }}</span>
						</div>
						<div class="row__status">
							<span
								class="status-chip"
								:class="{
									'status-chip--success': wallet.initialized,
									'status-chip--warning': wallet.detected && !wallet.initialized,
									'status-chip--muted': !wallet.detected
								}"
							>
								{{
									wallet.initialized
										? $t("Connected")
										: wallet.detected
											? $t("Installed")
											: $t("Not installed")
								}}
							</span>
							<ui-icon name="chevron-right" type="400" size="sm" />
						</div>
					</div>
				</div>
			</div>
		</div>
</template>

<style scoped lang="scss">
	.modal {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		@include mediamax(480) {
			align-items: flex-end;
			padding: 0;
		}
		&__overlay {
			position: absolute;
			inset: 0;
			background-color: rgba(230, 230, 230, 0.5);
			backdrop-filter: blur(8px);
		}
		&__dialog {
			position: relative;
			z-index: 1;
			width: 370px;
			border-radius: 32px;
			background-color: $form-background;
			box-shadow: rgba(0, 0, 0, 0.05) 0 2px 8px 0;
			padding: 24px;
			display: flex;
			flex-direction: column;
			gap: 20px;
			color: #0f172a;
			min-height: 300px;
			@include mediamax(480) {
				width: 100%;
				border-radius: 32px 32px 0 0;
			}
		}
		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			text-align: center;
			&__text {
				color: rgb(30, 30, 30);
				font-size: 16px;
				font-weight: 400;
			}
			&__icon {
				transition: transform 0.3s ease-in-out;
				@media (hover: hover) {
					&:hover {
						cursor: pointer;
						transform: scale(1.1);
					}
				}
			}
		}
		&__list {
			display: flex;
			flex-direction: column;
			gap: 8px;
			.row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 12px;
				border-radius: 16px;
				transition: background 0.15s ease;
				@media (hover: hover) {
					&:hover {
						cursor: pointer;
						background: rgba(15, 23, 42, 0.04);
					}
				}
				&--disabled {
					opacity: 0.5;
					pointer-events: none;
				}
				&__info {
					display: flex;
					align-items: center;
					gap: 10px;
					img {
						width: 32px;
						height: 32px;
						border-radius: 12px;
						box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
					}
					span {
						font-weight: 400;
						color: rgb(32, 32, 32);
					}
				}
				&__status {
					display: flex;
					align-items: center;
					gap: 10px;
				}
				.status-chip {
					font-size: 12px;
					padding: 4px;
					border-radius: 4px;
					text-transform: uppercase;
					font-weight: 600;
					&--success {
						background: rgba(74, 222, 128, 0.2);
						color: #15803d;
					}
					&--warning {
						background: rgba(59, 130, 246, 0.15);
						color: #1d4ed8;
					}
					&--muted {
						background: rgba(148, 163, 184, 0.25);
						color: #475569;
					}
				}
			}
		}
	}
</style>

