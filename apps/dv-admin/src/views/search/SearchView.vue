<script setup lang="ts">
	import { computed, onMounted, onUnmounted, ref } from "vue";
	import { storeToRefs } from "pinia";
	import { UiButton, UiIcon, UiInput, UiSkeleton } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { useRoute } from "vue-router";
	import { truncateHash } from "@shared/utils/helpers/general";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { useI18n } from "vue-i18n";
	import { useSearchStore } from "@dv-admin/stores/search";
	import { SEARCH_TYPES } from "@dv-admin/utils/constants/search";
	import NotFound from "@dv-admin/views/search/components/notFound/NotFound.vue";

	const { t } = useI18n();
	const { searchValue, isLoading, isShowBlockNotFound, searchType } = storeToRefs(useSearchStore());
	const { getSearchData, resetSearchValues } = useSearchStore();
	const route = useRoute();

	const searchSelect = ref<HTMLSelectElement | null>(null);

	const isMainSearchPage = computed<boolean>(() => route.name === "search");
	const disabledBtn = computed<boolean>(() => !searchValue.value);
	const currentTitle = computed<string>(() => {
		switch (route.name) {
			case "search":
				return t("Search");
			case "search-address":
				return `${t("By the address")} ${truncateHash(route.params.hash as string, 3, 3).toUpperCase()}`;
			case "search-transaction":
				return `${t("By Hash transaction")} ${truncateHash(route.params.hash as string, 5, 3)}`;
			case "search-wallets":
				if (searchType.value === SEARCH_TYPES.EMAIL) {
					return `${t("By email")} ${route.params.searchParams}`;
				} else if (searchType.value === SEARCH_TYPES.IP) {
					return `${t("By IP")} ${route.params.searchParams}`;
				} else if (searchType.value === SEARCH_TYPES.STORE_EXTERNAL_ID) {
					return `${t("By store user ID")} ${route.params.searchParams}`;
				} else {
					return "";
				}
			default:
				return "";
		}
	});

	onMounted(() => {
		searchSelect.value?.focus();
	});

	onUnmounted(() => {
		resetSearchValues();
		searchValue.value = "";
	});
</script>

<template>
	<div class="page">
		<breadcrumbs v-if="!isMainSearchPage" class="mb-24" :back-route-title="$t('Search')" />
		<h1 v-if="currentTitle" class="global-title-h1">{{ currentTitle }}</h1>
		<ui-skeleton v-else :row-height="40" :rows="1" :item-border-radius="8" />
		<block-section class="search" mode="grey" padding="xxl">
			<form class="search__form" @submit.prevent="getSearchData()">
				<p v-if="isMainSearchPage" class="search__text">
					{{
						$t(
							"In the field below you can enter one of the following parameters: wallet issued to the client for top up, transaction hash, IP address or client Email - we will find all the information on the payment"
						)
					}}.
				</p>
				<div class="search__inner">
					<ui-input
						:placeholder="$t('Enter transaction hash or wallet address')"
						size="xl"
						v-model="searchValue"
						ref="searchSelect"
					>
						<template #prepend>
							<ui-icon name="search" type="400" color="#A4A5B1" />
						</template>
					</ui-input>
					<ui-button class="search__btn" mode="neutral" nativeType="submit" :disabled="disabledBtn" size="xl">
						{{ $t("Search") }}
					</ui-button>
				</div>
			</form>
		</block-section>
		<block-section v-show="isLoading || isShowBlockNotFound">
			<ui-skeleton v-if="isLoading" :rows="7" :row-height="40" :item-border-radius="4" :rows-gap="8" />
			<not-found v-if="!isLoading || isShowBlockNotFound" />
		</block-section>
		<RouterView v-show="!isLoading && !isShowBlockNotFound" />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		.search {
			margin: 32px 0 40px;
			&__form {
				display: flex;
				flex-direction: column;
				gap: 24px;
			}
			&__inner {
				display: flex;
				align-items: center;
				gap: 16px;
			}
			&__text {
				align-self: center;
				color: $black;
				font-size: 20px;
				font-weight: 500;
				line-height: 28px;
				max-width: 926px;
				width: 100%;
			}
			&__btn {
				min-width: 95px;
			}
		}
	}
</style>
