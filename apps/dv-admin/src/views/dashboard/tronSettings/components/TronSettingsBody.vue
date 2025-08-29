<script setup lang="ts">
	import { computed, ref } from "vue";
	import { storeToRefs } from "pinia";
	import { UiSkeleton, UiTabs, UiTabsItem } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import IconCurrentPayments from "@dv-admin/components/icons/dashboard/tronSettings/IconCurrentPayments.vue";
	import TronTransferType from "@dv-admin/views/dashboard/tronSettings/components/TronTransferType.vue";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { formatAmountBlockchain } from "@shared/utils/helpers/general";
	import { tronTransferTypeList } from "@dv-admin/utils/constants/dashboard";
	import { useI18n } from "vue-i18n";
	import ChartTronInfo from "@dv-admin/views/dashboard/tronSettings/components/chartTronInfo/ChartTronInfo.vue";

	const { t } = useI18n();
	const { isLoading, userSettings } = storeToRefs(useUserSettingsStore());
	const { postUserSettings } = useUserSettingsStore();

	const activeTab = ref("1");
	const tabs = [
		{ id: "1", label: "Operating mode – Default" },
		{ id: "2", label: "Expense statistics" }
		// { id: "2", label: "Current state of affairs" },
	];

	const selectedType = computed<string | null>(() => {
		return userSettings.value.find((el) => el.name === "transfer_type")?.value || null;
	});

	const updateTransferType = async (type: string) => {
		const findIndex: number = userSettings.value.findIndex((el) => el.name === "transfer_type");
		if (findIndex === -1) return;
		userSettings.value[findIndex].value = type;
		await postUserSettings(userSettings.value[findIndex], t("Processing type changed"));
	};
</script>

<template>
	<block-section class="tron-settings-body">
		<ui-skeleton v-if="isLoading" :rows="1" :row-height="149" :item-border-radius="16" />
		<block-section v-else class="tron-settings-body__current-payments opacity">
			<div class="tron-settings-body__current-payments__header">
				<span class="flex"><icon-current-payments /></span>
				<span>{{ $t("Current expenses") }}</span>
			</div>

			<div class="flex gap-23">
				<block-section mode="grey-border" class="tron-settings-body__current-payments__item" padding="md">
					<div class="tron-settings-body__current-payments__item-title">
						{{ $t("TRON network fee for sending funds") }}
					</div>
					<div class="tron-settings-body__current-payments__item-text">
						{{ $t("Each $ for processing", { amount: "0" }) }}
					</div>
				</block-section>

				<block-section mode="grey-border" class="tron-settings-body__current-payments__item" padding="md">
					<div class="tron-settings-body__current-payments__item-title">{{ $t("Burn daily") }}</div>
					<div class="tron-settings-body__current-payments__item-text">—</div>
				</block-section>

				<block-section mode="grey-border" class="tron-settings-body__current-payments__item" padding="md">
					<div class="tron-settings-body__current-payments__item-title">{{ $t("TRON per day") }}</div>
					<div class="tron-settings-body__current-payments__item-text">
						{{ $t("payment by", { count: "0", amount: formatAmountBlockchain(0) }) }} TRX
					</div>
				</block-section>
			</div>
		</block-section>

		<ui-skeleton v-if="isLoading" :rows="1" :row-height="40" :item-border-radius="12" />
		<ui-tabs v-else mode="light" v-model="activeTab" class="w-full">
			<ui-tabs-item v-for="tab in tabs" :key="tab.id" :value="tab.id">{{ $t(tab.label) }}</ui-tabs-item>
		</ui-tabs>
		<div v-if="activeTab === '1'">
			<ui-skeleton v-if="isLoading" :rows="3" :row-height="172" :rows-gap="24" :item-border-radius="16" />
			<div v-else class="flex flex-column gap-24">
				<tron-transfer-type
					v-for="item in tronTransferTypeList"
					:key="item.id"
					:data="item"
					:selected-type="selectedType === item.id"
					@update:type="updateTransferType"
				/>
			</div>
		</div>
		<chart-tron-info v-else-if="activeTab === '2'" />
	</block-section>
</template>

<style scoped lang="scss">
	.tron-settings-body {
		display: flex;
		flex-direction: column;
		gap: 24px;
		&__current-payments {
			&__header {
				display: flex;
				align-items: center;
				gap: 8px;
				padding-bottom: 13px;
				color: #6b6d80;
			}

			&__item {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4px;
				width: 100%;
			}

			&__item-title {
				color: #a4a5b1;
				font-size: 12px;
				font-weight: 500;
				line-height: 12px;
			}

			&__item-text {
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}
		}
		&.block-section {
			border-radius: 0 0 16px 16px;
			padding: 20px 24px 24px;
			border-top: 0;
		}
	}
</style>
