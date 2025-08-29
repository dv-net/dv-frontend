<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import IconDone from "@dv-admin/components/icons/profile/IconDone.vue";
	import { UiIcon, UiButton, UiLink, UiInput, UiForm, UiFormItem, UiSkeleton } from "@dv.net/ui-kit/dist";
	import { computed, ref } from "vue";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { storeToRefs } from "pinia";
	import IconFire from "@dv-admin/components/icons/profile/IconFire.vue";
	import { useRouter } from "vue-router";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";
	import { postApiUnpinTgConfirm, postApiUnpinTgInit } from "@dv-admin/services/api/auth.ts";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";

	const { t } = useI18n();
	const { notify } = useNotifications();
	const router = useRouter();
	const { ownerData, isLoadingOwnerData } = storeToRefs(useAuthStore());
	const { getOwnerData } = useAuthStore();

	const isUnpinInit = ref<boolean>(false);
	const formRef = ref<HTMLFormElement | null>(null);
	const form = ref<{ code: string }>({ code: "" });

	const rulesForm = computed<UiFormRules>(() => ({
		code: [{ validator: () => form.value.code.length > 0, message: t("Enter valid code") }]
	}));

	const isConnectTelegram = computed<boolean>(() => Boolean(ownerData.value?.telegram));
	const isShowLoadingOwnerData = computed<boolean>(() => isLoadingOwnerData.value && !ownerData.value);

	const connectTgHandler = async () => {
		if (isConnectTelegram.value) {
			await postApiUnpinTgInit();
			notify(t("Code sent"), "success");
			isUnpinInit.value = true;
		} else await router.push({ name: "profile-telegram" });
	};

	const cancelUnpinHandler = () => {
		isUnpinInit.value = false;
		form.value.code = "";
	};

	const unpinConfirmHandler = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate()) || form.value.code === null) return;
			await postApiUnpinTgConfirm(String(form.value.code));
			await getOwnerData();
			notify("Telegram is disabled", "success");
			cancelUnpinHandler();
		} catch (error: any) {
			console.error(error);
		}
	};
</script>

<template>
	<block-section
		mode="grey-border"
		:class="{ telegram: true, 'bottom-border-none': !isShowLoadingOwnerData && isUnpinInit }"
	>
		<div class="telegram__icon">
			<ui-icon size="lg" name="telegram" type="social" />
		</div>

		<ui-skeleton
			v-if="isShowLoadingOwnerData"
			:rows-gap="33"
			:rows="2"
			:row-height="42"
			firstColor="white"
			:item-border-radius="16"
		/>

		<div v-else class="telegram__inner">
			<div class="telegram__top">
				<div class="telegram__content">
					<div class="flex flex-y-center gap-8">
						<h3 class="telegram__content-title">{{ $t("Telegram Bot") }}</h3>
						<icon-done v-if="isConnectTelegram" />
					</div>

					<p class="telegram__content-text">
						<template v-if="isConnectTelegram">{{ $t("Telegram is connected") }}</template>
						<template v-else>{{ $t("Connect Telegram for notifications") }}</template>
					</p>
				</div>

				<ui-button v-if="!isUnpinInit" type="secondary" size="sm" @click="connectTgHandler">
					{{ $t(isConnectTelegram ? "Disable" : "Connect") }}
				</ui-button>
			</div>

			<span v-if="isConnectTelegram" class="telegram__line"></span>

			<template v-if="isConnectTelegram">
				<ui-form
					v-if="isUnpinInit"
					ref="formRef"
					:rules="rulesForm"
					:model="form"
					@submit.prevent="unpinConfirmHandler"
					class="flex gap-16"
				>
					<ui-form-item class="w-full" name="code">
						<ui-input v-model="form.code" :placeholder="$t('Enter Telegram code')" />
					</ui-form-item>

					<div class="flex gap-8 mt-8">
						<ui-button size="sm" @click="cancelUnpinHandler" type="secondary">
							{{ $t("Cancel.verb") }}
						</ui-button>

						<ui-button size="sm" native-type="submit" :disabled="!form.code">
							{{ $t("Disable") }}
						</ui-button>
					</div>
				</ui-form>

				<block-section v-else class="output" mode="white" padding="md" radius="md">
					<icon-fire />
					<span class="output__title">{{ $t("Telegram connected") }}:</span>
					<ui-link>@{{ ownerData?.telegram }}</ui-link>
				</block-section>
			</template>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.telegram {
		display: flex;
		gap: 16px;

		&.bottom-border-none {
			padding-bottom: 0;
		}

		&__icon {
			width: 40px;
			height: 40px;
			@extend .center;
			border-radius: 5.714px;
			border: 1px solid $grey-light;
			background-color: $white;
		}

		&__top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 10px;
		}

		&__inner {
			display: flex;
			flex-direction: column;
			width: 100%;
		}

		&__line {
			background-color: $grey;
			width: 100%;
			height: 1px;
			margin: 16px 0;
		}

		&__content {
			display: flex;
			flex-direction: column;
			gap: 4px;

			&-title {
				color: #000;
				font-size: 16px;
				font-weight: 500;
				line-height: 20px;
			}

			&-text {
				color: $secondary;
				font-size: 12px;
				font-weight: 400;
				line-height: 16px;
			}
		}

		.output {
			display: flex;
			align-items: center;
			gap: 8px;
			padding-block: 11px;

			&__title {
				color: $secondary;
				font-size: 14px;
				font-weight: 500;
				line-height: 16px;
			}
		}
	}
</style>
