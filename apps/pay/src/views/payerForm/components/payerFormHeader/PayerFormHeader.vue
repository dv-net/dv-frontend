<script setup lang="ts">
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { ref, watch, nextTick } from "vue";

	const { timeline, currentStep, stepMap } = storeToRefs(usePayerFormStore());

	const timelineRef = ref<HTMLDivElement | null>(null);
	const itemRefs = ref<(HTMLDivElement | null)[]>([]);

	const scrollToCurrentStep = () => {
		nextTick(() => {
			const step = stepMap.value[currentStep.value] || currentStep.value;
			const currentItem = itemRefs.value[step - 1];
			const parent = timelineRef.value;
			if (currentItem && parent) {
				const parentRect = parent.getBoundingClientRect();
				const itemRect = currentItem.getBoundingClientRect();
				const offset = itemRect.left - parentRect.left - parent.clientWidth / 2 + itemRect.width / 2;
				parent.scrollTo({
					left: parent.scrollLeft + offset,
					behavior: "smooth"
				});
			}
		});
	};

	watch(currentStep, () => {
		scrollToCurrentStep();
	});
</script>

<template>
	<div class="timeline" ref="timelineRef">
		<div class="timeline__inner">
			<div
				v-for="(item, index) in timeline"
				:key="item.id"
				:ref="(el) => (itemRefs[index] = el as HTMLDivElement | null)"
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
			padding: 16px 20px;
			overflow-y: hidden;
			scrollbar-width: none;
			-ms-overflow-style: none;
			&::-webkit-scrollbar {
				display: none;
			}
			width: calc(100vw - #{$padding-main * 2}px);
			@supports (width: 100dvw) {
				width: calc(100dvw - #{$padding-main * 2}px);
			}
		}
		@include mediamax(480) {
			padding: 12px 16px;
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
			&:last-child {
				@include mediamax(768) {
					padding-right: 20px;
				}
				@include mediamax(480) {
					padding-right: 16px;
				}
			}
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
