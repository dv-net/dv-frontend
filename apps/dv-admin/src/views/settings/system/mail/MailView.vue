<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { ROOT_SETTING_LABELS, ROOT_SETTING_MAIL_DESCRIPTIONS } from "@dv-admin/utils/constants/settings";
	import { UiButton, UiRadio, UiRadioGroup } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import RowSettingItem from "@dv-admin/views/settings/system/components/rowSettingItem/RowSettingItem.vue";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";
	import { storeToRefs } from "pinia";
	import { useSystemSettingsStore } from "@dv-admin/stores/systemSettings";
	import { onMounted, ref } from "vue";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { postApiNotificationsTest } from "@dv-admin/services/api/general";

	const { notify } = useNotifications();
	const { t } = useI18n();
	const { rootSettings, rootGroupSettings } = storeToRefs(useSystemSettingsStore());
	const { getRootSettings, postRootSetting } = useSystemSettingsStore();
	const { user } = storeToRefs(useAuthStore());

	const isLoading = ref<boolean>(false);
	const isLoadingNotificationsTest = ref<boolean>(false);
	const indexNotificationSender = ref<number>(-1);

	const handleChangeSettings = async () => {
		try {
			isLoading.value = true;
			if (rootGroupSettings.value.general[indexNotificationSender.value].value === "dv_net") {
				await postRootSetting("notification_sender", false);
			} else {
				const promises = rootGroupSettings.value.mailer
					.map((el) => {
						if (!el.is_editable) return;
						const isInput: boolean = !el?.available_values || !el?.available_values?.length;
						return postRootSetting(el.name, isInput);
					})
					.filter(Boolean);
				await Promise.all([...promises, postRootSetting("notification_sender", true)]);
			}
			await getRootSettings();
			notify(t("Email settings saved"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const postNotificationsTest = async (recipient: string) => {
		try {
			if (
				!user.value ||
				indexNotificationSender.value === -1 ||
				rootGroupSettings.value.general[indexNotificationSender.value].value !== "internal"
			)
				return;
			const mailerAddress = rootGroupSettings.value.mailer.find((item) => item.name === "mailer_address");
			const mailerSender = rootGroupSettings.value.mailer.find((item) => item.name === "mailer_sender");
			const mailerState = rootGroupSettings.value.mailer.find((item) => item.name === "mailer_state");
			if (!mailerAddress?.value) return notify(t("Please enter the correct address of your SMTP server"));
			if (!mailerSender?.value)
				return notify(t("Please provide a valid email address from which the letter will be sent"));
			if (!mailerState?.value || mailerState?.value !== "enabled") {
				return notify(t("For the module to work, the status state must be enabled"));
			}
			isLoadingNotificationsTest.value = true;
			await postApiNotificationsTest(recipient);
			notify(t("Test letter was sent to email", { email: recipient }), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingNotificationsTest.value = false;
		}
	};

	onMounted(async () => {
		if (!rootSettings.value.length) {
			await getRootSettings();
		}
		indexNotificationSender.value = rootGroupSettings.value.general.findIndex(
			(item) => item.name === "notification_sender"
		);
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('System settings')" back-name-route="settings-system" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Email settings") }}</h1>
		<block-section v-if="rootGroupSettings.mailer.length && indexNotificationSender !== -1" class="notifications">
			<h2 class="global-title-h3">{{ $t("Notifications") }}</h2>
			<ui-radio-group v-model="rootGroupSettings.general[indexNotificationSender].value" class="notifications__inner">
				<div class="notifications__item">
					<ui-radio value="dv_net">
						<span>{{ $t("Send via") }} dv.net</span>
					</ui-radio>
				</div>
				<div class="notifications__item">
					<ui-radio value="internal">
						<span>{{ $t("Send via") }} SMTP</span>
					</ui-radio>
				</div>
			</ui-radio-group>
			<div v-show="rootGroupSettings.general[indexNotificationSender].value === 'internal'" class="notifications__rows">
				<row-setting-item
					v-for="item in rootGroupSettings.mailer"
					:key="item.name"
					v-model:value="item.value"
					:available-values="item.available_values"
					:is-disabled="!item.is_editable"
					:title="item.name in ROOT_SETTING_LABELS ? $t(ROOT_SETTING_LABELS[item.name]) : item.name"
					:description="
						item.name in ROOT_SETTING_MAIL_DESCRIPTIONS ? $t(ROOT_SETTING_MAIL_DESCRIPTIONS[item.name]) : ''
					"
				/>
			</div>
		</block-section>
		<div class="flex flex-y-center flex-x-between">
			<ui-button mode="neutral" class="mt-24" size="xl" @click="handleChangeSettings" :loading="isLoading">
				{{ $t("Save") }}
			</ui-button>
			<ui-button
				v-if="
					user &&
					indexNotificationSender !== -1 &&
					rootGroupSettings.general[indexNotificationSender].value === 'internal'
				"
				type="secondary"
				class="mt-24"
				size="xl"
				:loading="isLoadingNotificationsTest"
				@click="postNotificationsTest(user.email)"
			>
				{{ $t("Send a test email") }}
			</ui-button>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		.notifications {
			display: flex;
			flex-direction: column;
			&__inner {
				display: flex;
				align-items: center;
				gap: 32px;
				margin: 16px 0 24px;
				padding: 14px 0;
			}
			&__item {
				display: flex;
				align-items: center;
				gap: 8px;
				padding: 2px 0;
				&:first-child {
					padding-right: 32px;
					border-right: 1px solid $grey-light;
				}
			}
			&__rows {
				display: flex;
				flex-direction: column;
				gap: 20px;
			}
		}
	}
</style>
