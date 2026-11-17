<script setup lang="ts">
	import { useTemplateRef } from "vue";

	const { step } = defineProps<{ step: number | string }>();

	const EASING_OUT = "cubic-bezier(0.4, 0, 1, 1)";
	const EASING_IN = "cubic-bezier(0.22, 1, 0.36, 1)";

	const viewportRef = useTemplateRef<HTMLDivElement>("viewport");

	let leftHeight = 0;
	let heightAnimation: Animation | null = null;

	const isReducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	const releaseViewport = () => {
		viewportRef.value?.style.removeProperty("height");
	};

	const onLeave = (element: Element, done: () => void) => {
		const el = element as HTMLElement;
		const viewport = viewportRef.value;
		heightAnimation?.cancel();
		if (isReducedMotion() || !viewport) return done();
		leftHeight = viewport.offsetHeight;
		viewport.style.height = `${leftHeight}px`;
		el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: EASING_OUT, fill: "forwards" })
			.finished.then(done)
			.catch(done);
	};

	const onEnter = (element: Element, done: () => void) => {
		const el = element as HTMLElement;
		const viewport = viewportRef.value;
		if (isReducedMotion() || !viewport || !leftHeight) {
			leftHeight = 0;
			releaseViewport();
			return done();
		}
		const targetHeight = el.offsetHeight;
		heightAnimation = viewport.animate([{ height: `${leftHeight}px` }, { height: `${targetHeight}px` }], {
			duration: 300,
			easing: EASING_IN
		});
		const contentAnimation = el.animate(
			[
				{ opacity: 0, transform: "translateY(8px)" },
				{ opacity: 1, transform: "none" }
			],
			{ duration: 300, easing: EASING_IN }
		);
		releaseViewport();
		leftHeight = 0;
		Promise.all([heightAnimation.finished, contentAnimation.finished])
			.then(() => {
				heightAnimation = null;
				done();
			})
			.catch(done);
	};
</script>

<template>
	<div ref="viewport">
		<transition :css="false" mode="out-in" @leave="onLeave" @enter="onEnter">
			<div :key="step">
				<slot />
			</div>
		</transition>
	</div>
</template>
