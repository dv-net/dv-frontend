<script setup lang="ts">
	import { UiModal, UiIcon, UiButton } from "@dv.net/ui-kit";
	import type { ExchangeSlugType } from "@dv-admin/utils/types/api/apiGo.ts";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";

	const props = defineProps<{ activatingExchange: ExchangeSlugType | null }>();

	const { postSetExchange } = useWithdrawalStore();

	const isShowModal = defineModel<boolean>("isShowModal", { required: true, default: false });

	const handleActivateModal = async () => {
		if (!props.activatingExchange) return;
		await postSetExchange(props.activatingExchange);
		isShowModal.value = false;
	};
</script>

<template>
	<ui-modal
		v-if="activatingExchange"
		popperClass="global-confirm-modal"
		padding="0"
		:isShowBtnClose="false"
		v-model="isShowModal"
		@close="isShowModal = false"
	>
		<form @submit.prevent="handleActivateModal">
			<div class="global-confirm-modal__header">
				<div class="global-confirm-modal__header-left-side">
					<ui-icon name="info" type="filled" size="lg" />
					{{ $t("Confirm action") }}
				</div>
				<ui-icon @click="isShowModal = false" class="pointer" name="close" type="400" size="lg" color="fff" />
			</div>

			<div class="global-confirm-modal__body">
				{{
					$t("Are you sure you want to activate the crypto exchange?", { exchange: activatingExchange?.toUpperCase() })
				}}
			</div>

			<div class="global-confirm-modal__footer">
				<ui-button nativeType="submit" mode="neutral" size="xxl">{{ $t("Confirm") }}</ui-button>
				<ui-button type="secondary" size="xxl" @click="isShowModal = false">{{ $t("Cancel.verb") }}</ui-button>
			</div>
		</form>
	</ui-modal>
</template>

<style scoped lang="scss"></style>
