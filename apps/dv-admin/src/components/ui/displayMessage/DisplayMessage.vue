<script setup lang="ts">
	import { onUnmounted, ref, watch } from "vue";
	import type { IProps } from "@dv-admin/components/ui/displayMessage/types";
	import { UiIcon } from "@dv.net/ui-kit";

	const props = withDefaults(defineProps<IProps>(), {
		timeout: 3000,
		typeMessage: "success",
		isShowIcon: true
	});
	const text = defineModel<string>("text", { required: true });
	const timer = ref<ReturnType<typeof setTimeout> | null>(null);
	const visible = ref<boolean>(true);

	const resetDataComponent = () => {
		visible.value = false;
		text.value = "";
		if (timer.value) clearTimeout(timer.value);
	};

	watch(text, (value) => {
		if (!value) return;
		if (timer.value) clearTimeout(timer.value);
		visible.value = true;
		timer.value = setTimeout(() => {
			visible.value = false;
			text.value = "";
		}, props.timeout);
	});

	onUnmounted(() => {
		resetDataComponent();
	});
</script>

<template>
	<div v-if="text && visible" class="message">
		<ui-icon v-if="isShowIcon" name="check-circle" type="400" size="sm" color="#1F9649" />
		<span class="message__text" :class="[{ success: typeMessage === 'success' }, { error: typeMessage === 'error' }]">
			{{ $t(text) }}
		</span>
	</div>
</template>

<style scoped lang="scss">
	.message {
		display: flex;
		align-items: center;
		gap: 4px;
		&__text {
			font-size: 16px;
			font-weight: 500;
			&.success {
				color: $grey-opacity;
			}
			&.error {
				color: #dd4c1e;
			}
		}
	}
</style>
