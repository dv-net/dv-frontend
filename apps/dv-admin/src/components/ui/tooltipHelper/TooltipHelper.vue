<script setup lang="ts">
	import { UiTooltip, UiIcon } from "@dv.net/ui-kit";
	import type { IProps } from "./types";

	withDefaults(defineProps<IProps>(), {
		position: "top-start",
		iconSize: "md",
		iconType: "filled"
	});
</script>

<template>
	<ui-tooltip mode="dark" :title="title" :text="text" is-gold-title :popperClass="popperClass" :timeout="timeout">
		<template #title><slot name="infoTitle" /></template>
		<template #text><slot name="infoText" /></template>
		<ui-icon class="pointer" name="help" :type="iconType" :color="iconColor" :size="iconSize" />
	</ui-tooltip>
</template>
