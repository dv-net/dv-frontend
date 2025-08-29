<script setup lang="ts">
	import { ref } from "vue";
	import { useRouter } from "vue-router";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { storeToRefs } from "pinia";
	import { formatDollars } from "@shared/utils/helpers/general";
	import { UiButton, UiTooltip, UiLoading } from "@dv.net/ui-kit";
	import { useGeneralStore } from "@dv-admin/stores/general";

	const { isLoading: isLoadingVersions, dictionary, hasNewVersion, systemVersions } = storeToRefs(useGeneralStore());
	const { ownerData } = storeToRefs(useAuthStore());
	const { getMyDvAuthLink } = useAuthStore();

	const router = useRouter();
	const frontendVersion: string = import.meta.env.VITE_APP_VERSION || "unknown";
	const isLoading = ref(false);
</script>

<template>
	<div v-if="ownerData" class="block">
		<div class="block__inner">
			<div class="top">
				<span class="top__label">DV.net {{ $t("account") }}</span>
				<span class="top__amount">
					{{ formatDollars(ownerData.balance) }}
				</span>
			</div>

			<span class="line" />

			<ui-button class="button" type="outline" size="md" :loading="isLoading" @click="getMyDvAuthLink" mode="neutral">
				{{ $t(ownerData.is_authorized ? "Go to account" : "Sing up") }}
			</ui-button>
		</div>

		<div class="bottom">
			<ui-tooltip mode="dark" position="top-start" is-gold-title :title="$t('Latest versions')">
				<span v-if="!isLoadingVersions" class="bottom__label" :class="{ red: hasNewVersion }"></span>

				<span class="bottom__text" @click="router.push({ name: 'settings-system-update' })">
					<ui-loading :is-show="isLoadingVersions" />

					<template v-if="!isLoadingVersions">
						{{ $t(hasNewVersion ? "Update required" : "No updates required") }}
					</template>
				</span>

				<template #text>
					<div class="versions">
						<span class="versions__item">
							<b style="color: #fff">Merchant:</b>
							{{
								systemVersions?.new_backend_version?.available_version || dictionary?.backend_version_tag || "unknown"
							}}
						</span>

						<span class="versions__item">
							<b style="color: #fff">Processing:</b>
							{{
								systemVersions?.new_processing_version?.available_version ||
								dictionary?.processing_version_tag ||
								"unknown"
							}}
						</span>

						<span class="versions__item"> <b style="color: #fff">Frontend:</b> {{ frontendVersion }} </span>
					</div>
				</template>
			</ui-tooltip>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.block {
		display: flex;
		flex-direction: column;
		min-width: 228px;
		width: fit-content;
		border-radius: 8px;
		border: 1px solid $grey;
		overflow: hidden;

		&__inner {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			gap: 16px;
			background-color: $blue-opacity;
			padding: 16px;

			.top {
				display: flex;
				flex-direction: column;

				&__label {
					color: $secondary;
					font-size: 12px;
					font-weight: 600;
					line-height: 16px;
				}

				&__amount {
					color: $black;
					font-size: 20px;
					font-weight: 600;
					line-height: 32px;
				}
			}

			.line {
				background-color: $grey;
				height: 1px;
				width: 100%;
			}

			.button {
				width: 100%;
				background-color: $white;
			}
		}

		.bottom {
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: $white;
			padding: 8px 16px;

			&__label {
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background-color: #1f9649;
				cursor: pointer;

				&.red {
					background-color: #dd4c1e;
				}
			}

			&__text {
				position: relative;
				cursor: pointer;
				color: $secondary;
				font-size: 11px;
				font-weight: 500;
				line-height: 16px;
				height: 16px;
			}
		}
	}

	.versions {
		display: flex;
		flex-direction: column;
		min-width: 200px;

		&__item {
			color: rgba(255, 255, 255, 0.8);
			font-size: 12px;
			font-weight: 400;
			line-height: 16px;
		}
	}
</style>
