<script setup lang="ts">
	import PaymentDetails from "@pay/views/payerForm/components/steps/paymentDetails/PaymentDetails.vue";
	import BannerInfo from "@pay/views/payerForm/components/bannerInfo/BannerInfo.vue";
	import QrcodeVue from "qrcode.vue";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { UiButton } from "@dv.net/ui-kit";

	const { currentStep, currentAddress } = storeToRefs(usePayerFormStore());
</script>

<template>
	<div class="screen">
		<payment-details />
		<div class="info">
			<div class="info__inner">
				<span>{{ $t("Scan your DV.net deposit wallet address") }}</span>
				<banner-info :message="$t('For your safety, DV.net blocks suspicious and illegal transactions')" />
			</div>
			<qrcode-vue v-if="currentAddress" class="info__qr-code" :value="currentAddress" level="M" render-as="svg" />
		</div>
		<ui-button size="xl" mode="neutral" @click="currentStep = 2">
			{{ $t("Back") }}
		</ui-button>
	</div>
</template>

<style scoped lang="scss">
	.screen {
		display: flex;
		flex-direction: column;
		gap: 24px;
		.info {
			padding: 24px;
			border-radius: 16px;
			background-color: $form-background;
			display: flex;
			align-items: center;
			gap: 38px;
			&__inner {
				display: flex;
				flex-direction: column;
				gap: 12px;
				flex-grow: 1;
			}
			&__qr-code {
				flex-shrink: 0;
				width: 112px;
				height: 112px;
			}
		}
	}
</style>
