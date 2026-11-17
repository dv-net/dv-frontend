<script setup lang="ts">
	const EASING_SIZE = "cubic-bezier(0.4, 0, 0.2, 1)";
	const EASING_FADE = "cubic-bezier(0.33, 1, 0.68, 1)";
	const EASING_IN_OUT = "cubic-bezier(0.4, 0, 0.2, 1)";

	const runningAnimations = new WeakMap<Element, Animation[]>();

	const isReducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/** Negative margin cancels the parent's flex/grid gap so neighbours do not jump when the block is collapsed */
	const getCollapsedFrame = (el: HTMLElement): Keyframe => {
		const gap = el.parentElement ? getComputedStyle(el.parentElement).rowGap : "normal";
		return {
			height: "0px",
			paddingTop: "0px",
			paddingBottom: "0px",
			marginTop: gap === "normal" || gap === "0px" ? "0px" : `-${gap}`
		};
	};

	const getExpandedFrame = (el: HTMLElement): Keyframe => {
		const styles = getComputedStyle(el);
		return {
			height: `${el.offsetHeight}px`,
			paddingTop: styles.paddingTop,
			paddingBottom: styles.paddingBottom,
			marginTop: styles.marginTop
		};
	};

	const resetInlineStyles = (el: HTMLElement) => {
		el.style.removeProperty("overflow");
		el.style.removeProperty("box-sizing");
	};

	const play = (el: HTMLElement, animations: Animation[], done: () => void) => {
		runningAnimations.set(el, animations);
		Promise.all(animations.map((animation) => animation.finished))
			.then(() => {
				resetInlineStyles(el);
				done();
			})
			.catch(() => {
				if (runningAnimations.get(el) === animations) resetInlineStyles(el);
			});
	};

	const prepare = (el: HTMLElement) => {
		runningAnimations.get(el)?.forEach((animation) => animation.cancel());
		el.style.overflow = "hidden";
		el.style.boxSizing = "border-box";
	};

	const onEnter = (element: Element, done: () => void) => {
		const el = element as HTMLElement;
		if (isReducedMotion()) return done();
		prepare(el);
		const collapsed = getCollapsedFrame(el);
		const expanded = getExpandedFrame(el);
		play(
			el,
			[
				el.animate([collapsed, expanded], { duration: 700, easing: EASING_SIZE }),
				el.animate(
					[
						{ opacity: 0, transform: "translateY(12px)" },
						{ opacity: 1, transform: "none" }
					],
					{ duration: 620, delay: 140, easing: EASING_FADE, fill: "backwards" }
				)
			],
			done
		);
	};

	const onLeave = (element: Element, done: () => void) => {
		const el = element as HTMLElement;
		if (isReducedMotion()) return done();
		const expanded = getExpandedFrame(el);
		prepare(el);
		const collapsed = getCollapsedFrame(el);
		play(
			el,
			[
				el.animate(
					[
						{ opacity: 1, transform: "none" },
						{ opacity: 0, transform: "translateY(-4px)" }
					],
					{ duration: 280, easing: EASING_IN_OUT, fill: "forwards" }
				),
				el.animate([expanded, collapsed], { duration: 520, delay: 80, easing: EASING_IN_OUT, fill: "forwards" })
			],
			done
		);
	};
</script>

<template>
	<transition :css="false" @enter="onEnter" @leave="onLeave">
		<slot />
	</transition>
</template>
