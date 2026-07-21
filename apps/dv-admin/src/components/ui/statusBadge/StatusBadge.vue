<script setup lang="ts">
	export type StatusBadgeMode = "warning" | "positive" | "negative" | "neutral";

	withDefaults(
		defineProps<{
			label: string;
			mode?: StatusBadgeMode;
		}>(),
		{
			mode: "neutral"
		}
	);
</script>

<template>
	<span class="status" :class="`status--${mode}`">
		<span class="status__dot" aria-hidden="true" />
		<span class="status__text">{{ label }}</span>
	</span>
</template>

<style scoped lang="scss">
	.status {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		height: 28px;
		padding: 0 12px 0 10px;
		border-radius: 999px;
		box-sizing: border-box;
		font-size: 13px;
		font-weight: 500;
		line-height: 16px;
		letter-spacing: 0.01em;
		width: max-content;
		max-width: 100%;

		&__dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			flex-shrink: 0;
		}

		&__text {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&--warning {
			color: #b86a00;
			background: linear-gradient(180deg, #fff8eb 0%, #fff3e0 100%);
			box-shadow: inset 0 0 0 1px rgba(255, 158, 0, 0.18);

			.status__dot {
				background: #ff9e00;
				box-shadow: 0 0 0 3px rgba(255, 158, 0, 0.16);
			}
		}

		&--positive {
			color: #1a7a3c;
			background: linear-gradient(180deg, #f0fbf4 0%, #e6faed 100%);
			box-shadow: inset 0 0 0 1px rgba(31, 150, 73, 0.16);

			.status__dot {
				background: #26a212;
				box-shadow: 0 0 0 3px rgba(38, 162, 18, 0.14);
			}
		}

		&--negative {
			color: #c0392b;
			background: linear-gradient(180deg, #fff5f4 0%, #ffecea 100%);
			box-shadow: inset 0 0 0 1px rgba(255, 59, 48, 0.14);

			.status__dot {
				background: #ff3b30;
				box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.12);
			}
		}

		&--neutral {
			color: rgba(48, 51, 69, 1);
			background: linear-gradient(180deg, #f8f9fb 0%, #f1f3f7 100%);
			box-shadow: inset 0 0 0 1px rgba(48, 51, 69, 0.1);

			.status__dot {
				background: rgba(107, 109, 128, 1);
				box-shadow: 0 0 0 3px rgba(107, 109, 128, 0.12);
			}
		}
	}
</style>
