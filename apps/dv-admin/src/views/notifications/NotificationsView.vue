<script setup lang="ts">
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { computed, onMounted, ref } from "vue";
	import { UiCopyText, UiInput, UiSelect, UiTable } from "@dv.net/ui-kit";
	import { useNotificationsStore } from "@dv-admin/stores/notifications";
	import { storeToRefs } from "pinia";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import { useI18n } from "vue-i18n";
	import type { INotificationsItemResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general.ts";
	import NotFoundMessage from "@dv-admin/components/ui/notFoundMessage/NotFoundMessage.vue";
	import { debounce } from "@shared/utils/helpers/debounce.ts";

	const { t } = useI18n();

	const { isLoading, notificationsList, notificationsPagination, notificationsFilter, notificationsTypes } =
		storeToRefs(useNotificationsStore());
	const { getNotifications, getNotificationsTypes } = useNotificationsStore();

	const expandListUuid = ref<string[]>([]);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Date"), width: "180" },
		{ name: "type", label: t("Mail template type") },
		{ name: "destination", label: t("Recipient") },
		{ name: "sender", label: t("Sender") },
		{ name: "channel", label: t("Channel"), width: "100" },
		{ expande: true, width: "70" }
	]);

	const debounceNotifications = debounce(getNotifications, 500);

	const options = computed<IUiSelectOptions[]>(() => {
		return notificationsTypes.value.map((item) => ({ value: item.value, label: t(item.label) }));
	});

	const optionsChannel = computed<IUiSelectOptions[]>(() => {
		return [
			{ value: "email", label: "Email" },
			{ value: "telegram", label: "Telegram" }
		];
	});

	const notificationTemplate = computed<Record<string, string>>(() => {
		return notificationsTypes.value.reduce(
			(acc, item) => {
				acc[item.value] = t(item.label);
				return acc;
			},
			{} as Record<string, string>
		);
	});

	const changePageHandler = async (pagination: UiPaginationMeta) => {
		notificationsFilter.value.page = pagination.page;
		await getNotifications();
	};

	const handleOpenRow = (row: INotificationsItemResponse) => {
		if (expandListUuid.value.includes(row.id)) {
			expandListUuid.value = expandListUuid.value.filter((item) => item !== row.id);
		} else {
			expandListUuid.value.push(row.id);
		}
	};

	const handleRowClick = async (row: INotificationsItemResponse) => {
		handleOpenRow(row);
	};

	onMounted(async () => {
		await Promise.all([getNotificationsTypes(), getNotifications()]);
	});
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("Notifications") }}</h1>
		<div class="page__filters">
			<ui-select
				v-model="notificationsFilter.types"
				:options="options"
				:placeholder="$t('Mail template type')"
				clearable
				@change="getNotifications"
				@clear="getNotifications"
			/>
			<ui-select
				v-model="notificationsFilter.channels"
				:options="optionsChannel"
				:placeholder="$t('Channel')"
				clearable
				@change="getNotifications"
				@clear="getNotifications"
			/>
			<ui-input
				v-model="notificationsFilter.destinations"
				placeholder="Email"
				is-empty-value-null
				@input="debounceNotifications"
				clearable
				@clear="getNotifications"
			/>
		</div>
		<ui-table
			row-key="id"
			:loading="isLoading"
			:headers="headers"
			:data="notificationsList"
			:meta="notificationsPagination"
			v-model:expanded="expandListUuid"
			@change-pagination="changePageHandler"
			:isShowPerPageSelect="false"
			table-layout="fixed"
			expande-key="id"
			@row-click="handleRowClick"
			:row-class="() => 'pointer'"
		>
			<template #body-cell-created_at="{ row }">
				{{ formatDate(row.created_at) }}
			</template>
			<template #body-cell-type="{ row }">
				{{ row.type in notificationTemplate ? notificationTemplate[row.type] : row.type }}
			</template>
			<template #expande="{ row }">
				<div v-if="row.message_text" class="expande">
					<div class="expande__copy">
						<span>{{ $t("Copy") }}</span>
						<ui-copy-text :copied-text="row.message_text" size-icon="sm" color-icon="#828282" />
					</div>
					<div class="expande__mail" v-html="row.message_text" />
				</div>
				<div v-else class="px-24 py-12">
					<not-found-message />
				</div>
			</template>
		</ui-table>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		&__filters {
			margin-top: 32px;
			margin-bottom: 24px;
			width: 100%;
			display: grid;
			grid-template-columns: 450px 1fr 1fr;
			gap: 16px;
		}
		.expande {
			display: flex;
			flex-direction: column;
			gap: 8px;
			padding: 12px 24px;
			&__copy {
				display: flex;
				align-items: center;
				gap: 4px;
			}
			&__mail {
				border-radius: 12px;
				border: 1px solid $grey;
				overflow: hidden;
			}
		}
	}
</style>
