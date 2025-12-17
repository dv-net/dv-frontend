<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { useRoute } from "vue-router";
	import WithdrawalHistoryTable from "@dv-admin/components/common/exchanges/withdrawalHistoryTable/WithdrawalHistoryTable.vue";
	import { ref } from "vue";

	const route = useRoute();
	const slug = route.params.slug as string;

	const childComponentWithdrawalHistoryTable = ref<InstanceType<typeof WithdrawalHistoryTable> | null>(null);

	const callGetExchangeWithdrawal = () => {
		if (childComponentWithdrawalHistoryTable.value) {
			childComponentWithdrawalHistoryTable.value.getExchangeWithdrawal(slug, 1);
		}
	};
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Withdrawal from the crypto exchange')" />
		<div class="page__top">
			<h1 class="global-title-h2">{{ $t("Withdrawal history") }}</h1>
			<ui-button type="secondary" size="md" @click="callGetExchangeWithdrawal">
				{{ $t("Refresh history") }}
			</ui-button>
		</div>
		<withdrawal-history-table
			ref="childComponentWithdrawalHistoryTable"
			:slug="slug"
			:is-request-with-date="false"
		/>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		&__top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 20px;
			margin: 24px 0 32px;
		}
	}
</style>
