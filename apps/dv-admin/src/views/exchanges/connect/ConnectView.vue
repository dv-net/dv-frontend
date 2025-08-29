<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import DeleteExchangeModal from "@dv-admin/views/exchanges/components/DeleteExchangeModal.vue";
	import ActivateExchangeModal from "@dv-admin/views/exchanges/components/ActivateExchangeModal.vue";
	import { UiButton, UiIcon, UiSkeleton } from "@dv.net/ui-kit/dist";
	import { onMounted, ref } from "vue";
	import { storeToRefs } from "pinia";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import { useRouter } from "vue-router";
	import { exchangeLogo } from "@dv-admin/utils/constants/exchange";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";
	import type { ExchangeSlugType } from "@dv-admin/utils/types/api/apiGo";

	const { exchangeList } = storeToRefs(useExchangeSettingsStore());
	const { connectedExchanges, isLoadingConnectedExchanges } = storeToRefs(useWithdrawalStore());
	const { deleteExchangeKeys } = useExchangeSettingsStore();
	const { getConnectedExchanges } = useWithdrawalStore();
	const router = useRouter();
	const { notify } = useNotifications();
	const { t } = useI18n();

	const isLoadingDeleteKeys = ref<Record<string, boolean>>({});
	const isShowDeleteModal = ref(false);
	const isShowActivateModal = ref(false);
	const deletingExchange = ref<ExchangeSlugType | null>(null);
	const activatingExchange = ref<ExchangeSlugType | null>(null);

	const goToShowConnectExchange = async (slug: string) => {
		await router.push({ name: "exchanges-connect-one", params: { slug } });
	};

	const handleDeleteKeys = async () => {
		if (!deletingExchange.value) return;
		try {
			isShowDeleteModal.value = false;
			isLoadingDeleteKeys.value[deletingExchange.value] = true;
			await deleteExchangeKeys(deletingExchange.value);
			await getConnectedExchanges();
			notify(t("Crypto exchange deleted"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingDeleteKeys.value[deletingExchange.value] = false;
			deletingExchange.value = null;
		}
	};

	const handleShowDeleteModal = (exchange: ExchangeSlugType) => {
		deletingExchange.value = exchange;
		isShowDeleteModal.value = true;
	};

	const handleShowActivateModal = (exchange: ExchangeSlugType) => {
		activatingExchange.value = exchange;
		isShowActivateModal.value = true;
	};

	onMounted(async () => {
		if (!connectedExchanges.value || !connectedExchanges.value.length) {
			await getConnectedExchanges();
		}
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Crypto exchanges')" back-name-route="exchanges" />
		<h1 class="global-title-h2 mt-24 mb-32">
			{{ $t("Select crypto exchange to connect") }}
		</h1>
		<div v-if="isLoadingConnectedExchanges" class="page__cards">
			<ui-skeleton v-for="(item, i) in new Array(6)" :rows="1" :row-height="150" :item-border-radius="12" :key="i" />
		</div>
		<div v-else-if="exchangeList?.exchanges?.length" class="page__cards">
			<block-section
				v-for="item in exchangeList.exchanges"
				:key="item.slug"
				class="card"
				:mode="
					!connectedExchanges.some((el) => el.slug === item.slug) && exchangeList.current_exchange === item.slug
						? 'white-border-red'
						: connectedExchanges.some((el) => el.slug === item.slug)
							? 'white-border-green'
							: 'grey-border'
				"
				padding="l"
				radius="md"
			>
				<template #title>
					<div
						v-show="
							exchangeList.current_exchange === item.slug && connectedExchanges.some((el) => el.slug === item.slug)
						"
						class="card__active-exchange-title"
					>
						<ui-icon name="check-circle" type="filled" size="md" />
						{{ $t("The crypto exchange is active") }}
					</div>
				</template>

				<div class="card__logo">
					<component :is="exchangeLogo[item.slug]" />
				</div>
				<div class="card__actions">
					<ui-button
						v-if="
							connectedExchanges.some((el) => el.slug === item.slug) && exchangeList!.current_exchange !== item.slug
						"
						class="card__btn"
						type="secondary"
						@click="handleShowActivateModal(item.slug)"
					>
						{{ $t("Activate") }}
					</ui-button>
					<ui-button
						:class="
							!(connectedExchanges.some((el) => el.slug === item.slug) && exchangeList!.current_exchange !== item.slug)
								? 'card__btn'
								: 'card__btn-with-icon'
						"
						:type="
							connectedExchanges.some((el) => el.slug === item.slug) || exchangeList!.current_exchange === item.slug
								? 'secondary'
								: 'outline'
						"
						@click="goToShowConnectExchange(item.slug)"
					>
						<template v-if="connectedExchanges.some((el) => el.slug === item.slug)">
							<ui-icon size="md" name="edit" type="400" />
							<template v-if="exchangeList!.current_exchange === item.slug">{{ $t("Change") }}</template>
						</template>
						<template v-else>{{ $t("Connect the crypto exchange") }}</template>
					</ui-button>
					<ui-button
						v-if="connectedExchanges.some((el) => el.slug === item.slug)"
						class="card__btn-with-icon"
						type="secondary"
						:loading="isLoadingDeleteKeys[item.slug]"
						@click="handleShowDeleteModal(item.slug)"
					>
						<ui-icon size="md" name="delete" type="400" />
					</ui-button>
				</div>
			</block-section>
		</div>

		<delete-exchange-modal
			v-model:isShowModal="isShowDeleteModal"
			:handleDeleteKeys="handleDeleteKeys"
			:deletingExchange="deletingExchange"
		/>

		<activate-exchange-modal v-model:isShowModal="isShowActivateModal" :activatingExchange="activatingExchange" />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;

		&__cards {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 12px;

			.card {
				display: flex;
				flex-direction: column;
				gap: 16px;

				&__logo {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 56px;
				}

				&__btn {
					width: 100%;
				}

				&__btn-with-icon {
					padding: 8px;
				}

				&__actions {
					display: flex;
					align-items: center;
					gap: 8px;
					position: relative;
					z-index: 1;
				}

				&__active-exchange-title {
					display: flex;
					align-items: center;
					position: absolute;
					background-color: #fff;
					color: #1f9649;
					right: 40px;
					top: -12px;
					gap: 4px;
					padding: 0 8px;
				}
			}
		}
	}
</style>
