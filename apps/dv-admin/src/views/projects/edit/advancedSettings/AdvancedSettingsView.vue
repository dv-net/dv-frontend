<script setup lang="ts">
	import {
		UiButton,
		UiCopyText,
		UiInput,
		UiSwitch,
		UiCheckbox,
		UiCheckboxGroup,
		UiFormItem
	} from "@dv.net/ui-kit/dist";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { storeToRefs } from "pinia";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import BlockchainCard from "@dv-admin/components/ui/blockchainCard/BlockchainCard.vue";
	import { useRoute } from "vue-router";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import { computed, onMounted, ref } from "vue";
	import { useI18n } from "vue-i18n";
	import { putApiCurrenciesProject } from "@dv-admin/services/api/projects.ts";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { UiForm } from "@dv.net/ui-kit";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { isValidUrl } from "@shared/utils/helpers/general.ts";

	const {
		currentProject,
		currenciesProject,
		isLoadingEditProject,
		checkedCurrenciesProject,
		selectAllCurrenciesProject
	} = storeToRefs(useProjectsStore());
	const { dictionary } = storeToRefs(useGeneralStore());
	const { putOneProject, getCurrenciesProject } = useProjectsStore();
	const { t } = useI18n();

	const route = useRoute();
	const uuid = route.params.id as string;
	const formRef = ref<HTMLFormElement | null>(null);

	const linkPayForm = computed<string>(() => {
		if (!dictionary.value || !currentProject.value) return "";
		const findSetting = dictionary.value.general_settings.find((item) => item.name === "merchant_pay_form_domain");
		const location = findSetting && findSetting.value ? findSetting.value : window.location.origin;
		return `${location}/pay/store/${currentProject.value.id}/<${t("your client ID")}>`;
	});

	const rulesForm = computed<UiFormRules>(() => {
		return {
			name: [{ required: true, message: t("Enter the store name") }],
			site: [
				{
					validator: () => (currentProject.value?.site !== null ? isValidUrl(currentProject.value?.site) : true),
					message: t("Please enter a valid URL")
				}
			],
			return_url: [
				{
					validator: () =>
						currentProject.value?.return_url !== null ? isValidUrl(currentProject.value?.return_url) : true,
					message: t("Please enter a valid URL")
				}
			],
			success_url: [
				{
					validator: () =>
						currentProject.value?.success_url !== null ? isValidUrl(currentProject.value?.success_url) : true,
					message: t("Please enter a valid URL")
				}
			],
			minimal_payment: [
				{ required: true, message: t("minimum-deposit-store", { amount: "$0.1" }) },
				{
					validator: () =>
						Boolean(currentProject.value?.minimal_payment && currentProject.value.minimal_payment >= 0.1),
					message: t("minimum-deposit-store", { amount: "$0.1" })
				}
			]
		};
	});

	const handlePutOneProject = async () => {
		if (!currentProject.value) return;
		if (!formRef.value || !(await formRef.value.validate())) return;
		await putApiCurrenciesProject(uuid, { currency_ids: checkedCurrenciesProject.value });
		await putOneProject(t("The project has been saved"));
		await getCurrenciesProject(uuid);
	};

	const handleChangeSelectAll = () => {
		selectAllCurrenciesProject.value = !selectAllCurrenciesProject.value;
		checkedCurrenciesProject.value = selectAllCurrenciesProject.value
			? currenciesProject.value.map((item) => item.currency_id)
			: [];
	};

	const handleClickCard = async (currencyId: string) => {
		if (checkedCurrenciesProject.value.includes(currencyId)) {
			checkedCurrenciesProject.value = checkedCurrenciesProject.value.filter((item) => item !== currencyId);
		} else {
			checkedCurrenciesProject.value.push(currencyId);
		}
		selectAllCurrenciesProject.value = currenciesProject.value.length === checkedCurrenciesProject.value.length;
	};
</script>

<template>
	<ui-form v-if="currentProject" ref="formRef" :rules="rulesForm" :model="currentProject" class="advanced">
		<block-section class="general" mode="grey">
			<h3 class="global-title-h3 flex gap-4">
				{{ $t("General.many") }}
				<tooltip-helper
					:title="$t('General.many')"
					:text="$t('Will be displayed to the client in the payment form.')"
				/>
			</h3>
			<div class="general__inputs">
				<ui-form-item name="name" :label="$t('Store name (will be displayed on the payment form)')">
					<ui-input size="lg" v-model="currentProject.name" />
				</ui-form-item>
				<ui-form-item name="site">
					<template #label>
						<div class="flex flex-y-center gap-4">
							<span>{{ $t("Project website") }}</span>
							<tooltip-helper :title="$t('Project website')" :text="$t('Your store domain.')" icon-color="#6b6d80" />
						</div>
					</template>
					<ui-input size="lg" v-model="currentProject.site" is-empty-value-null />
				</ui-form-item>
			</div>
		</block-section>
		<block-section class="store" mode="grey">
			<div class="row">
				<h4 class="row__title">{{ $t("Store status") }}</h4>
				<div class="row__actions">
					<p class="row__actions-text">
						{{ $t("When you turn off a store, you also stop accepting payments for all invoices for that store") }}
					</p>
					<ui-switch v-model="currentProject.status" :text="$t('Store enabled')" />
				</div>
			</div>
			<div class="row" v-if="currenciesProject?.length">
				<h4 class="row__title">{{ $t("Accepted currencies") }}</h4>
				<div class="row__actions">
					<p class="row__actions-text">{{ $t("Select which crypto currencies you want to accept in your store") }}</p>
					<ui-checkbox-group class="row__currencies" v-model="checkedCurrenciesProject">
						<div class="row__currency" @click="handleChangeSelectAll">
							<ui-checkbox is-selected-all v-model="selectAllCurrenciesProject" style="pointer-events: none">
								{{ $t("Select all") }}
							</ui-checkbox>
						</div>
						<div
							class="row__currency"
							v-for="item in currenciesProject"
							:key="item.currency_id"
							@click="handleClickCard(item.currency_id)"
						>
							<ui-checkbox :value="item.currency_id" style="pointer-events: none" />
							<blockchain-card :type="item.currency_id" />
						</div>
					</ui-checkbox-group>
				</div>
			</div>
		</block-section>
		<block-section class="form">
			<h2 class="global-title-h3 mb-8">{{ $t("Payment form settings") }}</h2>
			<div class="form__row">
				<ui-form-item name="return_url" :label="$t('Return URL')">
					<ui-input size="lg" v-model="currentProject.return_url" is-empty-value-null />
				</ui-form-item>
				<ui-form-item name="success_url" :label="$t('Successful URL')">
					<ui-input size="lg" v-model="currentProject.success_url" is-empty-value-null />
				</ui-form-item>
				<ui-form-item name="minimal_payment" :label="$t('Minimal payment')">
					<ui-input size="lg" v-model="currentProject.minimal_payment" type="number" is-empty-value-null>
						<template #append>$</template>
					</ui-input>
				</ui-form-item>
				<ui-form-item :label="$t('Link to payment form without API')">
					<div class="link">
						<span class="link__text">{{ linkPayForm }}</span>
						<ui-copy-text :copied-text="linkPayForm" color-icon="#6b6d80" />
					</div>
				</ui-form-item>
				<ui-switch
					class="mt-8"
					v-model="currentProject.public_payment_form_enabled"
					:text="$t('Form without API is active')"
				/>
			</div>
		</block-section>
		<ui-button mode="neutral" size="xl" :loading="isLoadingEditProject" @click="handlePutOneProject">
			{{ $t("Save") }}
		</ui-button>
	</ui-form>
</template>

<style scoped lang="scss">
	.advanced {
		display: flex;
		flex-direction: column;
		gap: 24px;
		.general {
			display: flex;
			flex-direction: column;
			gap: 16px;
			padding: 24px 24px 0 24px;
			&__inputs {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 16px;
			}
		}
		.store {
			width: 100%;
			display: flex;
			flex-direction: column;
			gap: 16px;
			.row {
				display: flex;
				flex-direction: column;
				gap: 16px;
				padding-bottom: 16px;
				border-bottom: 1px solid $grey;
				&:last-child {
					border-bottom: unset;
				}
				&__title {
					color: #333742;
					font-size: 16px;
					font-weight: 500;
					line-height: 20px;
				}
				&__actions {
					display: flex;
					flex-direction: column;
					gap: 20px;
					&-text {
						color: #828282;
						font-size: 16px;
						font-weight: 400;
						line-height: 20px;
					}
					&:deep(.ui-switch__label) {
						p {
							color: $black;
							font-size: 14px;
							font-weight: 500;
							line-height: 16px;
						}
					}
				}
				&__currencies {
					display: grid;
					grid-template-columns: repeat(4, 1fr);
					column-gap: 12px;
					row-gap: 16px;
				}
				&__currency {
					display: flex;
					align-items: center;
					gap: 16px;
					padding: 16px;
					border-radius: 8px;
					border: 1px solid $grey;
					background-color: $white;
					transition: border 0.3s ease-in-out;
					@media (hover: hover) {
						&:hover {
							cursor: pointer;
							border: 1px solid #1968e5;
						}
					}
				}
			}
		}
		.form {
			display: flex;
			flex-direction: column;
			gap: 16px;
			&__row {
				display: grid;
				grid-template-columns: 1fr 1fr;
				column-gap: 24px;
				&:deep(.ui-switch__label) {
					p {
						color: $black;
						font-size: 14px;
						font-weight: 500;
						line-height: 16px;
					}
				}
			}
			.link {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 8px;
				&__text {
					color: $secondary;
					font-size: 16px;
					font-weight: 400;
					line-height: 20px;
				}
			}
		}
	}
</style>
