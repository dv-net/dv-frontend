<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit";
	import type { IProps } from "@pay/views/payerForm/components/steps/navigationButtons/types.ts";

	const {
		nameBtnBack = "Back",
		nameBtnForward = "Continue",
		isDisabledBtnForward = false,
		isDisabledBtnBack = false
	} = defineProps<IProps>();
	const emits = defineEmits(["clickBtnBack", "clickBtnForward"]);
</script>

<template>
	<div class="actions">
		<ui-button class="w-full" size="xl" type="secondary" :disabled="isDisabledBtnBack" @click="emits('clickBtnBack')">
			{{ $t(nameBtnBack) }}
		</ui-button>
		<ui-button
			class="w-full"
			size="xl"
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
	}
</style>
