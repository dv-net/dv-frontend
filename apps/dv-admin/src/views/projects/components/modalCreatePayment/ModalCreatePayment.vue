<script setup lang="ts">
	import {
		UiButton,
		UiCheckbox,
		UiCopyText,
		UiForm,
		UiFormItem,
		UiIcon,
		UiInput,
		UiLink,
		UiModal,
		UiSelect
	} from "@dv.net/ui-kit";
	import { computed, ref, watch } from "vue";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { storeToRefs } from "pinia";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general";
	import { generateUUID, getCurrentBlockchain, getCurrentCoin } from "@shared/utils/helpers/general";
	import type { IExternalWalletRequest, IStoreResponse } from "@dv-admin/utils/types/api/apiGo";
	import { useI18n } from "vue-i18n";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import type { BlockchainType } from "@shared/utils/types/blockchain";
	import { postApiWalletAddresses } from "@dv-admin/services/api/hotWallets.ts";

	const { currenciesProject } = storeToRefs(useProjectsStore());
	const { getCurrenciesProject } = useProjectsStore();
	const { notify } = useNotifications();
	const { t } = useI18n();

	const { currentStore } = defineProps<{ currentStore: IStoreResponse | null }>();
	const isShow = defineModel<boolean>("isShow", { required: true, default: false });

	const isLoading = ref<boolean>(false);
	const linkToPayment = ref<string | null>(null);
	const isGenerateStoreID = ref<boolean>(true);
	const formRef = ref<HTMLFormElement | null>(null);
	const formError = ref<string>("");
	const form = ref<IExternalWalletRequest>({
		amount: null,
		email: null,
		store_id: null,
		store_external_id: null,
		currency: null
	});

	const rulesForm = computed<UiFormRules>(() => {
		return {
			store_external_id: [{ required: true, message: t("Enter external store ID") }]
		};
	});

	const optionsCurrencies = computed<IUiSelectOptions[]>(() => {
		return currenciesProject.value
			.filter((item) => item.enabled)
			.map((item) => ({
				label: `${getCurrentCoin(item.currency_id)} (${getCurrentBlockchain(item.currency_id)})`,
				value: item.currency_id
			}));
	});

	const handleSendForm = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			isLoading.value = true;
			const link = await postApiWalletAddresses(form.value);
			if (link) linkToPayment.value = link;
			notify(t("Payment is created"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	const handleChangeCheckbox = (value: boolean) => {
		form.value.store_external_id = value ? generateUUID() : null;
	};

	const resetDataForm = () => {
		linkToPayment.value = null;
		form.value.amount = null;
		form.value.email = null;
		form.value.store_external_id = null;
		form.value.currency = null;
	};

	watch(isShow, (value: boolean) => {
		if (value) {
			form.value.store_external_id = generateUUID();
			isGenerateStoreID.value = true;
		}
	});

	watch(
		() => currentStore?.id,
		async (uuid?: string) => {
			if (!uuid) return;
			await getCurrenciesProject(uuid);
			form.value.store_id = uuid;
		}
	);
</script>

<template>
	<ui-modal v-model="isShow" width="480" padding="0" @close="resetDataForm">
		<div class="form">
			<div class="form__header">{{ $t("Create payment") }} «{{ currentStore?.name || "unknown" }}»</div>
			<div class="form__body">
				<ui-form id="idForm" ref="formRef" :model="form" :rules="rulesForm" @submit.prevent="handleSendForm">
					<ui-form-item name="email" :label="$t(`Payer's mail`)" :error="formError">
						<ui-input
							v-model="form.email"
							is-empty-value-null
							size="lg"
							type="email"
							:placeholder="$t('Enter your email')"
						/>
					</ui-form-item>
					<ui-form-item name="amount" :label="$t('Total')" :error="formError">
						<ui-input
							type="number"
							size="lg"
							is-empty-value-null
							v-model="form.amount"
							:placeholder="$t('Enter the amount')"
						>
							<template #append>$</template>
						</ui-input>
					</ui-form-item>
					<ui-form-item name="currency" :label="$t('Currency')" :error="formError">
						<ui-select
							v-model="form.currency"
							size="lg"
							type="default"
							:options="optionsCurrencies"
							with-search
							:teleport="false"
							:placeholder="$t('Select currency')"
						>
							<template #selected>
								<blockchain-card v-if="form.currency" :type="form.currency as BlockchainType" />
							</template>
							<template #default="{ option }">
								<blockchain-card :type="option.value as BlockchainType" />
							</template>
						</ui-select>
					</ui-form-item>
					<ui-form-item name="store_external_id" :label="$t('External store ID') + ' *'" :error="formError">
						<ui-input
							v-model="form.store_external_id"
							is-empty-value-null
							:disabled="isGenerateStoreID"
							size="lg"
							:placeholder="$t('Enter external store ID')"
						/>
						<ui-checkbox v-model="isGenerateStoreID" class="mt-8" size="sm" @change="handleChangeCheckbox">
							{{ $t("Generate automatically") }}
						</ui-checkbox>
					</ui-form-item>
				</ui-form>
			</div>
			<div class="form__footer">
				<ui-input v-if="linkToPayment" v-model="linkToPayment" size="lg" class="mb-24">
					<template #prepend>
						<ui-icon name="language" type="400" size="md" color="#6b6d80" />
					</template>
					<template #append>
						<div class="flex flex-y-center gap-4">
							<ui-copy-text :copied-text="linkToPayment" color-icon="#6b6d80" size-icon="md" />
							<ui-link class="icon-link" :href="linkToPayment" target="_blank">
								<ui-icon name="new-windows" type="400" size="md" color="#6b6d80" />
							</ui-link>
						</div>
					</template>
				</ui-input>
				<ui-button form="idForm" class="w-full" native-type="submit" mode="neutral" size="xl" :loading="isLoading">
					{{ $t("Create payment") }}
				</ui-button>
			</div>
		</div>
	</ui-modal>
</template>

<style scoped lang="scss">
	.form {
		display: flex;
		flex-direction: column;
		&__header {
			min-height: 56px;
			display: flex;
			align-items: center;
			color: $black;
			font-size: 18px;
			font-weight: 400;
			border-bottom: 1px solid $grey;
			padding: 16px;
			word-break: break-word;
		}
		&__body {
			flex-grow: 1;
			padding: 16px;
		}
		&__footer {
			display: flex;
			flex-direction: column;
			border: 1px solid $grey;
			background-color: $blue-opacity;
			padding: 16px;
			border-radius: 0 0 12px 12px;
		}
		&:deep(.ui-input) {
			.icon-link {
				display: flex;
				align-items: center;
				transition: transform 0.3s ease-in-out;
				@media (hover: hover) {
					&:hover {
						transform: scale(1.1);
					}
				}
			}
		}
	}
</style>
