<script setup lang="ts">
	import { UiTooltip, UiIcon } from "@dv.net/ui-kit";
	import type { IProps } from "./types";
	import { useSlots } from "vue";

	const { iconSize = "md", iconType = "filled" } = defineProps<IProps>();

	const slots = useSlots();
</script>

<template>
	<ui-tooltip :title="title" :text="text" :popperClass="popperClass" :timeout="timeout">
		<template v-if="slots.infoTitle" #title><slot name="infoTitle" /></template>
		<template v-if="slots.infoText" #text><slot name="infoText" /></template>
		<ui-icon class="pointer" name="help" :type="iconType" :color="iconColor" :size="iconSize" />
	</ui-tooltip>
</template>
