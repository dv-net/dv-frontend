<script setup lang="ts">
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { storeToRefs } from "pinia";
	import {
		UiInput,
		UiTabs,
		UiTabsItem,
		UiSelect,
		UiButton,
		UiTable,
		UiSkeleton,
		UiForm,
		UiFormItem,
		UiCopyText
	} from "@dv.net/ui-kit";
	import { computed, ref, watch } from "vue";
	import { useTransferCheckStore } from "@dv-admin/stores/transferCheck";
	import { postApiAmlScoreTransaction } from "@dv-admin/services/api/transferCheck.ts";
	import type { UiPaginationMeta } from "@dv.net/ui-kit/dist/components/UiPagination/types";
	import type { UiTableHeader } from "@dv.net/ui-kit/dist/components/UiTable/types";
	import { useI18n } from "vue-i18n";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import { AML_PROVIDERS, RISK_LEVEL_ENUM } from "@dv-admin/utils/constants/transferCheck";
	import NotFoundMessage from "@dv-admin/components/ui/notFoundMessage/NotFoundMessage.vue";
	import { useRouter } from "vue-router";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general.ts";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse.ts";
	import ShowStatusGeneral from "@dv-admin/components/ui/showStatusGeneral/ShowStatusGeneral.vue";
	import type { IAmlHistoryItemResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import IconUpdateData from "@dv-admin/components/ui/iconUpdateData/IconUpdateData.vue";

	const { t } = useI18n();
	const { notify } = useNotifications();
	const router = useRouter();

	const {
		amlCurrencies,
		isLoadingAmlKeys,
		isHaveKeysCurrentAml,
		formAmlScoreTransaction,
		isLoadingAmlHistory,
		amlHistoryPagination,
		amlHistory,
		amlHistoryFilter
	} = storeToRefs(useTransferCheckStore());
	const { getAmlKeys, getAmlCurrencies, getAmlHistory } = useTransferCheckStore();
	const { dictionary, isLoadingDictionary } = storeToRefs(useGeneralStore());

	const formRef = ref<HTMLFormElement | null>(null);
	const isLoadingAmlScoreTransaction = ref<boolean>(false);
	const formError = ref<string>("");
	const expandListUuid = ref<string[]>([]);

	const headers = computed<UiTableHeader[]>(() => [
		{ name: "created_at", label: t("Date") },
		{ name: "status", label: t("Status") },
		{ name: "score", label: t("Score") },
		{ name: "risk_level", label: t("Risk level") },
		{ name: "service_slug", label: t("Provider") },
		{ name: "actions" }
	]);

	const optionsDirection = computed<IUiSelectOptions[]>(() => {
		return [
			{ label: t("Receipt.two"), value: "in" },
			{ label: t("Withdrawal"), value: "out" }
		];
	});

	const rulesForm = computed<UiFormRules>(() => {
		return {
			tx_id: [{ required: true, message: t("Enter transaction hash") }],
			currency_id: [{ required: true, message: t("Select currency") }],
			output_address: [{ required: true, message: t("Enter address") }],
			direction: [{ required: true, message: t("Select direction") }]
		};
	});

	const currentNameAmlProvider = (aml: string): string => {
		return aml in AML_PROVIDERS ? AML_PROVIDERS[aml] : aml;
	};

	const changeAmlProvider = async (provider: string) => {
		await Promise.all([getAmlKeys(provider), getAmlCurrencies(provider)]);
	};

	const handleOpenRow = (row: IAmlHistoryItemResponse) => {
		if (expandListUuid.value.includes(row.id)) {
			expandListUuid.value = expandListUuid.value.filter((item) => item !== row.id);
		} else {
			expandListUuid.value.push(row.id);
		}
	};

	const handleRowClick = async (row: IAmlHistoryItemResponse) => {
		handleOpenRow(row);
	};

	const changePageHandler = async (pagination: UiPaginationMeta) => {
		amlHistoryFilter.value.page = pagination.page;
		await getAmlHistory();
	};

	const postAmlScoreTransaction = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			isLoadingAmlScoreTransaction.value = true;
			await postApiAmlScoreTransaction(formAmlScoreTransaction.value);
			await getAmlHistory();
			formAmlScoreTransaction.value.tx_id = null;
			formAmlScoreTransaction.value.output_address = null;
			formAmlScoreTransaction.value.direction = null;
			formAmlScoreTransaction.value.currency_id = null;
			notify(t("We have started checking your transaction"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingAmlScoreTransaction.value = false;
		}
	};

	watch(
		dictionary,
		async (newValue) => {
			if (newValue) {
				const currentAmlProviders = newValue.available_aml_providers[0];
				await Promise.all([getAmlHistory(), getAmlKeys(currentAmlProviders), getAmlCurrencies(currentAmlProviders)]);
				formAmlScoreTransaction.value.provider_slug = currentAmlProviders;
			}
		},
		{ immediate: true }
	);
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("AML check of transfer") }}</h1>
		<div class="page__inner">
			<div class="flex flex-y-center flex-x-between">
				<ui-skeleton v-if="isLoadingDictionary" :rowHeight="40" :rows="1" :item-border-radius="8" />
				<ui-tabs
					v-if="!isLoadingDictionary && dictionary"
					v-model="formAmlScoreTransaction.provider_slug"
					mode="light"
					@change="changeAmlProvider"
				>
					<ui-tabs-item v-for="item in dictionary.available_aml_providers" :key="item" :value="item">
						{{ currentNameAmlProvider(item) }}
					</ui-tabs-item>
				</ui-tabs>
				<ui-button
					mode="neutral"
					size="lg"
					@click="
						router.push({ name: 'transfer-check-connect-aml', params: { aml: formAmlScoreTransaction.provider_slug } })
					"
				>
					{{ $t(isHaveKeysCurrentAml ? "Change" : "Connect") }}
					{{ currentNameAmlProvider(formAmlScoreTransaction.provider_slug) }}
				</ui-button>
			</div>
			<div>
				<block-section v-if="isLoadingDictionary || isLoadingAmlKeys">
					<ui-skeleton :rowHeight="66" :rows="3" :rows-gap="23" :item-border-radius="16" />
				</block-section>
				<div v-else>
					<not-found-message
						v-if="!isHaveKeysCurrentAml"
						:text="$t('aml is not connected', { aml: currentNameAmlProvider(formAmlScoreTransaction.provider_slug) })"
					/>
					<block-section v-else>
						<ui-form
							class="form"
							ref="formRef"
							:rules="rulesForm"
							:model="formAmlScoreTransaction"
							@submit.prevent="postAmlScoreTransaction"
						>
							<ui-form-item :error="formError" :label="$t('Transaction hash')" name="tx_id">
								<ui-input
									size="md"
									v-model="formAmlScoreTransaction.tx_id"
									is-empty-value-null
									:placeholder="$t('Enter transaction hash')"
								/>
							</ui-form-item>
							<ui-form-item :error="formError" :label="$t('Currency')" name="currency_id">
								<ui-select
									v-model="formAmlScoreTransaction.currency_id"
									type="default"
									:options="amlCurrencies"
									:placeholder="$t('Select currency')"
								>
									<template #selected>
										<blockchain-card
											v-if="formAmlScoreTransaction.currency_id"
											:type="formAmlScoreTransaction.currency_id as BlockchainType"
										/>
									</template>
									<template #default="{ option }">
										<blockchain-card :type="option.value as BlockchainType" />
									</template>
								</ui-select>
							</ui-form-item>
							<ui-form-item :error="formError" :label="$t('Wallet Address')" name="output_address">
								<ui-input
									size="md"
									v-model="formAmlScoreTransaction.output_address"
									is-empty-value-null
									:placeholder="$t('Enter address')"
								/>
							</ui-form-item>
							<ui-form-item :error="formError" :label="$t('Direction')" name="direction">
								<ui-select
									v-model="formAmlScoreTransaction.direction"
									type="default"
									:options="optionsDirection"
									:placeholder="$t('Select direction')"
								/>
							</ui-form-item>
							<ui-button class="mt-8" mode="neutral" size="xl" native-type="submit">
								{{ $t("Check transaction") }}
							</ui-button>
						</ui-form>
					</block-section>
				</div>
			</div>
		</div>
		<div class="flex flex-column gap-24">
			<div class="flex flex-y-center gap-8">
				<h2 class="global-title-h2">{{ $t("History of checks") }}</h2>
				<icon-update-data :callback="getAmlHistory" />
			</div>
			<ui-table
				:loading="isLoadingAmlHistory"
				:headers="headers"
				:data="amlHistory"
				:meta="amlHistoryPagination"
				v-model:expanded="expandListUuid"
				:isShowPerPageSelect="false"
				table-layout="fixed"
				expande-key="id"
				@change-pagination="changePageHandler"
				@row-click="handleRowClick"
				:row-class="() => 'pointer'"
			>
				<template #body-cell-created_at="{ row }">
					{{ formatDate(row.created_at) }}
				</template>
				<template #body-cell-status="{ row }">
					<show-status-general :status="row.status" :w-full="false" />
				</template>
				<template #body-cell-risk_level="{ row }">
					{{ row.risk_level in RISK_LEVEL_ENUM ? $t(RISK_LEVEL_ENUM[row.risk_level]) : row.risk_level }}
				</template>
				<template #body-cell-actions="{ row }">
					<ui-button type="secondary" size="sm" @click.stop="handleOpenRow(row)">
						{{ $t(expandListUuid.includes(row.id) ? "Hide details" : "Show details") }}
					</ui-button>
				</template>
				<template #body-cell-service_slug="{ row }">
					{{ currentNameAmlProvider(row.service_slug) }}
				</template>
				<template #expande="{ row }">
					<div class="json">
						<block-section class="relative" mode="grey-border">
							<ui-copy-text
								:copied-text="JSON.stringify(row.request_history)"
								class="json__copy"
								color-icon="rgb(164, 165, 177)"
							/>
							<pre class="json__pre">{{ row.request_history }}</pre>
						</block-section>
					</div>
				</template>
			</ui-table>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;
		&__inner {
			display: flex;
			flex-direction: column;
			gap: 24px;
			.form {
				display: grid;
				grid-template-columns: 1fr 300px;
				column-gap: 24px;
			}
		}
		.json {
			padding: 24px;
			&__copy {
				position: absolute;
				top: 5px;
				right: 5px;
			}
			&__pre {
				max-height: 300px;
				overflow: auto;
			}
		}
	}
</style>
