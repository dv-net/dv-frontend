<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";
	import { storeToRefs } from "pinia";
	import { useI18n } from "vue-i18n";
	import { UiSkeleton } from "@dv.net/ui-kit";
	import { getApiRefundRequests, postApiRefundReject } from "@dv-admin/utils/services/refunds";
	import type { IRefundRequest } from "@dv-admin/utils/types/api/apiGo";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import RefundRequestCard from "@dv-admin/views/projects/refunds/components/RefundRequestCard.vue";

	const { t } = useI18n();
	const { notify } = useNotifications();
	const { projects } = storeToRefs(useProjectsStore());
	const { getProjects } = useProjectsStore();

	const refundRequests = ref<IRefundRequest[]>([]);
	const isLoading = ref(false);

	const projectNameById = computed(() => {
		return new Map(projects.value.map((project) => [project.id, project.name]));
	});

	const loadRefundRequests = async () => {
		try {
			isLoading.value = true;
			refundRequests.value = (await getApiRefundRequests()) ?? [];
		} catch (error) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const handleReject = async (refundId: string) => {
		await postApiRefundReject(refundId);
		refundRequests.value = refundRequests.value.filter((item) => item.id !== refundId);
		notify(t("Refund request rejected"), "success");
	};

	onMounted(async () => {
		await Promise.all([getProjects(), loadRefundRequests()]);
	});
</script>

<template>
	<div class="page">
		<div class="page__header">
			<div class="page__intro">
				<div class="page__title-row">
					<h1 class="global-title-h1">{{ $t("Refund requests") }}</h1>
					<span v-if="!isLoading && refundRequests.length" class="page__count">
						{{ refundRequests.length }}
					</span>
				</div>
				<p class="page__subtitle">
					{{
						$t("Payers can request a refund for deposits blocked by AML. Review pending requests here")
					}}
				</p>
			</div>
		</div>

		<section class="panel">
			<div v-if="isLoading" class="panel__body">
				<div class="panel-card panel-card--skeleton">
					<ui-skeleton :rows="1" :row-height="156" :item-border-radius="20" />
				</div>
				<div class="panel-card panel-card--skeleton">
					<ui-skeleton :rows="1" :row-height="156" :item-border-radius="20" />
				</div>
			</div>

			<div v-else-if="!refundRequests.length" class="panel-card panel-card--empty">
				{{ $t("No pending refund requests") }}
			</div>

			<div v-else class="panel__body">
				<refund-request-card
					v-for="item in refundRequests"
					:key="item.id"
					:item="item"
					:project-name="projectNameById.get(item.store_id)"
					:reject-request="() => handleReject(item.id)"
				/>
			</div>
		</section>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;

		&__header {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}

		&__intro {
			display: flex;
			flex-direction: column;
			gap: 8px;
			min-width: 0;
		}

		&__title-row {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		&__subtitle {
			margin: 0;
			color: $secondary;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
		}

		&__count {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 22px;
			height: 22px;
			padding: 0 6px;
			border-radius: 11px;
			background: rgba(48, 51, 69, 0.06);
			color: $secondary;
			font-size: 12px;
			font-weight: 500;
			line-height: 1;
		}
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 4px;
		border-radius: 24px;
		background: $blue-opacity;

		&__body {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}
	}

	.panel-card {
		padding: 20px;
		border-radius: 20px;
		background: $white;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);

		&--skeleton {
			padding: 8px;
		}

		&--empty {
			color: $secondary;
			font-size: 14px;
			line-height: 20px;
			text-align: center;
		}
	}
</style>
