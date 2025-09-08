<script setup lang="ts">
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";

	const { timeline, currentStep } = storeToRefs(usePayerFormStore());
</script>

<template>
	<div class="timeline">
		<div class="timeline__inner">
			<div
				v-for="(item, index) in timeline"
				:key="item.id"
				class="timeline__item"
				:class="[{ 'opacity-item': !item.isActive }, { success: currentStep === 5 && timeline.length - 1 === index }]"
			>
				<span class="timeline__item-label">{{ item.id }}</span>
				<span class="timeline__item-text">{{ $t(item.label) }}</span>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.timeline {
		display: flex;
		background-color: $form-background;
		padding: 20px 24px;
		border-radius: 16px;
		width: 100%;
		@include mediamax(1024) {
			overflow-x: auto;
			overflow-y: hidden;
			width: calc(100vw - #{$padding-main * 3}px);
			@supports (width: 100dvw) {
				width: calc(100dvw - #{$padding-main * 3}px);
			}
		}
		@include mediamax(768) {
			padding: 16px 24px;
		}
		@include mediamax(480) {
			width: calc(100vw - #{$padding-main * 2}px);
			@supports (width: 100dvw) {
				width: calc(100dvw - #{$padding-main * 2}px);
			}
		}
		&__inner {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			@include mediamax(1024) {
				width: 1024px;
				min-width: 1024px;
			}
			@include mediamax(768) {
				display: flex;
				align-items: center;
				justify-content: unset;
				gap: 40px;
				width: 100%;
				min-width: unset;
			}
		}
		&__item {
			display: flex;
			align-items: center;
			gap: 12px;
			flex-shrink: 0;
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
				@include mediamax(768) {
					font-size: 12px;
					width: 20px;
					height: 20px;
				}
			}
			&-text {
				font-size: 16px;
				@include mediamax(768) {
					font-size: 14px;
				}
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
