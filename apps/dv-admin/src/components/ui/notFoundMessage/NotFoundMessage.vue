<script setup lang="ts">
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import type { IProps } from "@dv-admin/components/ui/notFoundMessage/types";

	withDefaults(defineProps<IProps>(), {
		size: "md",
		mode: "transparent"
	});
</script>

<template>
	<block-section class="text" :mode="mode" :class="[`size-${size}`]">
		{{ text || $t("Not found") }}
	</block-section>
</template>

<style scoped lang="scss">
	.text {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		&.size-sm {
			min-height: 50px;
		}
		&.size-md {
			min-height: 100px;
		}
		&.size-lg {
			min-height: 150px;
		}
	}
</style>
