<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import { useRouter } from "vue-router";
	import { useI18n } from "vue-i18n";
	import { storeToRefs } from "pinia";
	import { UiButton, UiSkeleton } from "@dv.net/ui-kit";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import ModalCreatePayment from "@dv-admin/views/projects/components/modalCreatePayment/ModalCreatePayment.vue";
	import ProjectCard from "@dv-admin/views/projects/components/projectCard/ProjectCard.vue";
	import type { IStoreResponse } from "@dv-admin/utils/types/api/apiGo.ts";

	const { projects, selectedProject, isLoading } = storeToRefs(useProjectsStore());
	const { getProjects, postStoreArchive } = useProjectsStore();
	const router = useRouter();
	const { t } = useI18n();

	const isShowModalCreatePayment = ref<boolean>(false);
	const currentStore = ref<IStoreResponse | null>(null);

	const isEmpty = computed(() => !isLoading.value && projects.value.length === 0);

	const goToCreateStore = () => {
		router.push({ name: "projects-create" });
	};

	const webhooksHistoryHandler = async (id: string) => {
		selectedProject.value = id;
		await router.push({ name: "history-webhooks" });
	};

	const handleCreatePayment = (store: IStoreResponse) => {
		isShowModalCreatePayment.value = true;
		currentStore.value = store;
	};

	const archiveStore = async (store: IStoreResponse) => {
		await postStoreArchive(store.id);
	};

	onMounted(async () => {
		await getProjects();
	});
</script>

<template>
	<section class="page">
		<div class="page__header">
			<h1 class="global-title-h1">{{ $t("Projects") }}</h1>
			<ui-button mode="neutral" leftIconName="add" leftIconSize="lg" size="lg" @click="goToCreateStore">
				{{ $t("Create a store") }}
				<tooltip-helper :title="$t('Create a store')" :text="`${$t('Connect a new project')}.`" />
			</ui-button>
		</div>

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

		<block-section v-if="isEmpty" class="empty">
			<div class="empty__content">
				<div class="empty__title">{{ $t("No shops yet") }}</div>
				<div class="empty__text">{{ $t("Create your first shop to start accepting crypto payments") }}</div>
				<ui-button class="empty__button" mode="neutral" size="xxl" @click="goToCreateStore">
					{{ $t("Create a store") }}
				</ui-button>
			</div>
		</block-section>

		<div v-else class="page__list">
			<template v-if="isLoading && !projects.length">
				<ui-skeleton v-for="index in 2" :key="index" :rows="1" :row-height="216" :item-border-radius="20" />
			</template>
			<project-card
				v-for="store in projects"
				:key="store.id"
				:store="store"
				:archive="archiveStore"
				@edit="router.push({ name: 'projects-edit', params: { id: store.id } })"
				@create-payment="handleCreatePayment(store)"
				@webhooks="webhooksHistoryHandler(store.id)"
			/>
		</div>

		<modal-create-payment v-model:is-show="isShowModalCreatePayment" :currentStore="currentStore" />
	</section>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			flex-wrap: wrap;
		}

		&__list {
			display: flex;
			flex-direction: column;
			gap: 16px;
		}
	}

	.empty {
		&__content {
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: 12px;
			padding-block: 32px;

			@include mediamax(480) {
				padding-block: 24px;
			}
		}

		&__title {
			font-size: 20px;
			line-height: 125%;
			font-weight: 700;
			color: $black;
		}

		&__text {
			max-width: 360px;
			font-size: 14px;
			line-height: 140%;
			color: $secondary;
		}
	}
</style>
