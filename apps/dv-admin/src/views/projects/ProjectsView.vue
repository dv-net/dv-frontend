<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit/dist";
	import { computed, onMounted, ref } from "vue";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { storeToRefs } from "pinia";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { useRouter } from "vue-router";
	import { UiTable } from "@dv.net/ui-kit";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import ModalCreatePayment from "@dv-admin/views/projects/components/modalCreatePayment/ModalCreatePayment.vue";
	import type { IStoreResponse } from "@dv-admin/utils/types/api/apiGo.ts";

	const { projects, selectedProject, isLoading } = storeToRefs(useProjectsStore());
	const { getProjects, postStoreArchive } = useProjectsStore();
	const router = useRouter();
	const { t } = useI18n();

	const isShowModalCreatePayment = ref<boolean>(false);
	const currentStore = ref<IStoreResponse | null>(null);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Created") },
		{ name: "name", label: t("Name") },
		{ name: "actions", label: t("Actions"), width: "720" }
	]);

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
			<template #body-cell-actions="{ row }">
				<div class="flex flex-y-center">
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
					<ui-button
						type="tertiary"
						size="lg"
						left-icon-name="archive"
						left-icon-type="filled"
						left-icon-size="md"
						@click="postStoreArchive(row.id, $t('Project is archived'))"
					>
						{{ $t("Archive.verb") }}
					</ui-button>

					<div class="button-tooltip-container">
						<ui-button
							type="tertiary"
							size="lg"
							left-icon-name="description (1)"
							left-icon-size="md"
							@click="webhooksHistoryHandler(row.id)"
						>
							{{ $t("History of webhooks") }}
						</ui-button>
						<tooltip-helper
							class="absolute-tooltip"
							icon-color="#1968e5"
							:title="$t('History of webhooks')"
							:text="
								$t(
									'A log of all sent notifications: which and when they were sent, what the server response was, the status of the execution and other service information.'
								)
							"
						/>
					</div>
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
		.button-tooltip-container {
			position: relative;
			margin-right: 22px;
			.absolute-tooltip {
				position: absolute;
				top: 4px;
				right: -2px;
				transform: translateX(100%);
			}
		}

		:deep(.ui-table__body-cell:has(.ui-button)) {
			padding: 4px;
		}
	}
</style>
