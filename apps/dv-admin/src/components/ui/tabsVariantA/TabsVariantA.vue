<script setup lang="ts" generic="T extends string">
	import type { TabsVariantAItem } from "@dv-admin/components/ui/tabsVariantA/types";
	import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

	const { items } = defineProps<{
		items: TabsVariantAItem<T>[];
	}>();

	const activeTab = defineModel<T>({ required: true });

	const tabsRef = ref<HTMLElement | null>(null);
	const tabRefs = ref<HTMLElement[]>([]);
	const activePillStyle = ref<Record<string, string>>({ opacity: "0" });
	const resizeObserver = ref<ResizeObserver | null>(null);

	const isIconSrc = (icon: TabsVariantAItem["icon"]): icon is string => typeof icon === "string";

	const setTabRef = (el: unknown, index: number): void => {
		if (!el) return;

		const element = el instanceof Element ? el : (el as { $el?: Element }).$el;

		if (!element) return;

		tabRefs.value[index] = element as HTMLElement;
		resizeObserver.value?.observe(tabRefs.value[index]);
	};

	const updateActivePill = (): void => {
		const activeIndex = items.findIndex((item) => item.value === activeTab.value);
		const activeElement = activeIndex >= 0 ? tabRefs.value[activeIndex] : undefined;

		if (!activeElement) {
			activePillStyle.value = { opacity: "0" };
			return;
		}

		activePillStyle.value = {
			opacity: "1",
			width: `${activeElement.offsetWidth}px`,
			transform: `translateX(${activeElement.offsetLeft}px)`
		};
	};

	const syncActivePill = (): void => {
		void nextTick(() => {
			updateActivePill();
		});
	};

	const selectTab = (item: TabsVariantAItem<T>): void => {
		if (item.disabled) return;
		activeTab.value = item.value;
	};

	watch(activeTab, syncActivePill);
	watch(() => items, syncActivePill, { deep: true });
	watch(tabRefs, syncActivePill, { deep: true });

	onMounted(() => {
		resizeObserver.value = new ResizeObserver(() => {
			syncActivePill();
		});

		if (tabsRef.value) {
			resizeObserver.value.observe(tabsRef.value);
		}

		window.addEventListener("resize", syncActivePill);
		syncActivePill();
	});

	onBeforeUnmount(() => {
		resizeObserver.value?.disconnect();
		window.removeEventListener("resize", syncActivePill);
	});
</script>

<template>
	<nav v-if="items.length" ref="tabsRef" class="tabs-variant-a">
		<span class="tabs-variant-a__pill" :style="activePillStyle" aria-hidden="true" />

		<button
			v-for="(item, index) in items"
			:key="item.value"
			:ref="(el) => setTabRef(el, index)"
			type="button"
			class="tabs-variant-a__item"
			:class="{
				'tabs-variant-a__item--active': activeTab === item.value,
				'tabs-variant-a__item--disabled': item.disabled
			}"
			:disabled="item.disabled"
			:aria-disabled="item.disabled || undefined"
			@click="selectTab(item)"
		>
			<span v-if="item.icon" class="tabs-variant-a__icon" aria-hidden="true">
				<img v-if="isIconSrc(item.icon)" class="tabs-variant-a__icon-image" :src="item.icon" alt="" />
				<component :is="item.icon" v-else v-bind="item.iconProps" />
			</span>

			<span class="tabs-variant-a__label">{{ item.name }}</span>
		</button>
	</nav>
</template>

<style scoped lang="scss">
	.tabs-variant-a {
		display: inline-flex;
		align-items: center;
		gap: 0;
		width: fit-content;
		max-width: 100%;
		min-height: 44px;
		padding: 4px;
		border-radius: 999px;
		background: $blue-opacity;
		overflow-x: auto;
		position: relative;

		&__pill {
			position: absolute;
			top: 4px;
			left: 0;
			height: calc(100% - 8px);
			border-radius: 999px;
			background: $white;
			box-shadow:
				0 0 30px rgba(0, 0, 0, 0.06),
				0 0 8px rgba(0, 0, 0, 0.03);
			transition:
				transform 0.28s ease,
				width 0.28s ease,
				opacity 0.2s ease;
			pointer-events: none;
		}

		&__item {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			flex-shrink: 0;
			padding: 8px 20px;
			border: 0;
			border-radius: 999px;
			background: transparent;
			cursor: pointer;
			color: $secondary;
			position: relative;
			z-index: 1;
			transition: color 0.2s ease;

			&:hover {
				color: $black;
			}

			&--active {
				color: $black;

				.tabs-variant-a__icon {
					color: $blue;
				}

				.tabs-variant-a__icon-image {
					opacity: 1;
					filter: none;
				}
			}

			&--disabled {
				cursor: not-allowed;
				opacity: 0.45;
				color: $secondary;

				&:hover {
					color: $secondary;
				}
			}
		}

		&__icon {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			width: 16px;
			height: 16px;
			color: inherit;
		}

		&__icon-image {
			width: 16px;
			height: 16px;
			opacity: 0.85;
			filter: grayscale(1) brightness(0.55);
			transition:
				opacity 0.2s ease,
				filter 0.2s ease;
		}

		&__label {
			font-size: 14px;
			line-height: 20px;
			font-weight: 400;
			white-space: nowrap;
		}
	}
</style>
