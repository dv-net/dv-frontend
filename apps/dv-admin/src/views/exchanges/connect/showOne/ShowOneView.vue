<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { computed, onMounted, onUnmounted, ref } from "vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { useRoute } from "vue-router";
	import { storeToRefs } from "pinia";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import InfoOneExchangeConnect from "@dv-admin/views/exchanges/connect/showOne/components/infoOneExchangeConnect/InfoOneExchangeConnect.vue";
	import { EXCHANGE_SETTING_LABELS, EXCHANGE_HELP_TOOLTIPS } from "@dv-admin/utils/constants/exchange";
	import { UiButton, UiIcon, UiInput, UiTooltip, UiConfirm } from "@dv.net/ui-kit";
	import type { IExchangeListKeysResponse, ExchangeSlugType } from "@dv-admin/utils/types/api/apiGo";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import ConnectAddresses from "@dv-admin/views/exchanges/connect/showOne/components/connectAddresses/ConnectAddresses.vue";
	import BannerInfo from "@dv-admin/components/ui/bannerInfo/BannerInfo.vue";

	const { exchangeList, isLoadingUpdateKeys, isLoadingDeleteKeys, isShowBannerSuccess } =
		storeToRefs(useExchangeSettingsStore());
	const { getExchangeList, postExchangeKeyUpdates, deleteExchangeKeys, resetExchangeSettings } =
		useExchangeSettingsStore();
	const { isLoadingSetExchange } = storeToRefs(useWithdrawalStore());
	const { postSetExchange } = useWithdrawalStore();
	const { connectedExchanges } = storeToRefs(useWithdrawalStore());
	const { getConnectedExchanges } = useWithdrawalStore();

	const route = useRoute();
	const slug = route.params.slug as ExchangeSlugType;
	const isConnectCurrentExchange = ref<boolean>(false);

	const exchangeKeys = computed<IExchangeListKeysResponse[]>(() => {
		if (!exchangeList.value?.exchanges || !exchangeList.value?.exchanges?.length) return [];
		const findIndex: number = exchangeList.value.exchanges.findIndex((item) => item.slug === slug);
		return findIndex === -1 ? [] : exchangeList.value.exchanges[findIndex].keys;
	});

	onMounted(async () => {
		await Promise.all([
			!exchangeList.value ? getExchangeList() : Promise.resolve(),
			!connectedExchanges.value || !connectedExchanges.value.length ? getConnectedExchanges() : Promise.resolve()
		]);
		isConnectCurrentExchange.value = Boolean(connectedExchanges.value.find((item) => item.slug === slug));
	});

	onUnmounted(() => {
		resetExchangeSettings();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Crypto exchange connection selection')" />
		<h1 class="global-title-h2 mb-8">
			{{ $t("Connecting the crypto exchange") }}
		</h1>
		<block-section class="page__inner">
			<info-one-exchange-connect :slug="slug" />
			<form class="form">
				<div class="form__inputs">
					<div v-for="(item, index) in exchangeKeys" :key="index" class="form__input">
						<div class="form__input-label">
							<span>
								{{ $t(item.name in EXCHANGE_SETTING_LABELS ? EXCHANGE_SETTING_LABELS[item.name] : item.name) }}
							</span>
							<ui-tooltip
								class="flex flex-y-start"
								mode="dark"
								position="top-start"
								is-gold-title
								:title="$t(item.name in EXCHANGE_HELP_TOOLTIPS ? EXCHANGE_HELP_TOOLTIPS[item.name].title : item.name)"
								:text="$t(item.name in EXCHANGE_HELP_TOOLTIPS ? EXCHANGE_HELP_TOOLTIPS[item.name].text : item.name)"
							>
								<ui-icon type="400" name="help" />
							</ui-tooltip>
						</div>
						<ui-input size="lg" filled v-model="item.value" showPassword />
					</div>
				</div>
				<div class="form__actions">
					<ui-confirm :method="() => deleteExchangeKeys(slug)" @click.stop :title="`${$t('Delete crypto exchange')}?`">
						<ui-button
							type="secondary"
							size="xl"
							left-icon-name="delete"
							left-icon-size="lg"
							:loading="isLoadingDeleteKeys"
						>
							{{ $t("Delete keys") }}
						</ui-button>
					</ui-confirm>
					<ui-button
						type="secondary"
						size="xl"
						:left-icon-name="exchangeList?.current_exchange === slug ? 'block' : 'done'"
						left-icon-size="lg"
						:loading="isLoadingSetExchange"
						@click="postSetExchange(slug)"
						:disabled="connectedExchanges.every((item) => item.slug !== slug)"
					>
						{{ $t(exchangeList?.current_exchange === slug ? "Turn off" : "Turn on") }}
					</ui-button>
					<ui-button
						mode="neutral"
						size="xl"
						left-icon-name="add-circle"
						left-icon-size="lg"
						:loading="isLoadingUpdateKeys"
						@click="
							postExchangeKeyUpdates(
								slug,
								$t(isConnectCurrentExchange ? 'Crypto exchange edited' : 'Crypto exchange connected')
							)
						"
						:disabled="!exchangeKeys.every((item) => item.value)"
					>
						{{ $t(isConnectCurrentExchange ? "Edit crypto exchange" : "Connect the crypto exchange") }}
					</ui-button>
				</div>
			</form>
		</block-section>
		<banner-info :is-show="isShowBannerSuccess" :text="$t('exchange-connection', { exchange: slug })" />
		<connect-addresses />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;
		&__inner {
			display: flex;
			flex-direction: column;
			gap: 40px;
			.form {
				display: flex;
				flex-direction: column;
				gap: 20px;
				&__inputs {
					display: flex;
					flex-direction: column;
					gap: 24px;
				}
				&__input {
					display: grid;
					grid-template-columns: 200px 1fr;
					gap: 55px;
					&-label {
						display: flex;
						gap: 4px;
						color: $secondary;
						font-size: 14px;
						font-weight: 500;
						line-height: 20px;
					}
				}
				&__actions {
					display: flex;
					align-items: center;
					justify-content: flex-end;
					gap: 12px;
				}
			}
		}
	}
</style>
