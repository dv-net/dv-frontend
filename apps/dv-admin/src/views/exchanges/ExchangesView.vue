<script setup lang="ts">
	import { computed, markRaw, onMounted, onUnmounted, ref, watch } from "vue";
	import IconAdd from "@dv-admin/components/icons/exchanges/IconAdd.vue";
	import IconConvert from "@dv-admin/components/icons/exchanges/IconConvert.vue";
	import IconWithdrawal from "@dv-admin/components/icons/exchanges/IconWithdrawal.vue";
	import { UiSkeleton, UiSwitch } from "@dv.net/ui-kit";
	import { useI18n } from "vue-i18n";
	import type { ISettingsItem } from "@dv-admin/utils/types/general";
	import ListInfoItem from "@dv-admin/components/common/listInfoItem/ListInfoItem.vue";
	import { useWithdrawalStore } from "@dv-admin/stores/withdrawal";
	import { storeToRefs } from "pinia";
	import { useExchangeSettingsStore } from "@dv-admin/stores/exchangeSettings";
	import BlockConnectedExchanges from "@dv-admin/views/exchanges/components/blockConnectedExchanges/BlockConnectedExchanges.vue";
	import BannerInfo from "@dv-admin/components/ui/bannerInfo/BannerInfo.vue";

	const { t } = useI18n();
	const { connectedExchanges, isLoadingConnectedExchanges, isShowBannerSuccessToggleExchange } =
		storeToRefs(useWithdrawalStore());
	const { getWithdrawalRules, getExchangeDepositAddresses, getConnectedExchanges } = useWithdrawalStore();
	const { exchangeList } = storeToRefs(useExchangeSettingsStore());
	const { postExchangeToggle } = useExchangeSettingsStore();

	const swapStateToggle = ref<boolean>(false);
	const withdrawalStateToggle = ref<boolean>(false);

	const exchanges = computed<ISettingsItem[]>(() => [
		{
			id: 1,
			isShow: true,
			icon: markRaw(IconAdd),
			title: t("Connecting the crypto exchange"),
			text: t(
				"By connecting the crypto exchange, you will be able to accept payments and store funds directly on your account. Automatic conversion to USDT and the ability to send funds from the crypto exchange to cold wallets will also be available"
			),
			textBtn: t("Connect"),
			path: "/exchanges/connect"
		},
		{
			id: 2,
			isShow: true,
			icon: markRaw(IconConvert),
			title: t("Auto exchanges on the crypto exchange"),
			textBtn: t("Configure auto-exchange"),
			text: t(
				"This is an asset exchange mechanism: you select the desired pair, and we place an order for such an exchange on the crypto exchange on your behalf"
			),
			path: `/exchanges/convert/${exchangeList.value?.current_exchange}`,
			isDisabled: !exchangeList.value?.current_exchange
		},
		{
			id: 3,
			isShow: true,
			icon: markRaw(IconWithdrawal),
			title: t("Auto-withdrawal on the crypto exchange"),
			textBtn: t("Configure withdrawals"),
			text: t(
				"You start the process of adding a wallet to the whitelist on the crypto exchange, after which we send a request to conduct transactions with this wallet"
			),
			path: `/exchanges/withdrawal/${exchangeList.value?.current_exchange}`,
			isDisabled: !exchangeList.value?.current_exchange
		}
	]);

	watch(exchangeList, (newValue) => {
		swapStateToggle.value = newValue?.swap_state === "enabled";
		withdrawalStateToggle.value = newValue?.withdrawal_state === "enabled";
	});

	onMounted(async () => {
		await Promise.all([getConnectedExchanges(), getWithdrawalRules(), getExchangeDepositAddresses()]);
	});
	onUnmounted(() => {
		isShowBannerSuccessToggleExchange.value = false;
	});
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("Crypto exchanges") }}</h1>

		<ui-skeleton v-if="isLoadingConnectedExchanges" :rows="3" :rowHeight="142" :rowsGap="24" :item-border-radius="16" />

		<div v-else class="flex flex-column gap-24">
			<list-info-item :key="exchanges[0].id" :setting="exchanges[0]" :is-show-content="!!connectedExchanges.length">
				<block-connected-exchanges />
			</list-info-item>
			<banner-info
				:is-show="isShowBannerSuccessToggleExchange"
				:text="$t('exchange-toggle', { exchange: exchangeList?.current_exchange })"
			/>
			<list-info-item :setting="exchanges[1]">
				<template #text>
					<div class="flex flex-column gap-16">
						<p class="description">
							{{
								$t(
									"This is an asset exchange mechanism: you select the desired pair, and we place an order for such an exchange on the crypto exchange on your behalf"
								)
							}}
						</p>

						<ui-switch
							@click.stop
							:disabled="!exchangeList?.current_exchange"
							v-model="swapStateToggle"
							:label="$t(exchangeList?.swap_state === 'disabled' ? 'Exchanges are disabled' : 'Exchanges are enabled')"
							@change="postExchangeToggle('swap_state', exchangeList?.swap_state)"
						/>
					</div>
				</template>
			</list-info-item>
			<list-info-item :setting="exchanges[2]">
				<template #text>
					<div class="flex flex-column gap-16">
						<p class="description">
							{{
								$t(
									"You start the process of adding a wallet to the whitelist on the crypto exchange, after which we send a request to conduct transactions with this wallet"
								)
							}}
						</p>
						<ui-switch
							@click.stop
							:disabled="!exchangeList?.current_exchange"
							v-model="withdrawalStateToggle"
							:label="
								$t(
									exchangeList?.withdrawal_state === 'disabled' ? 'Withdrawals are disabled' : 'Withdrawals are enabled'
								)
							"
							@change="postExchangeToggle('withdrawal_state', exchangeList?.withdrawal_state)"
						/>
					</div>
				</template>
			</list-info-item>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;
		.description {
			color: $secondary;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
		}
	}
</style>
