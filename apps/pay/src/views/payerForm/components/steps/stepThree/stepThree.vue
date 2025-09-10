<script setup lang="ts">
	import PaymentDetails from "@pay/views/payerForm/components/steps/paymentDetails/PaymentDetails.vue";
	import BannerInfo from "@pay/views/payerForm/components/bannerInfo/BannerInfo.vue";
	import QrcodeVue from "qrcode.vue";
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import WrapperBlock from "@pay/views/payerForm/components/wrapperBlock/WrapperBlock.vue";

	const { currentAddress } = storeToRefs(usePayerFormStore());
</script>

<template>
	<div class="screen">
		<payment-details />
		<wrapper-block>
			<div class="info">
				<div class="info__inner">
					<span>{{ $t("Scan your DV.net deposit wallet address") }}</span>
					<banner-info :message="$t('For your safety, DV.net blocks suspicious and illegal transactions')" />
				</div>
				<qrcode-vue v-if="currentAddress" class="info__qr-code" :value="currentAddress" level="M" render-as="svg" />
			</div>
		</wrapper-block>
	</div>
</template>

<style scoped lang="scss">
	.screen {
		display: flex;
		flex-direction: column;
		gap: 24px;
		@include mediamax(768) {
			gap: 20px;
		}
		@include mediamax(480) {
			gap: 12px;
		}
		.info {
			display: flex;
			align-items: center;
			gap: 38px;
			@include mediamax(768) {
				gap: 24px;
			}
			@include mediamax(480) {
				display: flex;
				flex-direction: column;
				align-items: unset;
				gap: 12px;
			}
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
				@include mediamax(768) {
					width: 100px;
					height: 100px;
				}
				@include mediamax(480) {
					width: 112px;
					height: 112px;
					align-self: center;
				}
			}
		}
	}
</style>
