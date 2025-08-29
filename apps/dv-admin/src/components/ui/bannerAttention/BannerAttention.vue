<script setup lang="ts">
	import { ref } from "vue";
	import { UiIcon } from "@dv.net/ui-kit";

	defineProps<{ text: string; isShowBanner: boolean }>();

	const isShowMessage = ref<boolean>(true);
</script>

<template>
	<div v-if="text && isShowMessage && isShowBanner" class="text">
		<span class="text__icon" @click="isShowMessage = false">
			<ui-icon name="close" type="400" />
		</span>
		<p>{{ text }}</p>
	</div>
</template>

<style scoped lang="scss">
	.text {
		background-color: #fee7eb;
		padding: 16px;
		color: #ed0a34;
		border-radius: 12px;
		display: flex;
		align-items: center;
		gap: 12px;
		&__icon {
			cursor: pointer;
			width: 24px;
			height: 24px;
			border-radius: 50%;
			border: 1px solid #ed0a34;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
