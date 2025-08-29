<script setup lang="ts">
	import { UiButton, UiModal } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import { UiIcon } from "@dv.net/ui-kit/dist";

	const { isShowBannerSuccessToggleExchange } = storeToRefs(useWithdrawalStore());
	const { exchangeList } = storeToRefs(useExchangeSettingsStore());
	const { postSetExchange } = useWithdrawalStore();
	const { getExchangeList } = useExchangeSettingsStore();

	const isOpenModal = defineModel<boolean>("isOpenModal");

	const handleChangeExchange = async () => {
		if (!exchangeList.value?.current_exchange) return;
		await postSetExchange(String(exchangeList.value.current_exchange));
		isOpenModal.value = false;
		isShowBannerSuccessToggleExchange.value = true;
	};

	const handleGoWithdrawal = async () => {
		if (!exchangeList.value?.current_exchange) return;
		await handleChangeExchange();
	};

	const handleCloseModal = () => {
		isOpenModal.value = false;
		getExchangeList();
	};
</script>

<template>
	<ui-modal
		popperClass="global-confirm-modal"
		padding="0"
		:isShowBtnClose="false"
		v-model="isOpenModal"
		@close="getExchangeList"
	>
		<form @submit.prevent="handleChangeExchange">
			<div class="global-confirm-modal__header">
				<div class="global-confirm-modal__header-left-side">
					<ui-icon name="info" type="filled" size="lg" />
					{{ $t("Select action") }}
				</div>
				<ui-icon @click="handleCloseModal" class="pointer" name="close" type="400" size="lg" color="fff" />
			</div>

			<div class="global-confirm-modal__body">
				{{
					$t(
						"When changing crypto exchanges, we recommend updating the settings - replacing wallets for transfers from hot to new wallets of the selected crypto exchange"
					)
				}}
			</div>

			<div class="global-confirm-modal__footer">
				<ui-button @click.prevent="handleGoWithdrawal" mode="neutral" size="xxl">
					{{ $t("Register crypto exchange wallets", { exchange: `${exchangeList?.current_exchange}`.toUpperCase() }) }}
				</ui-button>
				<ui-button type="secondary" size="xxl" nativeType="submit">
					{{ $t("Leave old withdrawal rules") }}
				</ui-button>
			</div>
		</form>
	</ui-modal>
</template>
