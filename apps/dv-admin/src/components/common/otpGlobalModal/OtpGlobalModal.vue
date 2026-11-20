<script setup lang="ts">
	import { UiModal, UiButton, UiLink, UiIcon } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import { computed, nextTick, ref, watch } from "vue";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { useRouter } from "vue-router";
	import { getApiErrorMessage, runWithoutErrorNotify } from "@dv-admin/utils/libs/axios";

	const router = useRouter();
	const { otpGlobalCode, otpGlobalCallback, otpGlobalCancelCallback } = storeToRefs(useGeneralStore());
	const { userData2Fa } = storeToRefs(useAuthStore());

	const isShow = defineModel<boolean>("isShow", { required: true, default: false });
	const isLoading = ref<boolean>(false);
	const errorMessage = ref<string>("");
	const isShaking = ref<boolean>(false);
	const COUNT_INPUTS: number = 6;
	const otp = ref<string[]>(Array(COUNT_INPUTS).fill(""));
	const otpRefs = ref<HTMLInputElement[]>([]);

	const isDisabledBtn = computed<boolean>(() => !otp.value.every(Boolean));

	const triggerShake = () => {
		isShaking.value = false;
		void nextTick(() => {
			isShaking.value = true;
		});
	};

	const stopShake = () => {
		isShaking.value = false;
	};

	const resetModal = () => {
		isShow.value = false;
		otpGlobalCode.value = null;
		otpGlobalCallback.value = null;
		otpGlobalCancelCallback.value = null;
		otp.value = Array(COUNT_INPUTS).fill("");
		errorMessage.value = "";
		isShaking.value = false;
	};

	const handleSendForm = async () => {
		if (isLoading.value || isDisabledBtn.value) return;
		const cancelCallback = otpGlobalCancelCallback.value;
		otpGlobalCancelCallback.value = null;
		errorMessage.value = "";
		try {
			isLoading.value = true;
			await runWithoutErrorNotify(async () => {
				if (!otpGlobalCallback.value) return;
				otpGlobalCode.value = otp.value.join("");
				await otpGlobalCallback.value();
			});
			resetModal();
		} catch (error: unknown) {
			otpGlobalCancelCallback.value = cancelCallback;
			errorMessage.value = getApiErrorMessage(error);
			triggerShake();
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const handleInput = (event: Event, index: number) => {
		const target = event.target as HTMLInputElement | null;
		if (!target) return;
		errorMessage.value = "";
		otp.value[index] = target.value.replace(/\D/g, "");
		if (otp.value.every(Boolean)) {
			void handleSendForm();
			return;
		}
		if (otp.value[index] && index + 1 < otp.value.length) {
			nextTick(() => {
				otpRefs.value[index + 1].focus();
			});
		}
	};

	const handlePaste = (event: ClipboardEvent) => {
		const pastedText = event.clipboardData?.getData("text") || "";
		const cleaned = pastedText.replace(/\D/g, "").slice(0, COUNT_INPUTS);
		if (!cleaned.length) return;
		errorMessage.value = "";
		event.preventDefault();
		const digits = cleaned.split("");
		otp.value = [...digits, ...Array(COUNT_INPUTS - digits.length).fill("")];
		nextTick(() => {
			otpRefs.value[digits.length - 1]?.focus();
			if (digits.length === COUNT_INPUTS) void handleSendForm();
		});
	};

	const onBackspace = (index: number) => {
		if (otp.value[index] === "" && index > 0) {
			nextTick(() => {
				otpRefs.value[index - 1].focus();
			});
		}
	};

	const handleCloseModal = () => {
		const cancelCallback = otpGlobalCancelCallback.value;
		resetModal();
		cancelCallback?.();
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
		<form v-if="userData2Fa?.is_confirmed" class="form" @submit.prevent="handleSendForm">
			<div class="title">
				<span class="title__icon">
					<ui-icon name="lock" type="filled" size="md" />
				</span>
				<h3 class="global-title-h3">
					{{ $t("Two-factor authentication") }}
				</h3>
			</div>
			<div class="code">
				<div
					class="inputs"
					:class="{ 'inputs--invalid': errorMessage, 'inputs--shaking': isShaking }"
					@animationend="stopShake"
				>
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
				<p v-if="errorMessage" class="code__error">{{ errorMessage }}</p>
			</div>
			<ui-button
				mode="neutral"
				size="xl"
				left-icon-name="check-circle"
				left-icon-color="#fff"
				:loading="isLoading"
				:disabled="isDisabledBtn"
				nativeType="submit"
			>
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
	.form {
		width: 100%;
		max-width: 100%;
		min-width: 0;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 12px;

		&__icon {
			display: flex;
			flex-shrink: 0;
			align-items: center;
			justify-content: center;
			width: 36px;
			height: 36px;
			border-radius: 10px;
			background: $blue-light;
			color: $blue;
		}
	}

	.code {
		margin: 24px 0 32px;

		&__error {
			margin: 8px 0 0;
			color: #dd4c1e;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
			overflow-wrap: anywhere;
			word-break: break-word;
		}
	}

	.inputs {
		display: flex;
		align-items: center;
		gap: 8px;

		&--invalid &__item {
			box-shadow: 0 0 0 1px #dd4c1e;
		}

		&--shaking {
			animation: otp-shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97);
		}

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

	@keyframes otp-shake {
		10%,
		90% {
			transform: translateX(-1px);
		}
		20%,
		80% {
			transform: translateX(2px);
		}
		30%,
		50%,
		70% {
			transform: translateX(-4px);
		}
		40%,
		60% {
			transform: translateX(4px);
		}
	}
</style>
