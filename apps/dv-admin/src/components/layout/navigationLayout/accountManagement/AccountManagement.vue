<script setup lang="ts">
	import { useRouter } from "vue-router";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { storeToRefs } from "pinia";
	import { formatDollars } from "@shared/utils/helpers/general.ts";
	import { UiButton, UiTooltip, UiIcon, UiSkeleton } from "@dv.net/ui-kit";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import IconLogo from "@dv-admin/components/icons/IconLogo.vue";
	import IconUser from "@dv-admin/components/icons/IconUser.vue";

	const { isLoading, dictionary, hasNewVersion, systemVersions } = storeToRefs(useGeneralStore());
	const { ownerData } = storeToRefs(useAuthStore());
	const { getMyDvAuthLink } = useAuthStore();

	const router = useRouter();
	const frontendVersion: string = import.meta.env.VITE_APP_VERSION || "unknown";
</script>

<template>
	<ui-skeleton v-if="isLoading" :rows="1" :row-height="192" :item-border-radius="20" />
	<template v-else>
		<div v-if="ownerData" class="block">
			<div class="header" :class="{ 'header--center': ownerData?.is_authorized }">
				<icon-logo class="header__logo" />
				<span v-if="!ownerData?.is_authorized" class="header__label">{{ $t("Not connected") }}</span>
			</div>
			<div v-if="ownerData?.is_authorized" class="body">
				<div class="body__inner">
					<div class="body__icon">
						<icon-user />
					</div>
					<div class="body__content">
						<span class="body__content-email">DV.net {{ $t("account") }}</span>
						<span class="body__content-amount">{{ formatDollars(ownerData.balance) }}</span>
					</div>
				</div>
				<ui-button class="w-full" type="secondary" size="sm" left-icon-name="settings" @click="getMyDvAuthLink">
					{{ $t("Management") }}
				</ui-button>
			</div>
			<div v-else class="body">
				<span class="body__descr">{{ $t("Connect your DV.net account to expand your capabilities") }}</span>
				<div class="body__info">
					<ui-button class="w-full" type="secondary" size="sm" left-icon-name="key" @click="getMyDvAuthLink">
						{{ $t("Activate account") }}
					</ui-button>
					<div class="body__info-link">
						<span>{{ $t("What is this for?") }}</span>
						<ui-icon type="400" name="new-windows" size="sm" />
					</div>
				</div>
			</div>
			<div v-if="hasNewVersion" class="update-block">
				<div class="update-block__text">
					<ui-icon type="filled" name="error" size="sm" />
					<span>{{ $t("Update software") }}</span>
				</div>
				<ui-button class="w-full" mode="neutral" size="sm" @click="router.push({ name: 'settings-system-update' })">
					{{ $t("Update all") }}
				</ui-button>
			</div>
			<div v-else class="update-content">
				<ui-tooltip mode="dark" position="top-start" is-gold-title :title="$t('Latest versions')" :teleport="false">
					<span class="update-content__label"></span>
					<span class="update-content__text" @click="router.push({ name: 'settings-system-update' })">
						{{ $t("No updates required") }}
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
</template>

<style scoped lang="scss">
	.block {
		display: flex;
		flex-direction: column;
		gap: 4px;
		overflow: hidden;
		border-radius: 20px;
		max-width: 216px;
		width: 100%;
		background-color: rgba(247, 249, 251, 1);
		padding: 4px;
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px 8px 12px;
			border-radius: 16px;
			box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.06);
			background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.5) 100%);
			&--center {
				justify-content: center;
			}
			&__logo {
				width: 55px;
				height: 16px;
			}
			&__label {
				color: rgba(164, 165, 177, 1);
				font-size: 12px;
				font-weight: 400;
				line-height: 16px;
			}
		}
		.body {
			box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.06);
			display: flex;
			flex-direction: column;
			gap: 32px;
			padding: 12px;
			border-radius: 16px;
			background: linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.5) 1.266%,
				rgba(255, 255, 255, 1) 41.772%,
				rgba(255, 255, 255, 0.5) 100%
			);
			&__inner {
				display: flex;
				align-items: center;
				gap: 8px;
			}
			&__icon {
				width: 40px;
				height: 40px;
				@extend .center;
				padding: 6px;
				border-radius: 100px;
				background: rgba(247, 249, 251, 1);
				color: rgb(255, 95, 0);
			}
			&__content {
				display: flex;
				flex-direction: column;
				&-email {
					color: rgba(164, 165, 177, 1);
					font-size: 12px;
					font-weight: 400;
					line-height: 16px;
				}
				&-amount {
					color: rgba(48, 51, 69, 1);
					font-size: 18px;
					font-weight: 500;
					line-height: 26px;
				}
			}
			&__descr {
				color: rgba(164, 165, 177, 1);
				font-size: 12px;
				font-weight: 400;
				line-height: 16px;
			}
			&__info {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 8px;
				&-link {
					display: flex;
					align-items: center;
					gap: 4px;
					color: rgba(25, 104, 229, 1);
					font-size: 11px;
					font-weight: 500;
					line-height: 16px;
				}
			}
		}
		.update-content {
			display: flex;
			padding: 4px 0 4px 8px;
			&__label {
				width: 8px;
				height: 8px;
				cursor: pointer;
				border-radius: 446.67px;
				background: rgba(164, 165, 177, 1);
			}
			&__text {
				position: relative;
				cursor: pointer;
				height: 16px;
				color: rgba(164, 165, 177, 1);
				font-size: 12px;
				font-weight: 700;
				line-height: 16px;
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
		}
		.update-block {
			display: flex;
			flex-direction: column;
			border-radius: 16px;
			gap: 12px;
			padding: 12px;
			box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.06);
			background: linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.5) 1.266%,
				rgba(255, 255, 255, 1) 41.772%,
				rgba(255, 255, 255, 0.5) 100%
			);
			&__text {
				display: flex;
				align-items: center;
				gap: 4px;
				color: rgba(237, 10, 52, 1);
				font-size: 12px;
				font-weight: 700;
				line-height: 16px;
			}
		}
	}
</style>
