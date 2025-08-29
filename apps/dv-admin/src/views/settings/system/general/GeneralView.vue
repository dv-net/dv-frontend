<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { UiButton, UiInput, UiSwitch } from "@dv.net/ui-kit";
	import RowSettingItem from "@dv-admin/views/settings/system/components/rowSettingItem/RowSettingItem.vue";
	import { storeToRefs } from "pinia";
	import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";
	import { onMounted, ref } from "vue";
	import { ROOT_SETTING_GENERAL_DESCRIPTIONS, ROOT_SETTING_LABELS } from "@dv-admin/utils/constants/settings";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import type { ISettingsResponse } from "@dv-admin/utils/types/api/apiGo";
	import OtpModal from "@dv-admin/views/settings/system/general/components/otpModal/OtpModal.vue";
	import { useAuthStore } from "@dv-admin/stores/auth";

	const { notify } = useNotifications();
	const { t } = useI18n();
	const { callbackPathname, callbackDomain, rootSettings, rootGroupSettings } = storeToRefs(useSystemSettingsStore());
	const { getRootSettings, postProcessingCallbackUrl, postRootSetting } = useSystemSettingsStore();
	const { userSettings } = storeToRefs(useUserSettingsStore());
	const { userRootSystemInfo } = storeToRefs(useSystemSettingsStore());
	const { getUserSettings, postUserSettings } = useUserSettingsStore();
	const { isRootUser } = storeToRefs(useAuthStore());

	const isLoading = ref<boolean>(false);
	const withdrawFromProcessing = ref<ISettingsResponse>();
	const isShowOtpModal = ref<boolean>(false);
	const toggleWithdrawFromProcessing = ref<boolean>(false);

	const handleChangeSettings = async () => {
		try {
			isLoading.value = true;
			const promises = rootGroupSettings.value.general
				.map((el) => {
					if (!el.is_editable) return;
					const isInput: boolean = !el?.available_values || !el?.available_values?.length;
					return postRootSetting(el.name, isInput);
				})
				.filter(Boolean);
			await Promise.all([...promises, postProcessingCallbackUrl()]);
			await getRootSettings();
			notify(t("Settings saved"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const handleChangeProcessing = async () => {
		try {
			if (!withdrawFromProcessing.value) return;
			withdrawFromProcessing.value.value = toggleWithdrawFromProcessing.value ? "enabled" : "disabled";
			if (!withdrawFromProcessing.value.two_factor_verification_required) {
				await postUserSettings(withdrawFromProcessing.value, t("The settings for sending funds have been changed"));
			} else {
				isShowOtpModal.value = true;
			}
		} catch (error: any) {
			console.error(error);
		}
	};

	const handleCloseOtpModal = () => {
		toggleWithdrawFromProcessing.value = !toggleWithdrawFromProcessing.value;
		if (withdrawFromProcessing.value) {
			withdrawFromProcessing.value.value = toggleWithdrawFromProcessing.value ? "enabled" : "disabled";
		}
	};

	onMounted(async () => {
		await Promise.all([
			!rootSettings.value.length && isRootUser.value ? getRootSettings() : Promise.resolve(),
			!userSettings.value.length ? getUserSettings() : Promise.resolve()
		]);
		withdrawFromProcessing.value = userSettings.value.find((el) => el.name === "withdraw_from_processing");
		toggleWithdrawFromProcessing.value = withdrawFromProcessing.value?.value === "enabled";
	});
</script>

<template>
	<div class="page">
		<breadcrumbs
			:current-route-title="$t('System settings')"
			:back-route-title="$t('Settings')"
			back-name-route="settings-system"
		/>
		<h1 class="global-title-h2 mb-8">
			{{ $t("General settings") }}
		</h1>

		<div v-if="isRootUser && rootGroupSettings.general.length" class="flex flex-column gap-24">
			<block-section class="settings" :title="$t('Main.many')">
				<div class="settings__rows">
					<template v-for="item in rootGroupSettings.general" :key="item.name">
						<row-setting-item
							v-if="
								item.name !== 'notification_sender' &&
								!(item.name === 'dv_admin_secret_key' && userRootSystemInfo?.app_profile !== 'dev')
							"
							v-model:value="item.value"
							:available-values="item.available_values"
							:is-disabled="!item.is_editable"
							:title="$t(item.name in ROOT_SETTING_LABELS ? ROOT_SETTING_LABELS[item.name] : item.name)"
							:description="
								ROOT_SETTING_GENERAL_DESCRIPTIONS[item.name] ? t(ROOT_SETTING_GENERAL_DESCRIPTIONS[item.name]) : ''
							"
						/>
					</template>
					<div class="row">
						<div class="row__content">
							<span class="row__content-title">{{ $t("Callback domain") }}</span>
							<span class="row__content-description"> {{ t(ROOT_SETTING_GENERAL_DESCRIPTIONS.callbackDomain) }}</span>
						</div>
						<div class="row__domain">
							<ui-input size="lg" filled v-model="callbackDomain" />
							<div class="row__domain-block">{{ callbackPathname }}</div>
						</div>
					</div>
				</div>
			</block-section>
			<ui-button mode="neutral" size="xl" :loading="isLoading" @click="handleChangeSettings">
				{{ $t("Save") }}
			</ui-button>
		</div>

		<block-section v-if="withdrawFromProcessing" class="processing" :title="$t('Advanced')">
			<div class="processing__row">
				<div class="processing__content">
					<span class="processing__content-title">
						{{
							$t(
								withdrawFromProcessing.name in ROOT_SETTING_LABELS
									? ROOT_SETTING_LABELS[withdrawFromProcessing.name]
									: withdrawFromProcessing.name
							)
						}}
					</span>
					<span class="processing__content-description">
						{{ $t("2FA verification required") }}
					</span>
				</div>
				<ui-switch v-model="toggleWithdrawFromProcessing" @change="handleChangeProcessing" />
				<otp-modal v-model:is-show="isShowOtpModal" :setting="withdrawFromProcessing" @close="handleCloseOtpModal" />
			</div>
		</block-section>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;
		.settings {
			display: flex;
			flex-direction: column;
			gap: 16px;
			&__rows {
				display: flex;
				flex-direction: column;
				gap: 20px;
				.row {
					display: grid;
					grid-template-columns: 292px 1fr;
					gap: 40px;
					&__content {
						display: flex;
						flex-direction: column;
						&-title {
							color: $black;
							font-size: 14px;
							font-weight: 500;
							line-height: 20px;
						}
						&-description {
							color: $secondary;
							font-size: 14px;
							font-weight: 400;
							line-height: 20px;
						}
					}
					&__domain {
						display: grid;
						grid-template-columns: 1fr 1fr;
						&:deep(.ui-input) {
							border-radius: 8px 0 0 8px;
						}
						&-block {
							align-self: flex-start;
							display: flex;
							align-items: center;
							height: 52px;
							border-radius: 0 8px 8px 0;
							background-color: $blue-light;
							padding: 0 12px;
							box-shadow: 0 0 0 1px $grey;
						}
					}
				}
			}
		}
		.processing {
			&__row {
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			&__content {
				display: flex;
				flex-direction: column;
				gap: 2px;
				&-title {
					color: $black;
					font-size: 14px;
					font-weight: 500;
					line-height: 16px;
				}
				&-description {
					color: $secondary;
					font-size: 12px;
					font-weight: 400;
					line-height: 16px;
				}
			}
		}
	}
</style>
