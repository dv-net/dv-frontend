<script setup lang="ts">
	import { UiModal, UiButton, UiLink } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import { computed, nextTick, ref, watch } from "vue";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { useRouter } from "vue-router";

	const router = useRouter();
	const { otpGlobalCode, otpGlobalCallback } = storeToRefs(useGeneralStore());
	const { userData2Fa } = storeToRefs(useAuthStore());

	const isShow = defineModel<boolean>("isShow", { required: true, default: false });
	const isLoading = ref<boolean>(false);
	const COUNT_INPUTS: number = 6;
	const otp = ref<string[]>(Array(COUNT_INPUTS).fill(""));
	const otpRefs = ref<HTMLInputElement[]>([]);

	const isDisabledBtn = computed<boolean>(() => !otp.value.every(Boolean));

	const handleSendForm = async () => {
		try {
			isLoading.value = true;
			if (otpGlobalCallback.value) {
				otpGlobalCode.value = otp.value.join("");
				await otpGlobalCallback.value();
			}
			handleCloseModal();
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const handleInput = (event: Event, index: number) => {
		const target = event.target as HTMLInputElement | null;
		if (!target) return;
		otp.value[index] = target.value.replace(/\D/g, "");
		if (otp.value[index] && index + 1 < otp.value.length) {
			nextTick(() => {
				otpRefs.value[index + 1].focus();
			});
		}
	};

	const handlePaste = (event: ClipboardEvent) => {
		const pastedText = event.clipboardData?.getData("text") || "";
		const cleaned = pastedText.replace(/\D/g, "").slice(0, COUNT_INPUTS);
		if (cleaned.length) {
			event.preventDefault();
			const digits = cleaned.split("");
			otp.value = [...digits, ...Array(COUNT_INPUTS - digits.length).fill("")];
			nextTick(() => {
				otpRefs.value[digits.length - 1]?.focus();
			});
		}
	};

	const onBackspace = (index: number) => {
		if (otp.value[index] === "" && index > 0) {
			nextTick(() => {
				otpRefs.value[index - 1].focus();
			});
		}
	};

	const handleCloseModal = () => {
		isShow.value = false;
		otpGlobalCode.value = null;
		otpGlobalCallback.value = null;
		otp.value = Array(COUNT_INPUTS).fill("");
	};

	const goToProfile = async () => {
		handleCloseModal();
		await router.push({ name: "profile-personal-data" });
	};

	watch(isShow, async (value: boolean) => {
		if (value) {
			await nextTick();
			if (otpRefs.value[0]) otpRefs.value[0].focus();
		}
	});
</script>

<template>
	<ui-modal v-model="isShow" @close="handleCloseModal" width="500" padding="40">
		<form v-if="userData2Fa?.is_confirmed" @submit.prevent="handleSendForm">
			<h3 class="global-title-h3">
				{{ $t("Two-factor authentication") }}
			</h3>
			<div class="inputs">
				<input
					v-for="(item, index) in otp"
					:key="index"
					ref="otpRefs"
					v-model="otp[index]"
					type="tel"
					class="inputs__item"
					maxlength="1"
					@input="handleInput($event, index)"
					@paste="handlePaste"
					@keydown.backspace="onBackspace(index)"
				/>
			</div>
			<ui-button mode="neutral" size="xl" :loading="isLoading" :disabled="isDisabledBtn" nativeType="submit">
				{{ $t("Confirm") }}
			</ui-button>
		</form>
		<div v-else>
			<h3 class="global-title-h3">
				{{ $t("You don't have 2FA enabled") }}
			</h3>
			<p class="mt-16 mb-8">{{ $t("Go to your profile to enable 2FA") }}</p>
			<ui-link @click="goToProfile">
				{{ $t("Go to profile") }}
			</ui-link>
		</div>
	</ui-modal>
</template>

<style scoped lang="scss">
	.inputs {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 24px 0 32px;
		&__item {
			text-align: center;
			width: 50px;
			height: 44px;
			border-radius: 8px;
			border: none;
			outline: none;
			box-shadow: 0 0 0 1px $grey;
			transition: all 0.2s cubic-bezier(0.42, 0, 0.58, 1);
			font-size: 18px;
		}
	}
</style>
