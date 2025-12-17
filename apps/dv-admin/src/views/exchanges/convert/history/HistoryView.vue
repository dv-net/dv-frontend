<script setup lang="ts">
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import { useRoute } from "vue-router";
	import { UiButton } from "@dv.net/ui-kit";
	import ConvertHistoryTable from "@dv-admin/components/common/exchanges/convertHistoryTable/ConvertHistoryTable.vue";
	import { ref } from "vue";

	const route = useRoute();
	const slug = route.params.slug as string;

	const childComponentConvertHistoryTable = ref<InstanceType<typeof ConvertHistoryTable> | null>(null);

	const callGetExchangeOrder = () => {
		if (childComponentConvertHistoryTable.value) {
			childComponentConvertHistoryTable.value.getExchangeOrder(slug, 1);
		}
	};
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('Auto exchange')" />
		<div class="page__top">
			<h1 class="global-title-h2">{{ $t("Exchange history") }}</h1>
			<ui-button type="secondary" size="md" @click="callGetExchangeOrder">
				{{ $t("Refresh history") }}
			</ui-button>
		</div>
		<convert-history-table
			ref="childComponentConvertHistoryTable"
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
