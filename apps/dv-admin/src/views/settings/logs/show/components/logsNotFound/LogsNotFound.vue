<script setup lang="ts">
	import { useMonitorsStore } from "@dv-admin/stores/monitors";
	import { storeToRefs } from "pinia";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import IconNotFound from "@dv-admin/components/icons/IconNotFound.vue";
	import { UiSkeleton } from "@dv.net/ui-kit";

	const { isLoadingMonitorsSlug, monitorsCurrentTypeList } = storeToRefs(useMonitorsStore());
</script>

<template>
	<ui-skeleton v-if="isLoadingMonitorsSlug" :rows="3" :row-height="110" :item-border-radius="4" :rows-gap="8" />

	<block-section v-if="!monitorsCurrentTypeList.length && !isLoadingMonitorsSlug">
		<div class="notfound">
			<icon-not-found />
			<h3 class="global-title-h3">{{ $t("No results") }}</h3>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.skeleton {
		display: flex;
		flex-direction: column;
		gap: 8px;
		&__item {
			padding: 55px 0;
		}
	}
	.notfound {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
