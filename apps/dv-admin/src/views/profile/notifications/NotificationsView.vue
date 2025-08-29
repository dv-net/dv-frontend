<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { UiCheckbox, UiSkeleton } from "@dv.net/ui-kit/dist";
	import { computed, onMounted, ref } from "vue";
	import { titlesNotifications, topicsNotifications } from "@dv-admin/utils/constants/profile";
	import { UiButton } from "@dv.net/ui-kit";
	import { useI18n } from "vue-i18n";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import type { INotificationsListResponse } from "@dv-admin/utils/types/api/apiGo";
	import { getApiNotificationsList, patchApiNotifications } from "@dv-admin/services/api/auth";
	import { storeToRefs } from "pinia";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { useRouter } from "vue-router";

	const { t } = useI18n();
	const router = useRouter();
	const { notify } = useNotifications();
	const { ownerData } = storeToRefs(useAuthStore());

	const isLoading = ref<boolean>(false);
	const notificationsList = ref<INotificationsListResponse[][]>([]);
	const isLoadingPatchNotifications = ref<boolean>(false);
	const selectedAllMail = ref<boolean>(false);
	const selectedAllTelegram = ref<boolean>(false);

	const isConnectTelegram = computed<boolean>(() => !!ownerData.value?.telegram);

	const getTitleNotifications = (name: string): string => {
		if (!name) return "Unknown error";
		return name in titlesNotifications ? titlesNotifications[name] : name;
	};

	const handleSelectedAll = (type: "mail" | "telegram") => {
		notificationsList.value.flat().forEach((item) => {
			if (type === "mail") item.email_enabled = selectedAllMail.value;
			if (type === "telegram") item.tg_enabled = selectedAllTelegram.value;
		});
	};

	const getNotificationsList = async () => {
		try {
			isLoading.value = true;
			const data = await getApiNotificationsList();
			if (data) {
				const system = data.filter((item) => item.category === "system");
				const event = data.filter((item) => item.category === "event");
				const report = data.filter((item) => item.category === "report");
				notificationsList.value = [system, event, report];
				selectedAllMail.value = notificationsList.value.flat().every((item) => item.email_enabled);
				selectedAllTelegram.value = notificationsList.value.flat().every((item) => item.tg_enabled);
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const patchNotifications = async () => {
		try {
			isLoadingPatchNotifications.value = true;
			await patchApiNotifications(notificationsList.value.flat());
			notify(t("Notifications are updated"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingPatchNotifications.value = false;
		}
	};

	onMounted(async () => {
		await getNotificationsList();
	});
</script>

<template>
	<div class="notifications">
		<block-section class="notifications__section">
			<h3 class="global-title-h3">{{ $t("Notifications settings") }}</h3>
			<ui-skeleton v-if="isLoading" :row-height="44" :rows-gap="12" :item-border-radius="8" />
			<div v-else class="notifications__inner">
				<div class="notifications__block">
					<div class="row">
						<span></span>
						<span class="row__column">{{ $t("Email") }}</span>
						<span class="row__column">Telegram</span>
					</div>
					<div class="row">
						<span class="row__header">{{ $t("All notifications") }}</span>
						<span class="row__column">
							<ui-checkbox v-model="selectedAllMail" @change="handleSelectedAll('mail')" />
						</span>
						<span v-if="isConnectTelegram" class="row__column">
							<ui-checkbox v-model="selectedAllTelegram" @change="handleSelectedAll('telegram')" />
						</span>
						<span v-else class="row__column">
							<ui-button mode="neutral" size="sm" @click="router.push({ name: 'profile-telegram' })">
								{{ $t("Connect") }}
							</ui-button>
						</span>
					</div>
					<div class="row">
						<span class="row__header">{{ $t(topicsNotifications[0]) }}</span>
					</div>
					<div class="row" v-for="item in notificationsList[0]" :key="item.id">
						<span class="row__label">{{ $t(getTitleNotifications(item.name)) }}</span>
						<span class="row__column">
							<ui-checkbox v-model="item.email_enabled" />
						</span>
						<span class="row__column">
							<ui-checkbox v-model="item.tg_enabled" :disabled="!isConnectTelegram" />
						</span>
					</div>
				</div>
				<div class="notifications__block">
					<div class="row">
						<span class="row__header">{{ $t(topicsNotifications[1]) }}</span>
					</div>
					<div class="row" v-for="item in notificationsList[1]" :key="item.id">
						<span class="row__label">{{ $t(getTitleNotifications(item.name)) }}</span>
						<span class="row__column">
							<ui-checkbox v-model="item.email_enabled" />
						</span>
						<span class="row__column">
							<ui-checkbox v-model="item.tg_enabled" :disabled="!isConnectTelegram" />
						</span>
					</div>
				</div>
				<div class="notifications__block">
					<div class="row">
						<span class="row__header">{{ $t(topicsNotifications[2]) }}</span>
					</div>
					<div class="row" v-for="item in notificationsList[2]" :key="item.id">
						<span class="row__label">{{ $t(getTitleNotifications(item.name)) }}</span>
						<span class="row__column">
							<ui-checkbox v-model="item.email_enabled" />
						</span>
						<span class="row__column">
							<ui-checkbox v-model="item.tg_enabled" :disabled="!isConnectTelegram" />
						</span>
					</div>
				</div>
				<ui-button mode="neutral" :loading="isLoadingPatchNotifications" @click="patchNotifications">
					{{ $t("Save") }}
				</ui-button>
			</div>
		</block-section>
	</div>
</template>

<style scoped lang="scss">
	.notifications {
		display: flex;
		flex-direction: column;
		&__section {
			display: flex;
			flex-direction: column;
			gap: 24px;
		}
		&__inner {
			display: flex;
			flex-direction: column;
			gap: 24px;
		}
		&__block {
			display: flex;
			flex-direction: column;
			.row {
				display: grid;
				grid-template-columns: 1fr 100px 100px;
				padding: 12px 0;
				color: $black;
				line-height: 20px;
				font-size: 16px;
				&__header {
					font-weight: 500;
				}
				&__label {
					font-weight: 400;
				}
				&__column {
					display: flex;
					justify-content: center;
					align-items: center;
					font-weight: 700;
				}
			}
		}
	}
</style>
