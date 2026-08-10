<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { storeToRefs } from "pinia";
	import { UiButton } from "@dv.net/ui-kit";
	import AmlStatusBar from "@dv-admin/views/aml/components/amlStatusBar/AmlStatusBar.vue";
	import AmlRiskRules from "@dv-admin/views/aml/components/amlRiskRules/AmlRiskRules.vue";
	import { useAmlStore } from "@dv-admin/stores/aml";

	const route = useRoute();
	const router = useRouter();

	const amlStore = useAmlStore();
	const { formAmlScoreTransaction } = storeToRefs(amlStore);
	const { getAmlKeys, getAmlSettings } = amlStore;

	const isLoading = ref(true);

	const aml = computed(() => route.params.aml as string);

	const goToHistory = () => {
		router.push({ name: "aml" });
	};

	const initSettings = async () => {
		if (!aml.value) return;
		isLoading.value = true;
		try {
			formAmlScoreTransaction.value.provider_slug = aml.value;
			await Promise.all([getAmlKeys(aml.value), getAmlSettings()]);
		} catch (error) {
			console.error(error);
		} finally {
			isLoading.value = false;
		}
	};

	onMounted(initSettings);

	watch(aml, initSettings);
</script>

<template>
	<div class="page">
		<div class="page__header">
			<h1 class="global-title-h1">{{ $t("AML settings") }}</h1>
			<ui-button
				type="secondary"
				size="xl"
				left-icon-name="history"
				left-icon-size="md"
				@click="goToHistory"
			>
				{{ $t("History of checks") }}
			</ui-button>
		</div>

		<aml-status-bar :is-loading="isLoading" />
		<aml-risk-rules :is-loading="isLoading" />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 24px;

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
		}
	}
</style>
