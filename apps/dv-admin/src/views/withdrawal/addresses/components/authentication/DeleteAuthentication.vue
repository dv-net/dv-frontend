<script setup lang="ts">
	import { UiButton, UiLink, UiModal } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import BannerAttention from "@dv-admin/components/ui/bannerAttention/BannerAttention.vue";
	import { computed, nextTick, ref, watch } from "vue";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { useRouter } from "vue-router";

	const router = useRouter();
	const {
		isLoadingDeleteAddresses,
		isShowDeleteAuthentication,
		pendingDeleteAddresses,
		hasPendingDeleteManualAddressWarning
	} = storeToRefs(useWithdrawalStore());
	const { resetDeleteAddressAuthentication, deleteWithdrawalWalletAddresses } = useWithdrawalStore();
	const { userData2Fa } = storeToRefs(useAuthStore());

	const COUNT_INPUTS = 6;
	const otp = ref<string[]>(Array(COUNT_INPUTS).fill(""));
	const otpRefs = ref<HTMLInputElement[]>([]);

	const isDisabledBtn = computed<boolean>(() => !otp.value.every(Boolean) || isLoadingDeleteAddresses.value);

	const resetOtp = () => {
		otp.value = Array(COUNT_INPUTS).fill("");
	};

	const handleCloseModal = () => {
		resetDeleteAddressAuthentication();
		resetOtp();
	};

	const handleInput = (event: Event, index: number) => {
		const target = event.target as HTMLInputElement | null;
		if (!target) return;
		otp.value[index] = target.value.replace(/\D/g, "");
		if (otp.value[index] && index + 1 < otp.value.length) {
			nextTick(() => {
				otpRefs.value[index + 1]?.focus();
			});
		}
	};

	const handlePaste = (event: ClipboardEvent) => {
		const pastedText = event.clipboardData?.getData("text") || "";
		const cleaned = pastedText.replace(/\D/g, "").slice(0, COUNT_INPUTS);
		if (!cleaned.length) return;
		event.preventDefault();
		const digits = cleaned.split("");
		otp.value = [...digits, ...Array(COUNT_INPUTS - digits.length).fill("")];
		nextTick(() => {
			otpRefs.value[Math.min(digits.length, COUNT_INPUTS) - 1]?.focus();
		});
	};

	const onBackspace = (index: number) => {
		if (otp.value[index] === "" && index > 0) {
			nextTick(() => {
				otpRefs.value[index - 1]?.focus();
			});
		}
	};

	const handleSendForm = async () => {
		if (isDisabledBtn.value) return;
		try {
			await deleteWithdrawalWalletAddresses(otp.value.join(""));
			resetOtp();
		} catch (error) {
			console.error(error);
		}
	};

	const goToProfile = async () => {
		handleCloseModal();
		await router.push({ name: "profile-personal-data" });
	};

	watch(isShowDeleteAuthentication, async (isShow) => {
		if (!isShow) {
			resetOtp();
			return;
		}
		await nextTick();
		otpRefs.value[0]?.focus();
	});
</script>

<template>
	<ui-modal v-model="isShowDeleteAuthentication" width="560" padding="32" @close="handleCloseModal">
		<template v-if="userData2Fa?.is_confirmed">
			<form @submit.prevent="handleSendForm">
				<h3 class="global-title-h3">{{ $t("Confirm deletion") }}</h3>
				<p class="authentication__hint">{{ $t("Selected addresses will be deleted") }}:</p>
				<ul class="authentication__list">
					<li v-for="item in pendingDeleteAddresses" :key="item.id" class="authentication__list-item">
						<span class="authentication__address">{{ item.address }}</span>
						<span v-if="item.name" class="authentication__name">{{ item.name }}</span>
					</li>
				</ul>
				<banner-attention
					class="authentication__warning"
					:is-show-banner="hasPendingDeleteManualAddressWarning"
					:text="$t('Multi-withdrawal disabled warning')"
				/>
				<p class="authentication__totp-title">{{ $t("Two-factor authentication") }}</p>
				<div class="inputs">
					<input
						v-for="(item, index) in otp"
						:key="index"
						ref="otpRefs"
						v-model="otp[index]"
						type="tel"
						class="inputs__item"
						maxlength="1"
						:disabled="isLoadingDeleteAddresses"
						@input="handleInput($event, index)"
						@paste="handlePaste"
						@keydown.backspace="onBackspace(index)"
					/>
				</div>
				<div class="authentication__actions">
					<ui-button
						type="primary"
						size="lg"
						nativeType="submit"
						:loading="isLoadingDeleteAddresses"
						:disabled="isDisabledBtn"
					>
						{{ $t("Confirm") }}
					</ui-button>
					<ui-button type="tertiary" size="lg" :disabled="isLoadingDeleteAddresses" @click="handleCloseModal">
						{{ $t("Cancel.noun") }}
					</ui-button>
				</div>
			</form>
		</template>
		<div v-else class="message">
			<h3 class="global-title-h3">{{ $t("You don't have 2FA enabled") }}</h3>
			<p>{{ $t("Go to your profile to enable 2FA") }}</p>
			<ui-link class="message__link" @click="goToProfile">
				{{ $t("Go to profile") }}
			</ui-link>
		</div>
	</ui-modal>
</template>

<style scoped lang="scss">
	.authentication {
		&__hint {
			margin-top: 12px;
			color: $grey;
			font-size: 14px;
			line-height: 20px;
		}

		&__list {
			display: flex;
			flex-direction: column;
			gap: 8px;
			margin: 12px 0 0;
			padding: 0;
			list-style: none;
			max-height: 180px;
			overflow: auto;
		}

		&__list-item {
			display: flex;
			flex-direction: column;
			gap: 2px;
			padding: 8px 12px;
			border-radius: 8px;
			background: #f7f8fa;
		}

		&__address {
			font-size: 14px;
			font-weight: 500;
			word-break: break-all;
		}

		&__name {
			font-size: 12px;
			color: $grey;
		}

		&__warning {
			margin-top: 12px;
		}

		&__totp-title {
			margin-top: 24px;
			font-size: 16px;
			font-weight: 500;
			line-height: 24px;
		}

		&__actions {
			display: flex;
			align-items: center;
			gap: 12px;
		}
	}

	.inputs {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 16px 0 24px;

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

			&:disabled {
				opacity: 0.6;
				cursor: not-allowed;
			}
		}
	}

	.message {
		display: flex;
		align-items: center;
		flex-direction: column;
		gap: 8px;

		&__link {
			width: max-content;
			border-bottom: 1px solid;
		}
	}
</style>
