<script setup lang="ts">
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";

	const { timeline, currentStep } = storeToRefs(usePayerFormStore());
</script>

<template>
	<div class="timeline">
		<div
			v-for="(item, index) in timeline"
			:key="item.id"
			class="timeline__item"
			:class="[{ 'opacity-item': !item.isActive }, { success: currentStep === 5 && timeline.length - 1 === index }]"
		>
			<span class="timeline__item-label">{{ item.id }}</span>
			<span>{{ $t(item.label) }}</span>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.timeline {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: $form-background;
		padding: 20px 24px;
		border-radius: 16px;
		width: 100%;
		&__item {
			display: flex;
			align-items: center;
			gap: 12px;
			&-label {
				border-radius: 100%;
				background-color: $label-header-form-background;
				color: $text-header-form-background;
				@extend .center;
				width: 24px;
				height: 24px;
				flex-shrink: 0;
				font-size: 14px;
				font-weight: 500;
			}
			&.opacity-item {
				opacity: 0.2;
				cursor: not-allowed;
			}
			&.success {
				color: #1f9649;
				.timeline__item-label {
					background-color: #1f9649;
					color: #fff;
				}
			}
		}
	}
</style>
