<script setup lang="ts">
	import { UiModal, UiIcon, UiButton } from "@dv.net/ui-kit";
	import type { ExchangeSlugType } from "@dv-admin/utils/types/api/apiGo.ts";

	defineProps<{ handleDeleteKeys: () => Promise<void>; deletingExchange: ExchangeSlugType | null }>();

	const isShowModal = defineModel<boolean>("isShowModal", { required: true, default: false });
</script>

<template>
	<ui-modal
		popperClass="global-confirm-modal"
		padding="0"
		:isShowBtnClose="false"
		v-model="isShowModal"
		@close="isShowModal = false"
	>
		<form @submit.prevent="handleDeleteKeys">
			<div class="global-confirm-modal__header">
				<div class="global-confirm-modal__header-left-side">
					<ui-icon name="info" type="filled" size="lg" />
					{{ $t("Confirm action") }}
				</div>
				<ui-icon @click="isShowModal = false" class="pointer" name="close" type="400" size="lg" color="fff" />
			</div>

			<div class="global-confirm-modal__body">
				{{
					$t("Are you sure you want to delete your crypto exchange keys?", {
						exchange: deletingExchange?.toUpperCase()
					})
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
