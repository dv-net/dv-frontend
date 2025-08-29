<script setup lang="ts">
	import ShowStatus from "@dv-admin/components/ui/showStatus/ShowStatus.vue";
	import { ALL_MODE_TAG, ALL_STATUSES } from "@dv-admin/utils/constants/general";

	const { wFull = true } = defineProps<{ status: string; wFull?: boolean }>();
</script>

<template>
	<show-status
		:mode="status in ALL_MODE_TAG ? ALL_MODE_TAG[status] : 'accent'"
		:text="$t(status in ALL_STATUSES ? ALL_STATUSES[status] : status)"
		:w-full="wFull"
	/>
</template>

<style scoped lang="scss"></style>
