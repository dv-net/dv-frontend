<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { UiButton, UiInput } from "@dv.net/ui-kit/dist";
	import { computed, ref } from "vue";
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import type { IStoreRequest } from "@dv-admin/utils/types/api/apiGo";
	import { postApiCreateStore } from "@dv-admin/services/api/projects";
	import { useRouter } from "vue-router";
	import { useNotifications } from "@shared/utils/composables/useNotifications";
	import { useI18n } from "vue-i18n";

	const { notify } = useNotifications();

	const { t } = useI18n();
	const router = useRouter();
	const isLoading = ref<boolean>(false);
	const form = ref<IStoreRequest>({ name: "", site: null });

	const isDisabledBtn = computed<boolean>(() => !form.value.name);

	const createNewStore = async () => {
		try {
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
		<form class="form" @submit.prevent="createNewStore">
			<block-section class="flex flex-column gap-16" mode="grey-border">
				<h2 class="global-title-h3">{{ $t("Basic settings") }}</h2>
				<global-input title="Store name (will be displayed on the payment form)">
					<ui-input size="lg" v-model="form.name" />
				</global-input>
				<global-input title="Project website">
					<ui-input size="lg" v-model="form.site" is-empty-value-null />
				</global-input>
			</block-section>
			<ui-button mode="neutral" size="xl" native-type="submit" :loading="isLoading" :disabled="isDisabledBtn">
				{{ $t("Create a project") }}
			</ui-button>
		</form>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;
		.form {
			display: flex;
			flex-direction: column;
			gap: 24px;
			max-width: 720px;
			width: 100%;
		}
	}
</style>
