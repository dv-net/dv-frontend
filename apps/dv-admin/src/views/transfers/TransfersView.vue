<script setup lang="ts">
	import Queue from "@dv-admin/views/transfers/components/queue/Queue.vue";
	import Progress from "@dv-admin/views/transfers/components/progress/Progress.vue";
	import Completed from "@dv-admin/views/transfers/components/completed/Completed.vue";
	import { onMounted } from "vue";
	import { useTransferStore } from "@dv-admin/stores/transfer";
	import { usePolling } from "@shared/utils/composables/usePolling";

	const { startPolling } = usePolling();
	const { getTransferPrefetch, getTransferNew, getTransferCompleted, getTransferFailed, getTransferAll } =
		useTransferStore();

	onMounted(async () => {
		await startPolling(async () => {
			await Promise.all([
				getTransferCompleted(),
				getTransferPrefetch(),
				getTransferNew(),
				getTransferFailed(),
				getTransferAll()
			]);
		});
	});
</script>

<template>
	<div class="page">
		<h1 class="global-title-h1">{{ $t("Transfers") }}</h1>
		<queue />
		<Progress />
		<completed />
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}
</style>
