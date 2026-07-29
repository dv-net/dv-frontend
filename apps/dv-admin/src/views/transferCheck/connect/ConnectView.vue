<script setup lang="ts">
	import { useRoute } from "vue-router";
	import DisplayMessage from "@dv-admin/components/ui/displayMessage/DisplayMessage.vue";
	import { UiButton, UiForm, UiFormItem, UiInput, UiSkeleton } from "@dv.net/ui-kit";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { storeToRefs } from "pinia";
	import { useTransferCheckStore } from "@dv-admin/stores/transferCheck";
	import { computed, onMounted, ref } from "vue";
	import { AML_SETTING_LABELS } from "@dv-admin/utils/constants/transferCheck";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { deleteApiAmlKeys, postApiAmlKeys } from "@dv-admin/utils/services/transferCheck.ts";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { useI18n } from "vue-i18n";

	const route = useRoute();
	const { t } = useI18n();

	const transferCheckStore = useTransferCheckStore();
	const { amlKeys, isHaveKeysCurrentAml } = storeToRefs(transferCheckStore);
	const { getAmlKeys } = transferCheckStore;
	const { dictionary } = storeToRefs(useGeneralStore());

	const aml = route.params.aml as string;
	const formRef = ref<HTMLFormElement | null>(null);
	const form = ref<Record<string, string>>({});
	const isLoadingAmlKeys = ref<boolean>(true);
	const isLoadingDeleteAmlKeys = ref<boolean>(false);
	const isLoadingPostAmlKeys = ref<boolean>(false);
	const feedbackMessage = ref<string>("");

	const formFields = computed(() => Object.keys(form.value));

	const currentNameAmlProvider = computed<string>(
		() => dictionary.value?.available_aml_providers.find((provider) => provider.slug === aml)?.label ?? aml
	);

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

	const getStartData = async () => {
		try {
			transferCheckStore.formAmlScoreTransaction.provider_slug = aml;
			await getAmlKeys(aml);
			syncForm();
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingAmlKeys.value = false;
		}
	};

	const postAmlKeys = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			isLoadingPostAmlKeys.value = true;
			await postApiAmlKeys(
				aml,
				Object.entries(form.value).map(([name, value]) => ({ name, value }))
			);
			await getStartData();
			feedbackMessage.value = "Keys saved successfully";
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingPostAmlKeys.value = false;
		}
	};

	const deleteAmlKeys = async () => {
		try {
			isLoadingDeleteAmlKeys.value = true;
			await deleteApiAmlKeys(aml);
			await getStartData();
			feedbackMessage.value = "AML provider keys deleted";
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingDeleteAmlKeys.value = false;
		}
	};

	onMounted(async () => {
		await getStartData();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('AML check of transfer')" back-name-route="transfer-check" />
		<div class="page__content">
			<block-section mode="grey-border">
				<h2 class="global-title-h3 mb-16">{{ $t("Basic settings") }}</h2>
				<div v-if="isLoadingAmlKeys" class="flex flex-column gap-24 mb-24">
					<ui-skeleton
						:rows="1"
						:row-height="72"
						:item-border-radius="8"
						first-color="var(--color-background-tertiary)"
						second-color="var(--color-background-secondary)"
					/>
					<ui-skeleton
						:rows="1"
						:row-height="72"
						:item-border-radius="8"
						first-color="var(--color-background-tertiary)"
						second-color="var(--color-background-secondary)"
					/>
				</div>
				<ui-form
					v-else
					:key="formFields.join(',')"
					ref="formRef"
					class="page__form"
					:model="form"
					:rules="rulesForm"
					@submit.prevent="postAmlKeys"
				>
					<ui-form-item v-for="name in formFields" :key="name" :name="name" :label="getKeyLabel(name)">
						<ui-input v-model="form[name]" show-password />
					</ui-form-item>

					<div class="actions">
						<ui-button
							mode="neutral"
							size="xl"
							native-type="submit"
							:left-icon-name="isHaveKeysCurrentAml ? 'edit' : 'add'"
							left-icon-size="md"
							:loading="isLoadingPostAmlKeys"
						>
							{{ $t(isHaveKeysCurrentAml ? "Change" : "Connect") }} {{ currentNameAmlProvider }}
						</ui-button>
						<ui-button
							v-if="isHaveKeysCurrentAml"
							type="negative"
							size="xl"
							left-icon-name="delete"
							left-icon-size="md"
							:loading="isLoadingDeleteAmlKeys"
							@click="deleteAmlKeys"
						>
							{{ $t("Delete keys") }}
						</ui-button>
					</div>
				</ui-form>
			</block-section>
			<display-message v-model:text="feedbackMessage" class="mt-20" />
		</div>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;

		&__content,
		&__form {
			display: flex;
			flex-direction: column;
			max-width: 720px;
			width: 100%;
		}
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
</style>
