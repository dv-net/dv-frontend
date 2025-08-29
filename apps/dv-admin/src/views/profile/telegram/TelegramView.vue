<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { computed, ref, watch } from "vue";
	import RowConnectTelegram from "@dv-admin/views/profile/telegram/components/RowConnectTelegram.vue";
	import { UiCopyText, UiIcon, UiLink, UiSkeleton } from "@dv.net/ui-kit/dist";
	import QrcodeVue from "qrcode.vue";
	import type { IUserTgLinkResponse } from "@dv-admin/utils/types/api/apiGo";
	import { postApiUserTgLink } from "@dv-admin/services/api/auth";
	import { storeToRefs } from "pinia";
	import { useAuthStore } from "@dv-admin/stores/auth";
	import { useRouter } from "vue-router";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { itemsTelegram, advantagesCardsTelegram } from "@dv-admin/utils/constants/profile";
	import { UiButton } from "@dv.net/ui-kit";

	const router = useRouter();
	const { ownerData } = storeToRefs(useAuthStore());
	const { getMyDvAuthLink } = useAuthStore();

	const isLoading = ref<boolean>(false);
	const infoTg = ref<IUserTgLinkResponse | null>(null);

	const isAuthorizedLc = computed<boolean>(() => Boolean(ownerData.value?.is_authorized));

	const getInfoDomain = (
		url: string
	): {
		startValue: string | null;
		domain: string;
		pathname: string;
		domainAll: string;
	} | null => {
		try {
			if (!url) return null;
			const urlObj = new URL(url);
			const startValue = urlObj.searchParams.get("start");
			const pathname = urlObj.pathname;
			const pathnameWithoutSlash = pathname.replace(/\//g, "");
			const domain = urlObj.hostname + pathname + urlObj.search;
			const domainAll = urlObj.origin + pathname;
			return { startValue, domain, pathname: pathnameWithoutSlash, domainAll };
		} catch (error: any) {
			console.error(error);
			return null;
		}
	};

	const goToTelegram = (link: string) => {
		window.open(link, "_blank");
	};

	const connectTelegram = async () => {
		try {
			if (ownerData.value?.telegram) return;
			isLoading.value = true;
			const data = await postApiUserTgLink();
			if (data) infoTg.value = data;
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	watch(
		() => ownerData.value?.telegram,
		async (newValue) => {
			if (newValue) {
				await router.push({ name: "profile-personal-data" });
			}
		}
	);

	watch(
		() => ownerData.value?.is_authorized,
		async () => {
			if (!infoTg.value && ownerData.value?.is_authorized) await connectTelegram();
		},
		{ immediate: true }
	);
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Profile')" back-name-route="profile" />

		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("Connecting a Telegram Bot") }}</h1>

		<div v-if="isAuthorizedLc" class="flex flex-column gap-96">
			<div class="flex flex-column gap-32">
				<h2 class="fz-40 fw-700">{{ $t("3 ways to connect to a Telegram bot") }}</h2>
				<div v-show="isLoading" class="page__rows">
					<ui-skeleton :rows="3" :rowHeight="100" :rows-gap="32" :item-border-radius="24" first-color="#fff" />
				</div>
				<div v-if="!isLoading && infoTg" class="page__rows">
					<row-connect-telegram :item="itemsTelegram[0]">
						<div class="link">
							<ui-link :href="infoTg.link" target="_blank" class="flex-grow-1">
								{{ getInfoDomain(infoTg.link)?.domain }}
							</ui-link>
							<ui-copy-text :copied-text="infoTg.link" size-icon="sm" color-icon="#A4A5B1" />
							<ui-icon
								name="new-windows"
								class="pointer"
								type="400"
								color="#A4A5B1"
								size="sm"
								@click="goToTelegram(infoTg.link)"
							/>
						</div>
					</row-connect-telegram>
					<row-connect-telegram :item="itemsTelegram[1]">
						<div class="qr-code">
							<qrcode-vue :value="infoTg.link" :size="85" render-as="svg" level="Q" />
						</div>
					</row-connect-telegram>
					<row-connect-telegram :item="itemsTelegram[2]" :code="getInfoDomain(infoTg.link)?.startValue">
						<div class="id">
							<ui-link :href="getInfoDomain(infoTg.link)?.domainAll" target="_blank">
								@{{ getInfoDomain(infoTg.link)?.pathname }}
							</ui-link>
						</div>
					</row-connect-telegram>
				</div>
			</div>
		</div>

		<block-section v-else class="info__container">
			<div class="info__text">
				{{ $t("Merchant is not registered in my.DV") }}
			</div>

			<ui-button class="button" type="outline" size="md" :loading="isLoading" @click="getMyDvAuthLink" mode="neutral">
				{{ $t("Sing up") }}
			</ui-button>
		</block-section>

		<div class="advantages mt-32">
			<h2 class="global-title-h1">
				{{ $t("What is our Telegram bot for") }}
			</h2>
			<div class="advantages__cards">
				<div class="card" v-for="item in advantagesCardsTelegram" :key="item.id">
					<ui-icon type="filled" :name="item.iconName" color="#187B9A" size="xxl" />
					<h3 class="card__title">{{ $t(item.title) }}</h3>
					<p class="card__text">{{ $t(item.text) }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;

		&__rows {
			display: flex;
			flex-direction: column;
			gap: 32px;
			padding: 32px 24px;
			border-radius: 24px;
			background-color: $blue-light;

			.link {
				display: flex;
				align-items: center;
				gap: 12px;
				justify-content: space-between;
				border-radius: 8px;
				border: 1px solid $grey;
				background-color: $white;
				padding: 12px;
				min-width: 282px;
			}

			.qr-code {
				@extend .center;
				padding: 15px;
				border-radius: 12px;
				border: 2px solid $grey;
				background-color: $white;
			}

			.id {
				min-width: 282px;
				padding: 12px;
				@extend .center;
				border-radius: 8px;
				border: 1px solid $grey-light;
				background-color: $white;
				color: $black;
				font-size: 16px;
				font-weight: 600;
				line-height: 16px;
			}
		}

		.info {
			&__container {
				display: flex;
				width: fit-content;
				gap: 16px;
			}

			&__text {
				height: fit-content;
				align-self: center;
				max-width: 720px;
			}
		}

		.advantages {
			display: flex;
			flex-direction: column;
			gap: 32px;

			&__cards {
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				gap: 16px;

				.card {
					display: flex;
					flex-direction: column;
					border-radius: 16px;
					border: 1px solid $grey;
					background-color: $blue-opacity;
					padding: 20px;

					&__title {
						color: #000;
						font-size: 20px;
						font-weight: 600;
						line-height: 24px;
						margin: 8px 0 4px;
					}

					&__text {
						color: $secondary;
						font-size: 14px;
						font-weight: 400;
						line-height: 20px;
					}
				}
			}
		}
	}
</style>
