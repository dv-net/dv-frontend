<script setup lang="ts">
	import { useRoute } from "vue-router";
	import { UiIcon, UiSwitch, UiTable, UiButton } from "@dv.net/ui-kit";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import Rules from "@dv-admin/views/exchanges/withdrawal/components/rules/Rules.vue";
	import { computed, onMounted } from "vue";
	import { useWithdrawalExchangeStore } from "@dv-admin/stores/withdrawal/withdrawalExchange";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import { storeToRefs } from "pinia";
	import { formatAmountBlockchain, getCurrentCoin } from "@shared/utils/helpers/general";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import type { BlockchainType } from "@shared/utils/types/blockchain";

	const {
		getExchangeWithdrawalSetting,
		deleteExchangeWithdrawalSetting,
		getExchangeChains,
		getExchangeWithdrawalRules,
		patchExchangeWithdrawalSetting
	} = useWithdrawalExchangeStore();
	const { exchangeWithdrawalSettingList, isLoadingExchangeWithdrawalSettingList, isLoadingPatchWithdrawalSetting } =
		storeToRefs(useWithdrawalExchangeStore());

	const { t, locale } = useI18n();
	const route = useRoute();
	const slug = route.params.slug as string;

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "switch", width: "100" },
		{ name: "currency_id", label: t("Cryptocurrency"), width: "200" },
		{ name: "address", label: t("Wallet Address"), width: "300" },
		{ name: "min_amount", label: t("Minimum amount") },
		{ name: "chain", label: t("Chain") },
		{ name: "trash", label: t("Actions"), width: "110" }
	]);

	const handleGoDocs = () => {
		window.open(`https://docs.dv.net/${locale.value}/exchanges/${slug}.html`, "_blank");
	};

	onMounted(async () => {
		await Promise.all([getExchangeWithdrawalRules(slug), getExchangeChains(slug), getExchangeWithdrawalSetting(slug)]);
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Crypto exchanges')" back-name-route="exchanges" />

		<h1 class="global-title-h2">
			{{ $t("Withdrawal from the crypto exchange") }}
		</h1>

		<ui-button mode="neutral" @click="handleGoDocs" class="mb-16">
			{{ t("Complete instructions for setting up the crypto exchange", { exchange: slug.toUpperCase() }) }}
		</ui-button>

		<block-section
			class="withdrawal"
			:title="$t('Withdrawal from the crypto exchange')"
			:info-title="$t('Rules for withdrawal from the crypto exchange')"
			:info-text="
				$t(
					'To withdraw funds from the crypto exchange, you need to create a rule in which you specify the wallet and coin for withdrawal'
				)
			"
		>
			<rules :slug="slug" />
		</block-section>

		<block-section class="flex flex-column gap-16" :title="$t('Created rules')">
			<ui-table
				:headers="headers"
				:data="exchangeWithdrawalSettingList"
				table-layout="fixed"
				class="global-table-transparent"
				:loading="isLoadingExchangeWithdrawalSettingList"
			>
				<template #body-cell-switch="{ row }">
					<div class="withdrawal__switcher-container">
						<ui-switch
							:model-value="row.enabled"
							:disabled="isLoadingPatchWithdrawalSetting"
							@change="() => patchExchangeWithdrawalSetting(slug, row.id, !row.enabled)"
						/>
					</div>
				</template>

				<template #body-cell-currency_id="{ row }">
					<blockchain-card :type="row.currency_id as BlockchainType" />
				</template>

				<template #body-cell-address="{ row }">
					<display-hash type="address" :hash="row.address" size-icon="sm" :currency-id="row.currency_id" />
				</template>

				<template #body-cell-min_amount="{ row }">
					{{ formatAmountBlockchain(row.min_amount, row.currency_id) }} {{ getCurrentCoin(row.currency_id) }}
				</template>

				<template #body-cell-trash="{ row }">
					<div class="w-full center">
						<ui-icon
							class="pointer"
							name="delete"
							color="#6B6D80"
							type="400"
							size="md"
							@click="deleteExchangeWithdrawalSetting(slug, row.id)"
						/>
					</div>
				</template>
			</ui-table>
		</block-section>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;

		.withdrawal {
			display: flex;
			flex-direction: column;
			gap: 24px;

			&__switcher-container {
				min-width: 100%;
				border-right: 1px solid $grey-light;
			}
		}
	}
</style>
