<script setup lang="ts">
	import DisplayMessage from "@dv-admin/components/ui/displayMessage/DisplayMessage.vue";
	import { UiButton, UiForm, UiFormItem, UiInput, UiSkeleton } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import TabsVariantA from "@dv-admin/components/ui/tabsVariantA/TabsVariantA.vue";
	import type { TabsVariantAItem } from "@dv-admin/components/ui/tabsVariantA/types";
	import { storeToRefs } from "pinia";
	import { useAmlStore } from "@dv-admin/stores/aml";
	import { computed, ref, watch } from "vue";
	import { useRouter } from "vue-router";
	import { AML_SETTING_LABELS } from "@dv-admin/utils/constants/aml";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { deleteApiAmlKeys, postApiAmlKeys, postApiAmlSettings } from "@dv-admin/utils/services/aml.ts";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";

	const { t } = useI18n();
	const router = useRouter();

	const amlStore = useAmlStore();
	const { amlKeys, isHaveKeysCurrentAml, formAmlScoreTransaction } = storeToRefs(amlStore);
	const { getAmlKeys, getAllAmlKeys, getAmlSettings, syncCurrentAmlKeys } = amlStore;
	const { dictionary, isLoadingDictionary } = storeToRefs(useGeneralStore());

	const formRef = ref<HTMLFormElement | null>(null);
	const form = ref<Record<string, string>>({});
	const isInitializing = ref(false);
	const isLoadingDeleteAmlKeys = ref(false);
	const isLoadingPostAmlKeys = ref(false);
	const feedbackMessage = ref("");

	const providers = computed(() => dictionary.value?.available_aml_providers ?? []);
	const providerTabItems = computed<TabsVariantAItem[]>(() =>
		providers.value.map((provider) => ({
			value: provider.slug,
			name: provider.label
		}))
	);
	const selectedProvider = computed({
		get: () => formAmlScoreTransaction.value.provider_slug,
		set: (value: string) => {
			formAmlScoreTransaction.value.provider_slug = value;
		}
	});
	const formFields = computed(() => Object.keys(form.value));
	const isLoadingForm = computed(() => isLoadingDictionary.value || isInitializing.value);

	const getKeyLabel = (name: string): string => {
		return name in AML_SETTING_LABELS ? t(AML_SETTING_LABELS[name]) : name;
	};

	const rulesForm = computed<UiFormRules>(() => {
		return Object.fromEntries(
			formFields.value.map((name) => [name, [{ required: true, message: t("Fill in the field") }]])
		);
	});

	const syncForm = () => {
		const next = Object.fromEntries(amlKeys.value.map((item) => [item.name, item.value || ""]));
		for (const key of Object.keys(form.value)) {
			if (!(key in next)) delete form.value[key];
		}
		Object.assign(form.value, next);
	};

	const applyProviderFromCache = (slug: string) => {
		if (!slug) return;
		feedbackMessage.value = "";
		syncCurrentAmlKeys(slug);
		syncForm();
	};

	const refreshProviderKeys = async (slug: string) => {
		if (!slug) return;
		await getAmlKeys(slug);
		syncForm();
	};

	const handleChangeProvider = (slug: string) => {
		applyProviderFromCache(slug);
	};

	const postAmlKeys = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate()) || !selectedProvider.value) return;
			isLoadingPostAmlKeys.value = true;
			const providerSlug = selectedProvider.value;
			await postApiAmlKeys(
				providerSlug,
				Object.entries(form.value).map(([name, value]) => ({ name, value }))
			);
			await refreshProviderKeys(providerSlug);
			const settings = await postApiAmlSettings({
				enabled: true,
				provider_slug: providerSlug
			});
			if (settings) amlStore.amlSettings = settings;
			await router.push({ name: "aml-settings", params: { aml: providerSlug } });
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingPostAmlKeys.value = false;
		}
	};

	const deleteAmlKeys = async () => {
		if (!selectedProvider.value) return;
		try {
			isLoadingDeleteAmlKeys.value = true;
			await deleteApiAmlKeys(selectedProvider.value);
			await refreshProviderKeys(selectedProvider.value);
			feedbackMessage.value = "AML provider keys deleted";
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingDeleteAmlKeys.value = false;
		}
	};

	const initPage = async () => {
		if (!providers.value.length) return;
		isInitializing.value = true;
		try {
			if (!selectedProvider.value || !providers.value.some((item) => item.slug === selectedProvider.value)) {
				selectedProvider.value = providers.value[0].slug;
			}
			await getAmlSettings();
			if (!selectedProvider.value || !providers.value.some((item) => item.slug === selectedProvider.value)) {
				selectedProvider.value = providers.value[0].slug;
			}
			await getAllAmlKeys();
			syncForm();
		} catch (error: any) {
			console.error(error);
		} finally {
			isInitializing.value = false;
		}
	};

	watch(providers, (list) => {
		if (list.length) initPage();
	}, { immediate: true });
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("AML settings") }}</h1>

		<div class="page__content">
			<block-section mode="white" class="connect-card">
				<div class="connect-card__head">
					<div class="connect-card__title-row">
						<h2 class="global-title-h3">{{ $t("1. Provider connection") }}</h2>
						<div
							class="connect-card__badge"
							:class="isHaveKeysCurrentAml ? 'connect-card__badge--positive' : 'connect-card__badge--neutral'"
						>
							<span class="connect-card__dot" />
							<span>{{ $t(isHaveKeysCurrentAml ? "Connected" : "Not connected") }}</span>
						</div>
					</div>

					<ui-skeleton v-if="isLoadingDictionary" :rowHeight="48" :rows="1" :item-border-radius="100" />
					<tabs-variant-a
						v-else-if="providerTabItems.length"
						v-model="selectedProvider"
						:items="providerTabItems"
						@update:model-value="handleChangeProvider"
					/>
				</div>

				<ui-form
					v-if="selectedProvider"
					:key="`${selectedProvider}-${formFields.join(',')}`"
					ref="formRef"
					class="connect-card__form"
					:model="form"
					:rules="rulesForm"
					@submit.prevent="postAmlKeys"
				>
					<div v-if="isLoadingForm" class="connect-card__fields">
						<ui-skeleton :rows="1" :row-height="96" :item-border-radius="8" />
						<ui-skeleton :rows="1" :row-height="96" :item-border-radius="8" />
					</div>
					<div
						v-else
						class="connect-card__fields"
						:class="{ 'connect-card__fields--single': formFields.length === 1 }"
					>
						<ui-form-item v-for="name in formFields" :key="name" :name="name" :label="getKeyLabel(name)">
							<ui-input v-model="form[name]" show-password />
						</ui-form-item>
					</div>

					<div class="connect-card__actions">
						<display-message v-model:text="feedbackMessage" class="connect-card__message" />
						<div class="connect-card__buttons">
							<ui-button
								size="xl"
								mode="neutral"
								native-type="submit"
								:left-icon-name="isHaveKeysCurrentAml ? 'edit' : 'add-link'"
								left-icon-size="md"
								:loading="isLoadingPostAmlKeys"
								:disabled="isLoadingForm"
							>
								{{ $t(isHaveKeysCurrentAml ? "Change" : "Connect") }}
							</ui-button>
							<ui-button
								v-if="isHaveKeysCurrentAml"
								type="negative"
								size="xl"
								left-icon-name="delete"
								left-icon-size="md"
								:loading="isLoadingDeleteAmlKeys"
								:disabled="isLoadingForm"
								@click="deleteAmlKeys"
							>
								{{ $t("Delete keys") }}
							</ui-button>
						</div>
					</div>
				</ui-form>
			</block-section>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;

		&__content {
			width: 100%;
		}
	}

	.connect-card {
		display: flex;
		flex-direction: column;
		gap: 20px;

		&__head {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		&__title-row {
			display: flex;
			align-items: center;
			gap: 20px;
			flex-wrap: wrap;
		}

		&__badge {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			padding: 4px 10px;
			border-radius: 100px;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			white-space: nowrap;

			&--positive {
				background-color: rgba(31, 150, 73, 0.08);
				color: rgb(31, 150, 73);

				.connect-card__dot {
					background-color: rgb(31, 150, 73);
				}
			}

			&--neutral {
				background-color: rgba(164, 165, 177, 0.16);
				color: rgb(107, 109, 128);

				.connect-card__dot {
					background-color: rgb(107, 109, 128);
				}
			}
		}

		&__dot {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			flex-shrink: 0;
		}

		&__form {
			display: flex;
			flex-direction: column;
			gap: 20px;
			width: 100%;
		}

		&__fields {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 18px;
			width: 100%;

			&--single {
				grid-template-columns: 1fr;
			}

			@media (max-width: 768px) {
				grid-template-columns: 1fr;
			}
		}

		&__actions {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			flex-wrap: wrap;
		}

		&__message {
			min-width: 0;
			flex: 1;
		}

		&__buttons {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 16px;
			flex-wrap: wrap;
			margin-left: auto;

			:deep(.ui-button) {
				min-width: 240px;
			}
		}
	}
</style>
