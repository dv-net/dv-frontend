<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { UiButton, UiForm, UiFormItem, UiInput } from "@dv.net/ui-kit/dist";
	import { computed, ref } from "vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import type { IStoreRequest } from "@dv-admin/utils/types/api/apiGo";
	import { postApiCreateStore } from "@dv-admin/services/api/projects";
	import { useRouter } from "vue-router";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";
	import type { UiFormRules } from "@dv.net/ui-kit/dist/components/UiForm/types";
	import { isValidUrl } from "@shared/utils/helpers/general.ts";

	const { notify } = useNotifications();

	const { t } = useI18n();
	const router = useRouter();
	const isLoading = ref<boolean>(false);
	const form = ref<IStoreRequest>({ name: "", site: null });
	const formRef = ref<HTMLFormElement | null>(null);

	const rulesForm = computed<UiFormRules>(() => {
		return {
			name: [{ required: true, message: t("Enter the store name") }],
			site: [
				{
					validator: () => (form.value?.site !== null ? isValidUrl(form.value?.site) : true),
					message: t("Please enter a valid URL")
				}
			],
		}
	})

	const createNewStore = async () => {
		try {
			if (!formRef.value || !(await formRef.value.validate())) return;
			isLoading.value = true;
			await postApiCreateStore(form.value);
			await router.push({ name: "projects" });
			notify(t("Store created successfully"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Projects')" back-name-route="projects" />
		<h1 class="global-title-h2 mb-8">{{ $t("Creating a store") }}</h1>
		<ui-form
			ref="formRef"
			class="form"
			:model="form"
			:rules="rulesForm"
			@submit.prevent="createNewStore"
		>
			<block-section class="flex flex-column" mode="grey-border">
				<h2 class="global-title-h3 mb-16">{{ $t("Basic settings") }}</h2>
				<ui-form-item name="name" :label="$t('Store name (will be displayed on the payment form)')">
					<ui-input size="lg" v-model="form.name" :placeholder="$t('Enter the store name')" />
				</ui-form-item>
				<ui-form-item name="site" :label="$t('Project website')">
					<ui-input
						size="lg"
						v-model="form.site"
						is-empty-value-null
						:placeholder="`${$t('Example')}: https://dv.net`"
					/>
				</ui-form-item>
				<ui-button mode="neutral" size="xl" native-type="submit" :loading="isLoading">
					{{ $t("Create a project") }}
				</ui-button>
			</block-section>
		</ui-form>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;
		.form {
			max-width: 720px;
			width: 100%;
		}
	}
</style>
