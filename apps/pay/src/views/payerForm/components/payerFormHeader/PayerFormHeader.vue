<script setup lang="ts">
	import { usePayerFormStore } from "@pay/stores/payerForm";
	import { storeToRefs } from "pinia";
	import { ref, watch, nextTick, computed } from "vue";

	const { timeline: timelineStore, currentStep, stepMap } = storeToRefs(usePayerFormStore());

	const timeline = computed(() => {
		return timelineStore.value.map((item) => {
			if (currentStep.value === 4 && item.id === 3) {
				return { ...item, label: "Waiting for enrollment" };
			}
			return item;
		});
	});

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
				class="timeline__block"
				:class="{ 'opacity-item': !item.isActive }"
			>
				<div
					:ref="(el) => (itemRefs[index] = el as HTMLDivElement | null)"
					class="timeline__item"
					:class="{ 
						success: currentStep === 5 && timeline.length - 1 === index,
						waiting: currentStep === 4 && item.id === 3
					}"
					@click="item.callback && item.callback()"
				>
					<span class="timeline__item-label">{{ item.id }}</span>
					<span class="timeline__item-text">{{ $t(item.label) }}</span>
				</div>
				<div v-if="index < timeline.length - 1" class="timeline__line"></div>
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
			padding: 16px 20px;
		}
		@include mediamax(768) {
			overflow-x: auto;
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
			@include mediamax(768) {
				width: 720px;
				min-width: 720px;
			}
		}
		&__block {
			display: flex;
			align-items: center;
			flex-grow: 1;
			cursor: pointer;
			&:last-child {
				flex-grow: unset;
			}
			&.opacity-item {
				opacity: 0.2;
				cursor: not-allowed;
				pointer-events: none;
			}
		}
		&__line {
			margin: 0 16px;
			width: 100%;
			height: 1px;
			background-color: $label-header-form-background;
			@include mediamax(1024) {
				margin: 0 12px;
			}
			@include mediamax(768) {
				margin: 0 8px;
			}
		}
		&__item {
			display: flex;
			align-items: center;
			gap: 12px;
			flex-shrink: 0;
			@include mediamax(768) {
				gap: 8px;
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
				@include mediamax(1024) {
					font-size: 12px;
					width: 20px;
					height: 20px;
				}
			}
			&-text {
				font-size: 16px;
				@include mediamax(1024) {
					font-size: 14px;
				}
			}
			&.success {
				color: #1f9649;
				.timeline__item-label {
					background-color: #1f9649;
					color: #fff;
				}
			}
			&.waiting {
				color: #1968E5;
				.timeline__item-label {
					background-color: #1968E5;
					color: #fff;
				}
			}
		}
	}
</style>
