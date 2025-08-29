<script setup lang="ts">
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";
	import { UiInput, UiLink } from "@dv.net/ui-kit";
	import { computed, nextTick, onUnmounted, ref, watch } from "vue";
	import type { IChangePasswordRequest } from "@dv-admin/utils/types/api/apiGo";
	import { UiModal } from "@dv.net/ui-kit/dist";
	import InputButtons from "@dv-admin/views/profile/personalData/components/changePassword/components/InputButtons.vue";
	import { useI18n } from "vue-i18n";

	const { t } = useI18n();
	const isEditPassword = ref<boolean>(false);
	const demoPassword = ref<string>("someveryimportanstextdonttouch");
	const currentStep = ref<0 | 1 | 2>(0);
	const oldPasswordInputRef = ref();
	const newPasswordInputRef = ref();
	const newPasswordConfirmInputRef = ref();
	const passwords = ref<IChangePasswordRequest>({
		password_old: "",
		password_new: "",
		password_confirmation: ""
	});
	const oldPasswordInputError = computed(() =>
		steps.value[0].focusOut && passwords.value.password_old.length < 8
			? t("The password must be at least 8 characters long")
			: ""
	);
	const newPasswordInputError = computed(() =>
		steps.value[1].focusOut && passwords.value.password_new.length < 8
			? t("The password must be at least 8 characters long")
			: ""
	);
	const newPasswordConfirmInputError = computed(() =>
		steps.value[2].focusOut && passwords.value.password_confirmation.length < 8 ? t("Passwords must match") : ""
	);
	const errorsMapper = [oldPasswordInputError, newPasswordInputError, newPasswordConfirmInputError];
	const steps = ref([
		{
			hint: "Confirm your current password",
			placeholder: "Current Password",
			model: "password_old",
			ref: "oldPasswordInputRef",
			focusOut: false
		},
		{
			hint: "Create a new password",
			placeholder: "New Password",
			model: "password_new",
			ref: "newPasswordInputRef",
			focusOut: false
		},
		{
			hint: "Confirm your new password",
			placeholder: "Confirm new password",
			model: "password_confirmation",
			ref: "newPasswordConfirmInputRef",
			focusOut: false
		}
	]);
	const passwordChangeRef = ref<Element | null>(null);
	const passwordChangeTopPosition = ref<string>("0");
	const passwordChangeLeftPosition = ref<string>("0");

	const handleEnableEditMode = () => {
		const passwordChangePosition = passwordChangeRef.value?.getBoundingClientRect();
		if (passwordChangePosition) {
			passwordChangeTopPosition.value = `${passwordChangePosition.top}`;
			passwordChangeLeftPosition.value = `${passwordChangePosition.left + 23}`;
		}

		isEditPassword.value = true;
	};

	const cancel = (save?: boolean) => {
		if (currentStep.value !== 0 && !save) {
			currentStep.value--;
			return;
		}
		currentStep.value = 0;
		isEditPassword.value = false;
		passwords.value.password_new = "";
		passwords.value.password_old = "";
		passwords.value.password_confirmation = "";
		steps.value[0].focusOut = false;
		steps.value[1].focusOut = false;
		steps.value[2].focusOut = false;
	};

	watch(
		() => currentStep.value,
		() => {
			if (currentStep.value === 0) {
				nextTick(() => {
					oldPasswordInputRef.value[0]?.focus();
				});
			} else if (currentStep.value === 1) {
				nextTick(() => {
					newPasswordInputRef.value[0]?.focus();
				});
			} else if (currentStep.value === 2) {
				nextTick(() => {
					newPasswordConfirmInputRef.value[0]?.focus();
				});
			}
		}
	);

	onUnmounted(cancel);

	onUnmounted(cancel);
</script>

<template>
	<div class="password">
		<div class="px-24 pb-24" ref="passwordChangeRef">
			<global-input title="Password">
				<ui-input type="password" v-model="demoPassword" readonly size="lg">
					<template #append>
						<ui-link @click.stop="handleEnableEditMode">
							{{ $t("Change") }}
						</ui-link>
					</template>
				</ui-input>
			</global-input>
		</div>

		<!-- Edit mode -->
		<ui-modal
			v-model="isEditPassword"
			@close="cancel"
			:isShowBtnClose="false"
			padding="12"
			width="672"
			popperClass="password-change-modal"
			:position-top="passwordChangeTopPosition"
			:position-left="passwordChangeLeftPosition"
		>
			<div>
				<template v-for="(input, i) in steps" :key="input.placeholder">
					<ui-input
						v-if="currentStep === i"
						v-model="passwords[input.model as 'password_old' | 'password_new' | 'password_confirmation']"
						:placeholder="$t(input.placeholder)"
						:autocomplete="currentStep > 0 ? 'new-password' : ''"
						:ref="input.ref"
						@focusout="steps[i].focusOut = true"
						id="password"
						name="password"
						type="password"
						size="xl"
						showPassword
						inside
					>
						<template #append>
							<InputButtons v-model:current-step="currentStep" v-model:passwords="passwords" :cancel="cancel" />
						</template>
					</ui-input>
				</template>
				<div v-if="errorsMapper[currentStep].value" class="password-change-modal__error">
					{{ errorsMapper[currentStep].value }}
				</div>
			</div>
			<div class="password-change-modal__badge">{{ $t(steps[currentStep].hint) }}</div>
		</ui-modal>
	</div>
</template>

<style scoped lang="scss">
	.password {
		.edit {
			display: flex;
			flex-direction: column;
			gap: 16px;
			padding: 24px;
			border-top: 1px solid $grey;
			background-color: $blue-opacity;
			border-radius: 0 0 16px 16px;
			&__title {
				color: $black;
				font-size: 16px;
				font-weight: 500;
				line-height: 20px;
			}
			&__inputs {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 8px;
			}
		}
	}
</style>
