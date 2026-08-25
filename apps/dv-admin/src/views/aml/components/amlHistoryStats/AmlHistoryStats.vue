<script setup lang="ts">
	import { computed, type Component } from "vue";
	import { useI18n } from "vue-i18n";
	import IconCheckedToday from "@dv-admin/components/icons/aml/IconCheckedToday.vue";
	import IconSuccessful from "@dv-admin/components/icons/aml/IconSuccessful.vue";
	import IconFailed from "@dv-admin/components/icons/aml/IconFailed.vue";

	const {
		checkedToday = null,
		successful = null,
		failed = null
	} = defineProps<{
		checkedToday?: string | number | null;
		successful?: string | number | null;
		failed?: string | number | null;
	}>();

	const { t } = useI18n();

	const items = computed<
		{
			key: string;
			value: string | number | null;
			label: string;
			icon: Component;
			tone: string;
		}[]
	>(() => [
		{
			key: "checkedToday",
			value: checkedToday,
			label: t("Checked today"),
			icon: IconCheckedToday,
			tone: "purple"
		},
		{
			key: "successful",
			value: successful,
			label: t("Successful"),
			icon: IconSuccessful,
			tone: "success"
		},
		{
			key: "failed",
			value: failed,
			label: t("Failed"),
			icon: IconFailed,
			tone: "danger"
		}
	]);
</script>

<template>
	<section class="aml-history-stats">
		<template v-for="(item, index) in items" :key="item.key">
			<div class="aml-history-stats__item">
				<span class="aml-history-stats__icon" :class="`aml-history-stats__icon--${item.tone}`">
					<component :is="item.icon" />
				</span>
				<div class="aml-history-stats__content">
					<p class="aml-history-stats__value">{{ item.value }}</p>
					<p class="aml-history-stats__label">{{ item.label }}</p>
				</div>
			</div>
			<span v-if="index < items.length - 1" class="aml-history-stats__divider" aria-hidden="true" />
		</template>
	</section>
</template>

<style scoped lang="scss">
	.aml-history-stats {
		display: flex;
		align-items: center;
		gap: 24px;
		width: 100%;
		padding: 24px 20px;
		border: 1px solid $grey;
		border-radius: 16px;
		background-color: $white;
		box-sizing: border-box;

		&__item {
			display: flex;
			align-items: center;
			gap: 8px;
			flex: 1;
			min-width: 0;
		}

		&__icon {
			@extend .center;
			flex-shrink: 0;
			width: 40px;
			height: 40px;
			border-radius: 10px;

			&--purple {
				background-color: #f5effc;
			}

			&--success {
				background-color: #ecfbe7;
			}

			&--danger {
				background-color: #fdeceb;
			}
		}

		&__content {
			display: flex;
			flex-direction: column;
			min-width: 0;
		}

		&__value {
			margin: 0;
			color: $black;
			font-size: 16px;
			font-weight: 700;
			line-height: 20px;
			white-space: nowrap;
		}

		&__label {
			margin: 0;
			color: $grey-opacity;
			font-size: 12px;
			font-weight: 400;
			line-height: 16px;
			white-space: nowrap;
		}

		&__divider {
			flex-shrink: 0;
			width: 1px;
			height: 40px;
			background-color: $grey;
		}
	}
</style>
