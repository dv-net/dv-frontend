<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { storeToRefs } from "pinia";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { useRouter } from "vue-router";
	import { UiButton, UiIconButton, UiTable, UiTooltip } from "@dv.net/ui-kit";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import ModalCreatePayment from "@dv-admin/views/projects/components/modalCreatePayment/ModalCreatePayment.vue";
	import type { IStoreResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import StatusBadge from "@dv-admin/components/ui/statusBadge/StatusBadge.vue";
	import {
		STORE_VERIFICATION_STATUS_LABELS,
		STORE_VERIFICATION_STATUS_MODES
	} from "@dv-admin/utils/constants/root";

	const { projects, selectedProject, isLoading } = storeToRefs(useProjectsStore());
	const { getProjects, postStoreArchive } = useProjectsStore();
	const router = useRouter();
	const { t } = useI18n();

	const isShowModalCreatePayment = ref<boolean>(false);
	const currentStore = ref<IStoreResponse | null>(null);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Created"), width: "160" },
		{ name: "name", label: t("Name"), width: "180" },
		{ name: "verification_status", label: t("Verification status"), width: "140" },
		{ name: "actions", width: "400", align: "right" }
	]);

	const hasVerification = (store: IStoreResponse) => Boolean(store.verification_status);

	const webhooksHistoryHandler = async (id: string) => {
		selectedProject.value = id;
		await router.push({ name: "history-webhooks" });
	};

	const handleCreatePayment = (store: IStoreResponse) => {
		isShowModalCreatePayment.value = true;
		currentStore.value = store;
	};

	onMounted(async () => {
		await getProjects();
	});
</script>

<template>
	<div class="page">
		<div class="page__header">
			<h1 class="global-title-h1">{{ $t("Projects") }}</h1>
			<ui-button
				mode="neutral"
				leftIconName="add"
				leftIconSize="lg"
				size="lg"
				@click="router.push({ name: 'projects-create' })"
			>
				{{ $t("Create a store") }}
				<tooltip-helper :title="$t('Create a store')" :text="`${$t('Connect a new project')}.`" />
			</ui-button>
		</div>
		<div class="mt-32 mb-16">
			<ui-button
				type="secondary"
				size="xl"
				left-icon-name="archive"
				left-icon-type="filled"
				left-icon-size="md"
				right-icon-name="arrow-forward 1"
				right-icon-type="400"
				right-icon-size="md"
				@click="router.push({ name: 'projects-archive' })"
			>
				{{ $t("Projects in the archive") }}
			</ui-button>
		</div>
		<ui-table :loading="isLoading" :headers="headers" :data="projects" table-layout="fixed">
			<template #body-cell-created_at="{ row }">
				{{ formatDate(row.created_at) }}
			</template>
			<template #body-cell-verification_status="{ row }">
				<status-badge
					v-if="hasVerification(row)"
					:label="$t(STORE_VERIFICATION_STATUS_LABELS[row.verification_status!])"
					:mode="STORE_VERIFICATION_STATUS_MODES[row.verification_status!]"
				/>
			</template>
			<template #body-cell-actions="{ row }">
				<div class="actions">
					<ui-button
						type="tertiary"
						size="lg"
						left-icon-name="add-circle"
						left-icon-size="md"
						@click="handleCreatePayment(row)"
					>
						{{ $t("Create payment") }}
					</ui-button>
					<ui-button
						type="tertiary"
						size="lg"
						left-icon-name="edit-square"
						left-icon-size="md"
						@click="router.push({ name: 'projects-edit', params: { id: row.id } })"
					>
						{{ $t("Edit") }}
					</ui-button>
					<ui-tooltip mode="dark" :title="$t('Archive.verb')" :text="$t('Move the project to the archive')">
						<ui-icon-button
							icon-name="archive"
							icon-type="filled"
							icon-color="#1968e5"
							size="lg"
							@click="postStoreArchive(row.id, $t('Project is archived'))"
						/>
					</ui-tooltip>
					<ui-tooltip
						mode="dark"
						:title="$t('History of webhooks')"
						:text="
							$t(
								'A log of all sent notifications: which and when they were sent, what the server response was, the status of the execution and other service information.'
							)
						"
					>
						<ui-icon-button
							icon-name="description (1)"
							icon-color="#1968e5"
							size="lg"
							@click="webhooksHistoryHandler(row.id)"
						/>
					</ui-tooltip>
				</div>
			</template>
		</ui-table>
		<modal-create-payment v-model:is-show="isShowModalCreatePayment" :currentStore="currentStore" />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		&__header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.actions {
			display: flex;
			flex-wrap: nowrap;
			align-items: center;
			gap: 4px;
			white-space: nowrap;
		}

		:deep(.ui-table__body-cell:has(.ui-button)) {
			padding: 4px;
		}
	}
</style>
