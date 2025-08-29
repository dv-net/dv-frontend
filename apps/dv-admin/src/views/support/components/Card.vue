<script setup lang="ts">
	import { ref } from "vue";
	import type { ISupportCard } from "../types";
	import { UiButton } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import QrcodeVue from "qrcode.vue";

	defineProps<{ item: ISupportCard }>();

	const isShowQr = ref(false);
</script>

<template>
	<block-section mode="grey-border" padding="none" class="card">
		<div :class="{ card__header: true, 'thin-bottom-padding': isShowQr }">
			<img :src="item.img" alt=" " />
			<div>
				<div class="flex gap-4">
					<h4>{{ item.id === 3 ? $t(item.title) : item.title }}</h4>
				</div>
				<span class="card__header-text">{{ item.text }}</span>
			</div>
			<div class="card__header-buttons-container">
				<a :href="item.path" target="_blank">
					<ui-button
						v-if="item.buttonText"
						type="tertiary"
						size="sm"
						@click="item.method ? item.method() : false"
						:disabled="item.title === 'Online chat'"
					>
						{{ $t(item.buttonText) }}
					</ui-button>
				</a>
				<ui-button
					v-if="item.path"
					type="tertiary"
					@click="isShowQr = !isShowQr"
					size="sm"
					class="card__header-qr-button"
				>
					<span>{{ $t(isShowQr ? "Hide QR" : "Show QR") }}</span>
				</ui-button>
			</div>
		</div>

		<div v-if="isShowQr" class="card__qr">
			<div class="card__qr-container">
				<qrcode-vue class="card__qr-svg" :value="item.path" level="M" render-as="svg" />
			</div>
			<div class="card__qr-text">
				<div>{{ $t("Use QR") }}</div>
				<div>{{ $t("for fast transition") }}</div>
			</div>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.card {
		overflow: hidden;

		&__header {
			display: grid;
			grid-template-columns: 32px auto;
			background-color: $white;
			align-items: center;
			position: relative;
			gap: 12px;
			padding: 16px;

			img {
				width: 32px;
				height: 32px;
			}

			&-text {
				color: #6b6d80;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}

			&-buttons-container {
				position: absolute;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: end;
				height: 40px;
				right: 16px;

				.ui-button {
					height: auto;
					padding: 1px;
					line-height: 16px;
				}
			}

			&-qr-button {
				span {
					line-height: 14px;
					border-bottom: 1px dashed;
				}
			}
		}

		&__qr {
			display: grid;
			grid-template-columns: 64px auto;
			gap: 20px;
			padding: 8px 16px;
			border-top: 1px solid #e1e8f1;
			align-items: center;

			&-container {
				background-color: $white;
				overflow: hidden;
				height: 64px;
				border-radius: 6px;
				padding: 3px;
				border: 1px solid #e1e8f1;
			}

			&-svg {
				width: 100%;
				height: 100%;
				padding: 1px;
			}

			&-text {
				color: #a4a5b1;
				font-size: 14px;
				line-height: 20px;
				font-weight: 500;
			}
		}
	}
</style>
