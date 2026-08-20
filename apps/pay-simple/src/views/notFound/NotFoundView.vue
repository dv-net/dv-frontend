<script setup lang="ts">
	import { onMounted } from "vue";
	import { loaderShutdown } from "@pay-shared/utils/helpers/general";

	onMounted(() => {
		loaderShutdown();
	});
</script>

<template>
	<h1>{{ $t("Page not found") }}</h1>
</template>
