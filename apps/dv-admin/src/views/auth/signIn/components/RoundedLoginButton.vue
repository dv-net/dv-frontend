<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit";
	import { computed, ref } from "vue";
	import { useI18n } from "vue-i18n";
	import IconLogout from "@dv-admin/components/icons/IconLogout.vue";
	import IconVerified from "@dv-admin/components/icons/IconVerified.vue";

	const ANIMATION_DURATION_MS = 2000;
	const TRAIL_COUNT = 20;

	const props = withDefaults(
		defineProps<{
			disabled?: boolean;
			defaultText?: string;
			successText?: string;
		}>(),
		{
			disabled: false
		}
	);

	const { t } = useI18n();

	const isAnimating = ref(false);
	const isSuccess = ref(false);
	const isError = ref(false);

	const resolvedDefaultText = computed(() => props.defaultText || t("Login to account"));
	const resolvedSuccessText = computed(() => props.successText || `${t("Success. Redirecting")}...`);

	const isDisabled = computed(() => props.disabled);

	const waitAnimation = () => new Promise<void>((resolve) => setTimeout(resolve, ANIMATION_DURATION_MS));

	const playSuccess = async () => {
		if (isAnimating.value) return;

		isAnimating.value = true;
		isSuccess.value = true;
		isError.value = false;

		await waitAnimation();
	};

	const playError = async () => {
		if (isAnimating.value) return;

		isAnimating.value = true;
		isError.value = true;
		isSuccess.value = false;

		await waitAnimation();

		isAnimating.value = false;
		isError.value = false;
	};

	defineExpose({
		playSuccess,
		playError,
		isAnimating
	});
</script>

<template>
	<UiButton
		class="RoundedLoginButton"
		:class="{
			start: isAnimating,
			success: isSuccess,
			error: isError
		}"
		mode="neutral"
		size="xxl"
		native-type="submit"
		:disabled="isDisabled"
	>
		<div class="iconArea">
			<IconLogout class="roundLoginIcon" />

			<div class="logoWrapper">
				<IconVerified />
			</div>
		</div>

		<div class="trail" aria-hidden="true">
			<span v-for="index in TRAIL_COUNT" :key="index" class="t" :style="{ '--acc': index - 1 }" />
		</div>

		<span class="textContainer" :data-text-default="resolvedDefaultText" :data-text-success="resolvedSuccessText" />
	</UiButton>
</template>

<style scoped lang="scss">
	.RoundedLoginButton {
		--buttonRadius: 8px;
		--animationDuration: 2s;
		--trailDefaultColor: #ffffff;
		--trailAccentColor: var(--trailDefaultColor);

		width: 100%;
		min-width: 0;
		overflow: visible;
		animation-duration: var(--animationDuration);
		animation-timing-function: ease;
		animation-iteration-count: 1;

		:deep(.ui-button__content) {
			position: static;
			align-items: center;
			justify-content: center;
			gap: 8px;
		}

		&.start {
			animation-name: roundedLoginButtonParentAni;
		}

		&.start .trail .t {
			animation-name: roundedLoginButtonTrailAni;
		}

		&.success {
			--trailAccentColor: #02f73b;
		}

		&.success,
		&.success .trail .t {
			animation-fill-mode: forwards;
		}

		&.error {
			--trailAccentColor: red;
			animation-fill-mode: backwards;
		}

		&.error,
		&.error .trail .t {
			animation-fill-mode: backwards;
		}

		.trail {
			--border: 3px;
			--startDistanse: 14.5%;
			--lineOffset: 2%;
			position: absolute;
			inset-inline-start: 50%;
			inset-block-start: 50%;
			width: calc(100% + var(--border));
			height: calc(100% + var(--border));
			translate: -50% -50%;
			z-index: 3;
			pointer-events: none;
			border-radius: var(--buttonRadius);
			padding: var(--border);
			overflow: hidden;
			filter: drop-shadow(0px 2px 10px hsl(from var(--trailColor) h s l / 30%));
		}

		.trail .t {
			position: absolute;
			inset-inline-start: 0;
			inset-block-start: 0;
			width: 50px;
			height: var(--border);
			margin: 0;
			padding: 0;
			border: none;
			line-height: 0;
			background: var(--trailColor);
			offset-path: rect(0 100% 100% 0 round var(--buttonRadius));
			offset-anchor: 50% 0%;
			animation-duration: var(--animationDuration);
			animation-timing-function: ease-in-out;
			animation-iteration-count: 1;
			animation-fill-mode: forwards;
			animation-delay: calc(var(--acc) * 0.01s);
			animation-composition: accumulate;
			offset-distance: calc(var(--lineOffset) + var(--startDistanse) + var(--distance));
			border-radius: 4px;
			clip-path: polygon(var(--clipStart) 0%, var(--clipEnd) 0, var(--clipEnd) 100%, var(--clipStart) 100%);
			transform-origin: 0% 50%;
		}

		.iconArea {
			width: 24px;
			flex-shrink: 0;
			display: grid;
			grid-template-columns: minmax(0, 1fr);
			align-items: center;
			justify-content: center;
			justify-items: flex-end;
		}

		.logoWrapper {
			grid-area: 1 / 1;
			width: 18px;
			height: 18px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--trailColor);

			:deep(svg) {
				display: block;
				width: 18px;
				height: 18px;
				max-width: 100%;
				max-height: 100%;
				stroke-width: 1px;
				stroke-dasharray: 500;
				stroke-dashoffset: var(--logoOffset);
				stroke: hsl(from var(--trailColor) h s l / var(--logoStrokeOpacity));
				fill: hsl(from var(--trailColor) h s l / var(--logoFillOpacity));
				overflow: visible;
			}

			:deep(svg *) {
				fill: inherit;
			}

			:deep(svg [stroke]) {
				stroke: var(--trailColor);
			}
		}

		.roundLoginIcon {
			grid-area: 1 / 1;
			width: 19px;
			flex-shrink: 0;
			transition: none;
			transform-origin: 0% 0%;
			rotate: var(--iconRotate);
			opacity: var(--iconOpacity);
		}

		.textContainer {
			--clipTextPercent: calc(var(--clipTextVal) * 1%);
			position: relative;
			z-index: 1;
			white-space: nowrap;
			display: grid;

			&::before,
			&::after {
				content: "";
				grid-area: 1 / 1;
				padding-block: 0.25ex;
			}

			&::before {
				content: attr(data-text-default);
			}
		}

		&.success .textContainer {
			&::after {
				content: attr(data-text-success);
				max-width: calc(2px * var(--clipTextVal));
				overflow: hidden;
			}

			&::before {
				clip-path: polygon(var(--clipTextPercent) 0, 100% 0, 100% 100%, var(--clipTextPercent) 100%);
			}
		}
	}

	@keyframes roundedLoginButtonParentAni {
		20% {
			--trailColor: var(--trailDefaultColor);
		}

		30%,
		to {
			--trailColor: var(--trailAccentColor);
		}

		from,
		30% {
			--iconRotate: 0deg;
			--iconOpacity: 1;
		}

		50%,
		to {
			--iconRotate: -85deg;
			--iconOpacity: 0;
		}

		from,
		40% {
			--logoStrokeOpacity: 100%;
			--logoFillOpacity: 0%;
			--logoOffset: 500;
		}

		90%,
		to {
			--logoStrokeOpacity: 0%;
			--logoFillOpacity: 100%;
			--logoOffset: 0;
		}

		60% {
			--clipTextVal: 0;
		}

		70%,
		to {
			--clipTextVal: 100;
		}
	}

	@keyframes roundedLoginButtonTrailAni {
		from {
			--clipStart: 100%;
			--clipEnd: 100%;
		}

		from,
		5% {
			--distance: 0%;
		}

		10%,
		30% {
			--clipStart: 100%;
			--clipEnd: 0%;
		}

		35%,
		to {
			transform-origin: 100% 50%;
			--distance: -95%;
			--clipStart: 0%;
			--clipEnd: 0%;
		}
	}
</style>

<style lang="scss">
	@property --iconRotate {
		syntax: "<angle>";
		initial-value: 0deg;
		inherits: true;
	}

	@property --iconOpacity {
		syntax: "<number>";
		initial-value: 1;
		inherits: true;
	}

	@property --logoStrokeOpacity {
		syntax: "<percentage>";
		initial-value: 0%;
		inherits: true;
	}

	@property --logoFillOpacity {
		syntax: "<percentage>";
		initial-value: 0%;
		inherits: true;
	}

	@property --logoOffset {
		syntax: "<number>";
		initial-value: 500;
		inherits: true;
	}

	@property --clipTextVal {
		syntax: "<number>";
		initial-value: 0;
		inherits: true;
	}

	@property --clipStart {
		syntax: "<percentage>";
		initial-value: 0%;
		inherits: true;
	}

	@property --clipEnd {
		syntax: "<percentage>";
		initial-value: 0%;
		inherits: true;
	}

	@property --distance {
		syntax: "<percentage>";
		initial-value: 0%;
		inherits: true;
	}

	@property --trailColor {
		syntax: "<color>";
		initial-value: #fff;
		inherits: true;
	}
</style>
