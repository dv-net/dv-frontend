<script setup lang="ts">
	import { UiIcon } from "@dv.net/ui-kit";
	import type { UiIconSize } from "@dv.net/ui-kit/dist/components/UiIcon/types";

	const { colorIcon = "inherit", sizeIcon = "lg" } = defineProps<{
		callback: () => Promise<void>;
		colorIcon?: string;
		sizeIcon?: UiIconSize;
	}>();
</script>

<template>
	<ui-icon name="autorenew 1" type="400" :size="sizeIcon" :color="colorIcon" class="icon" @click="callback" />
</template>

<style scoped lang="scss">
	.icon {
		transition: var(--transition);

		@media (hover: hover) {
			&:hover {
				cursor: pointer;
				transform: scale(1.1) rotate(90deg);
			}
		}
	}
</style>
