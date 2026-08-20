<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import NotFoundMessage from "@dv-admin/components/ui/notFoundMessage/NotFoundMessage.vue";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import { UiButton, UiForm, UiFormItem, UiInput, UiSelect, UiSkeleton } from "@dv.net/ui-kit";
	import { computed, onMounted, ref } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { storeToRefs } from "pinia";
	import { useI18n } from "vue-i18n";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general.ts";
	import type { IAmlScoreTransactionRequest } from "@dv-admin/utils/types/api/apiGo.ts";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { useAmlStore } from "@dv-admin/stores/aml";
	import { getApiAmlCurrencies, postApiAmlScoreTransaction } from "@dv-admin/utils/services/aml.ts";

	const route = useRoute();
	const router = useRouter();
	const { t } = useI18n();

	const amlStore = useAmlStore();
	const { isHaveKeysCurrentAml } = storeToRefs(amlStore);
	const { getAmlKeys } = amlStore;
	const { dictionary } = storeToRefs(useGeneralStore());

	const aml = route.params.aml as string;
	const formRef = ref<HTMLFormElement | null>(null);
	const isLoading = ref(true);
	const isLoadingAmlScoreTransaction = ref(false);
	const amlCurrencies = ref<IUiSelectOptions[]>([]);
	const form = ref<IAmlScoreTransactionRequest>({
		currency_id: null,
		direction: null,
		output_address: null,
		provider_slug: aml,
		tx_id: null
	});

	const currentNameAmlProvider = computed(
		() => dictionary.value?.available_aml_providers.find((provider) => provider.slug === aml)?.label ?? aml
	);

	const optionsDirection = computed<IUiSelectOptions[]>(() => [
		{ label: t("Receipt.two"), value: "in" },
		{ label: t("Withdrawal"), value: "out" }
	]);

	const rulesForm = computed<UiFormRules>(() => ({
		tx_id: [{ required: true, message: t("Enter transaction hash") }],
		currency_id: [{ required: true, message: t("Select currency") }],
		output_address: [{ required: true, message: t("Enter address") }],
		direction: [{ required: true, message: t("Select direction") }]
	}));

	const getAmlCurrencies = async (slug: string) => {
		const data = await getApiAmlCurrencies(slug);
		if (data) amlCurrencies.value = data.map((item) => ({ label: item.id, value: item.id }));
	};

	const getStartData = async () => {
		try {
			isLoading.value = true;
			await Promise.all([getAmlKeys(aml), getAmlCurrencies(aml)]);
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const postAmlScoreTransaction = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			isLoadingAmlScoreTransaction.value = true;
			await postApiAmlScoreTransaction(form.value);
			await router.push({ name: "aml" });
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingAmlScoreTransaction.value = false;
		}
	};

	onMounted(getStartData);
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('AML check of transfer')" back-name-route="aml" />
		<h1 class="global-title-h2 mb-32 mt-24">{{ $t("Check transaction") }}</h1>

		<div>
			<block-section v-if="isLoading">
				<ui-skeleton :rowHeight="66" :rows="3" :rows-gap="23" :item-border-radius="16" />
			</block-section>
			<div v-else>
				<not-found-message
					v-if="!isHaveKeysCurrentAml"
					:text="$t('aml is not connected', { aml: currentNameAmlProvider })"
				/>
				<template v-else>
					<block-section>
						<ui-form
							class="form"
							ref="formRef"
							:rules="rulesForm"
							:model="form"
							@submit.prevent="postAmlScoreTransaction"
						>
							<ui-form-item :label="$t('Transaction hash')" name="tx_id">
								<ui-input
									size="md"
									v-model="form.tx_id"
									is-empty-value-null
									:placeholder="$t('Enter transaction hash')"
								/>
							</ui-form-item>
							<ui-form-item :label="$t('Currency')" name="currency_id">
								<ui-select
									v-model="form.currency_id"
									type="default"
									:options="amlCurrencies"
									:placeholder="$t('Select currency')"
								>
									<template #selected>
										<blockchain-card v-if="form.currency_id" :type="form.currency_id as BlockchainType" />
									</template>
									<template #default="{ option }">
										<blockchain-card :type="option.value as BlockchainType" />
									</template>
								</ui-select>
							</ui-form-item>
							<ui-form-item :label="$t('Wallet Address')" name="output_address">
								<ui-input
									size="md"
									v-model="form.output_address"
									is-empty-value-null
									:placeholder="$t('Enter address')"
								/>
							</ui-form-item>
							<ui-form-item :label="$t('Direction')" name="direction">
								<ui-select
									v-model="form.direction"
									type="default"
									:options="optionsDirection"
									:placeholder="$t('Select direction')"
								/>
							</ui-form-item>
							<div class="form__actions">
								<ui-button
									mode="neutral"
									size="xl"
									native-type="submit"
									left-icon-name="check-circle"
									left-icon-size="md"
									:loading="isLoadingAmlScoreTransaction"
								>
									{{ $t("Check transaction") }}
								</ui-button>
							</div>
						</ui-form>
					</block-section>
				</template>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;

		.form {
			display: grid;
			grid-template-columns: 1fr 300px;
			column-gap: 24px;

			&__actions {
				grid-column: 1 / -1;
				display: flex;
				align-items: center;
				justify-content: flex-end;
				margin-top: 8px;
			}
		}
	}
</style>
