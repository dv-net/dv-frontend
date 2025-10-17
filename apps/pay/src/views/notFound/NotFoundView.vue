<script setup lang="ts">
	import { onMounted } from "vue";
	import { loaderShutdown } from "@pay/utils/helpers/general.ts";

	onMounted(() => {
		loaderShutdown()
	})
</script>

<template>
	<h1>{{ $t("Page not found") }}</h1>
</template>
