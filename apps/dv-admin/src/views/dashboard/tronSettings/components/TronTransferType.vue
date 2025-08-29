<script setup lang="ts">
	import { UiButton, UiIcon } from "@dv.net/ui-kit";
	import IconDelegate from "@dv-admin/components/icons/dashboard/tronSettings/IconDelegate.vue";
	import ImgBoardGraphics from "@dv-admin/components/icons/dashboard/tronSettings/ImgBoardGraphics.png";
	import type { ITronTransferTypeList } from "@dv-admin/utils/types/schemas";
	import { computed } from "vue";

	const props = defineProps<{ data: ITronTransferTypeList; selectedType: boolean }>();
	const emits = defineEmits(["update:type"]);

	const isResources = computed<boolean>(() => props.data.id === "resources");
</script>

<template>
	<div :class="['row', { selected: selectedType }]">
		<div class="row__left">
			<span class="row__left-title">{{ data.title }}</span>
			<div>
				<ui-button v-if="selectedType" type="outline" outline-type-color="#1f9649">
					{{ $t("Active") }}
				</ui-button>
				<ui-button v-else type="secondary" @click="emits('update:type', data.id)">
					{{ $t("Activate") }}
				</ui-button>
			</div>
			<div class="row__left-description" :style="{ color: data.iconColor }">
				<icon-delegate v-if="isResources" />
				<ui-icon v-else type="400" :name="data.iconNameSubtitle" size="xl" />
				<span>{{ $t(data.subtitle) }}</span>
			</div>
		</div>
		<div :class="['row__description', { resources: isResources }]">
			<img v-if="isResources" class="board-img" :src="ImgBoardGraphics" alt=" " />
			<p class="row__description-text">{{ $t(data.description) }}</p>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.row {
		display: flex;
		overflow: hidden;
		border: 1px solid $grey;
		width: 100%;
		min-height: 240px;
		border-radius: 16px;
		transition: border-color 0.3s ease;
		&.selected {
			border: 1px solid #1968e5;
			.ui-button {
				cursor: not-allowed;
			}
		}
		&__left {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			background: $blue-opacity;
			border-right: 1px solid $grey;
			min-width: 248px;
			max-width: 248px;
			padding: 24px;
			&-title {
				font-size: 20px;
				font-weight: 500;
				line-height: 24px;
			}
			&-description {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 16px;
				font-weight: 600;
				line-height: 24px;
			}
		}
		&__description {
			display: flex;
			flex-direction: column;
			justify-content: center;
			text-align: left;
			padding: 24px;
			&-text {
				color: #6b6d80;
				font-size: 16px;
				font-weight: 400;
				line-height: 20px;
			}
			&.resources {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 16px;
				text-align: center;
			}
			.board-img {
				height: 134px;
			}
		}
	}
</style>
