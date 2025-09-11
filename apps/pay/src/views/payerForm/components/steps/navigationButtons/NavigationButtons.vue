<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit";
	import type { IProps } from "@pay/views/payerForm/components/steps/navigationButtons/types.ts";
	import { useMediaQuery } from "@shared/utils/composables/useMediaQuery.ts";

	const {
		nameBtnBack = "Back",
		nameBtnForward = "Continue",
		isDisabledBtnForward = false,
		isDisabledBtnBack = false
	} = defineProps<IProps>();
	const emits = defineEmits(["clickBtnBack", "clickBtnForward"]);

	const isMediaMax480 = useMediaQuery("(max-width: 480px)");
</script>

<template>
	<div class="actions">
		<ui-button
			class="actions__btn"
			type="secondary"
			:size="isMediaMax480 ? 'lg' : 'xl'"
			:disabled="isDisabledBtnBack"
			@click="emits('clickBtnBack')"
		>
			{{ $t(nameBtnBack) }}
		</ui-button>
		<ui-button
			class="actions__btn"
			:size="isMediaMax480 ? 'lg' : 'xl'"
			mode="neutral"
			:disabled="isDisabledBtnForward"
			@click="emits('clickBtnForward')"
		>
			{{ $t(nameBtnForward) }}
		</ui-button>
	</div>
</template>

<style scoped lang="scss">
	.actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-top: 48px;
		@include mediamax(1024) {
			margin-top: 24px;
		}
		@include mediamax(768) {
			margin-top: 16px;
			gap: 8px;
		}
		@include mediamax(480) {
			grid-template-columns: 1fr;
		}
		&__btn {
			width: 100%;
			@include mediamax(480) {
				&:nth-child(1) {
					order: 2;
				}
				&:nth-child(2) {
					order: 1;
				}
			}
		}
	}
</style>
