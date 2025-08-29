<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import TronSettingsHead from "@dv-admin/views/dashboard/tronSettings/components/TronSettingsHead.vue";
	import TronSettingsBody from "@dv-admin/views/dashboard/tronSettings/components/TronSettingsBody.vue";
	import { onMounted } from "vue";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";

	const { getProcessingWallets, getTronResourceExpenses, getTronDepositSummary } = useDashboardStore();
	const { getUserSettings } = useUserSettingsStore();

	onMounted(async () => {
		await Promise.all([getUserSettings(), getProcessingWallets(), getTronResourceExpenses(), getTronDepositSummary()]);
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Dashboard')" back-name-route="dashboard" />
		<h1 class="global-title-h2 mt-24 mb-32">{{ $t("TRON Processing Settings") }}</h1>
		<tron-settings-head />
		<tron-settings-body />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
	}
</style>
