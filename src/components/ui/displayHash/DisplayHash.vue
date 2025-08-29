<script setup lang="ts">
	import type { IProps } from "@shared//components/ui/displayHash/types.ts";
	import { truncateHash } from "@shared/utils/helpers/general";
	import { UiCopyText, UiIcon, UiLink } from "@dv.net/ui-kit";
	import { computed } from "vue";
	import { getLinkExplorer, getLinkSearch } from "@shared/utils/helpers/linkExplorer";

	const props = withDefaults(defineProps<IProps>(), {
		countPrefix: 14,
		countSuffix: 6,
		isLink: true,
		isShowIconCopy: true,
		isShowHash: true,
		colorIcon: "#6B6D80",
		sizeIcon: "md",
		sizeHash: "lg",
		modeLink: "primary"
	});

	const linkSearch = computed<string>(() => {
		if (!props.hash || !props.type || !props.isLink) return "";
		return getLinkSearch(props.type, props.hash);
	});

	const linkExplorer = computed<string>(() => {
		if (!props.currencyId || !props.type || !props.hash) return "";
		return getLinkExplorer(props.currencyId, props.type, props.hash);
	});
</script>

<template>
	<div v-if="hash" class="hash">
		<ui-link v-if="isShowHash" :href="linkExplorer" :size="sizeHash" target="_blank" :mode="modeLink">
			{{ truncateHash(hash, countPrefix, countSuffix) }}
		</ui-link>
		<div class="hash__icons">
			<ui-copy-text v-if="isShowIconCopy" :copied-text="hash" :color-icon="colorIcon" :size-icon="sizeIcon" />
			<ui-link v-if="isLink && linkSearch" :to="linkSearch">
				<ui-icon type="400" name="new-windows" :size="sizeIcon" :color="colorIcon" class="global-center" />
			</ui-link>
		</div>
		<div class="hash__full">{{ hash }}</div>
	</div>
</template>

<style scoped lang="scss">
	.hash {
		display: flex;
		align-items: center;
		gap: 8px;
		position: relative;
		&__icons {
			display: flex;
			align-items: center;
			gap: 2px;
		}
		&__full {
			width: 100%;
			white-space: nowrap;
			overflow: hidden;
			position: absolute;
			z-index: 1;
			pointer-events: none;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: transparent;
		}
	}
</style>
