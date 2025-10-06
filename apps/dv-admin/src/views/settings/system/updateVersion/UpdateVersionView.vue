<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { useRouter } from "vue-router";
	import { storeToRefs } from "pinia";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { UiButton, UiIcon, UiSkeleton, UiConfirm } from "@dv.net/ui-kit";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { postApiSystemUpdateBackend, postApiSystemUpdateProcessing } from "@dv-admin/services/api/systemSettings";
	import { usePolling } from "@shared/utils/composables/usePolling";

	const router = useRouter();
	const { isLoading, hasNewVersion, dictionary, systemVersions } = storeToRefs(useGeneralStore());
	const { getSystemVersions } = useGeneralStore();
	const { startPolling, stopPolling, isActivePolling } = usePolling();

	const isLoadingUpdateVersions = ref<boolean>(false);

	const isDisabledBtn = computed<boolean>(() => !hasNewVersion.value || isActivePolling.value);
	const isInstallUpdater = computed<boolean>(() => {
		return !!systemVersions.value?.new_processing_version && !!systemVersions.value?.new_backend_version;
	});

	const versions = computed(() => {
		const backendCurrent: string =
			systemVersions.value?.new_backend_version?.installed_version || dictionary.value?.backend_version_tag || "—";
		const backendNew: string = systemVersions.value?.new_backend_version?.available_version || "—";
		const processingCurrent: string =
			systemVersions.value?.new_processing_version?.installed_version ||
			dictionary.value?.processing_version_tag ||
			"—";
		const processingNew: string = systemVersions.value?.new_processing_version?.available_version || "—";
		return { backendNew, backendCurrent, processingNew, processingCurrent };
	});

	const handleUpdateVersions = async () => {
		try {
			isLoadingUpdateVersions.value = true;
			if (systemVersions.value?.new_processing_version?.need_for_update) {
				await postApiSystemUpdateProcessing();
				await startPolling(async () => await getSystemVersions(true));
			}
			if (systemVersions.value?.new_backend_version?.need_for_update) {
				await postApiSystemUpdateBackend();
				await startPolling(async () => await getSystemVersions(true));
			}
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingUpdateVersions.value = false;
		}
	};

	const updatePageWithRemoveCache = async () => {
		await router.push({
			query: {
				backend: systemVersions.value?.new_backend_version?.installed_version,
				processing: systemVersions.value?.new_processing_version?.installed_version
			}
		});
		router.go(0);
	};

	watch(
		systemVersions,
		(newValue, prevValue) => {
			if (
				(prevValue?.new_backend_version?.need_for_update || prevValue?.new_processing_version?.need_for_update) &&
				!newValue?.new_backend_version?.need_for_update &&
				!newValue?.new_processing_version?.need_for_update
			) {
				stopPolling();
				setTimeout(updatePageWithRemoveCache, 10000);
			}
		},
		{ deep: true }
	);

	onMounted(async () => {
		await getSystemVersions();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('System settings')" back-name-route="settings-system" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Update.noun") }}</h1>

		<block-section
			v-if="!isActivePolling && isLoading"
			mode="grey-border"
			class="flex flex-column gap-18"
			style="width: 624px"
		>
			<ui-skeleton style="width: 250px" :rows="1" :row-height="20" first-color="#fff" />
			<div class="flex gap-24">
				<ui-skeleton :rows="3" :row-height="20" :rows-gap="8" first-color="#fff" />
				<ui-skeleton :rows="3" :row-height="20" :rows-gap="8" first-color="#fff" />
			</div>
			<ui-skeleton style="width: 125px" :rows="1" :row-height="32" first-color="#fff" />
		</block-section>

		<div v-else class="page__inner">
			<block-section v-if="isInstallUpdater" mode="grey-border" class="card">
				<div class="card__top" :class="{ 'card__top--red': hasNewVersion }">
					<ui-icon
						v-if="isActivePolling"
						class="card__top--animation"
						name="autorenew 1"
						type="400"
						size="md"
						color="#ff9e00"
					/>
					<ui-icon v-else name="error" type="filled" size="md" />
					<span v-if="isActivePolling" class="card__top--yellow">
						{{ $t("Updating in progress") }}
					</span>
					<span v-else>
						{{ $t(hasNewVersion ? "Update your software" : "No updates required") }}
					</span>
				</div>
				<div class="card__content">
					<div class="column">
						<span class="column__header">Merchant</span>
						<div class="column__inner">
							<div class="column__row">
								<span class="column__label">{{ $t("Installed") }}:</span>
								<span class="column__text">{{ versions.backendCurrent }}</span>
							</div>
							<div class="column__row">
								<span class="column__label">{{ $t("Available for installation") }}:</span>
								<span class="column__text">{{ versions.backendNew }}</span>
							</div>
						</div>
					</div>
					<div class="column">
						<span class="column__header">Processing</span>
						<div class="column__inner">
							<div class="column__row">
								<span class="column__label">{{ $t("Installed") }}:</span>
								<span class="column__text">{{ versions.processingCurrent }}</span>
							</div>
							<div class="column__row">
								<span class="column__label">{{ $t("Available for installation") }}:</span>
								<span class="column__text">{{ versions.processingNew }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="card__bottom">
					<ui-confirm :method="handleUpdateVersions" @click.stop :title="`${$t('Update all')}?`">
						<ui-button mode="neutral" size="lg" :disabled="isDisabledBtn" :loading="isLoadingUpdateVersions">
							{{ $t("Update all") }}
						</ui-button>
					</ui-confirm>
				</div>
			</block-section>
			<block-section v-else mode="grey-border" class="not-found">
				<span>{{ $t("Updater not installed") }}</span>
			</block-section>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		&__inner {
			display: flex;
			flex-direction: column;
			.card {
				display: flex;
				flex-direction: column;
				width: max-content;
				min-width: 500px;
				&__top {
					display: flex;
					align-items: center;
					gap: 4px;
					color: #1f9649;
					font-size: 18px;
					font-weight: 500;
					line-height: 20px;
					&--animation {
						color: #ff9e00;
						animation: rotate 1s linear infinite;
					}
					&--red {
						color: #dd4c1e;
					}
					&--yellow {
						color: #ff9e00;
					}
				}
				&__content {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 24px;
					margin: 16px 0 20px;
					.column {
						display: flex;
						flex-direction: column;
						gap: 12px;
						&__header {
							color: $black;
							font-size: 16px;
						}
						&__inner {
							display: flex;
							flex-direction: column;
							gap: 8px;
						}
						&__row {
							display: flex;
							align-items: center;
							gap: 8px;
						}
						&__label {
							color: $secondary;
							font-size: 14px;
						}
						&__text {
							color: $black;
							font-size: 16px;
						}
					}
				}
				&__bottom {
					display: flex;
					align-items: center;
					gap: 12px;
				}
			}
		}
		.not-found {
			font-size: 18px;
			@extend .center;
			width: max-content;
			min-width: 500px;
		}
	}
	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
