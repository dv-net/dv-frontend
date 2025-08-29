<script setup lang="ts">
	import IconWarning from "@dv-admin/components/icons/IconWarning.vue";
	import { storeToRefs } from "pinia";
	import { useAuthEmailSectionStore } from "@dv-admin/stores/auth/authEmailSection";

	const emits = defineEmits(["sendCode"]);

	const { emailCodeRemainingSec, isEmailCodeTimerActive } = storeToRefs(useAuthEmailSectionStore());
</script>

<template>
	<div class="message">
		<div class="message__top">
			<icon-warning class="message__icon" />
			<p class="message__title">{{ $t("The confirmation code email has been sent") }}</p>
		</div>

		<span
			class="message__link"
			:class="{ disabled: isEmailCodeTimerActive }"
			@click="!isEmailCodeTimerActive && emits('sendCode')"
		>
			{{ isEmailCodeTimerActive ? `${$t("Resend code")} (${emailCodeRemainingSec}s)` : $t("Resend code") }}
		</span>
	</div>
</template>

<style scoped lang="scss">
	.message {
		border-radius: 8px;
		border: 1px solid #1f9649;
		background-color: #e6faed;
		padding: 16px;
		color: #1f9649;
		font-size: 14px;
		font-weight: 500;
		line-height: 18px;
		display: flex;
		flex-direction: column;
		gap: 4px;

		&__top {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		&__title {
			font-size: 14px;
			font-weight: 500;
			line-height: 18px;
		}

		&__link {
			padding-left: 28px;
			font-size: 14px;
			line-height: 20px;
			cursor: pointer;
			color: $blue;
			font-weight: 500;
			width: max-content;
			user-select: none;

			&.disabled {
				pointer-events: none;
				color: #a4a5b1;
			}
		}
	}
</style>
