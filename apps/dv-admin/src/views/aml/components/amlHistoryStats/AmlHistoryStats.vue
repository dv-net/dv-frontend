<script setup lang="ts">
	import { computed, type Component } from "vue";
	import { useI18n } from "vue-i18n";
	import IconChecksRemaining from "@dv-admin/components/icons/aml/IconChecksRemaining.vue";
	import IconAmlBalance from "@dv-admin/components/icons/aml/IconAmlBalance.vue";
	import IconCheckedToday from "@dv-admin/components/icons/aml/IconCheckedToday.vue";
	import IconSuccessful from "@dv-admin/components/icons/aml/IconSuccessful.vue";
	import IconFailed from "@dv-admin/components/icons/aml/IconFailed.vue";
	import IconFundsRemaining from "@dv-admin/components/icons/aml/IconFundsRemaining.vue";

	const props = withDefaults(
		defineProps<{
			checksRemaining?: string | number | null;
			amlBalance?: string | number | null;
			checkedToday?: string | number | null;
			successful?: string | number | null;
			failed?: string | number | null;
			fundsRemaining?: string | number | null;
		}>(),
		{
			checksRemaining: null,
			amlBalance: null,
			checkedToday: null,
			successful: null,
			failed: null,
			fundsRemaining: null
		}
	);

	const { t } = useI18n();

	const formatValue = (value: string | number | null | undefined) => {
		if (value === null || value === undefined || value === "") return "—";
		return value;
	};

	const items = computed<
		{
			key: string;
			value: string | number;
			label: string;
			icon: Component;
			tone: string;
		}[]
	>(() => [
		{
			key: "checksRemaining",
			value: formatValue(props.checksRemaining),
			label: t("Checks remaining"),
			icon: IconChecksRemaining,
			tone: "blue"
		},
		{
			key: "amlBalance",
			value: formatValue(props.amlBalance),
			label: t("AML balance"),
			icon: IconAmlBalance,
			tone: "green"
		},
		{
			key: "checkedToday",
			value: formatValue(props.checkedToday),
			label: t("Checked today"),
			icon: IconCheckedToday,
			tone: "purple"
		},
		{
			key: "successful",
			value: formatValue(props.successful),
			label: t("Successful"),
			icon: IconSuccessful,
			tone: "success"
		},
		{
			key: "failed",
			value: formatValue(props.failed),
			label: t("Failed"),
			icon: IconFailed,
			tone: "danger"
		},
		{
			key: "fundsRemaining",
			value: formatValue(props.fundsRemaining),
			label: t("Funds remaining"),
			icon: IconFundsRemaining,
			tone: "orange"
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
		justify-content: space-between;
		gap: 16px;
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
			min-width: 0;
		}

		&__icon {
			@extend .center;
			flex-shrink: 0;
			width: 40px;
			height: 40px;
			border-radius: 10px;

			&--blue {
				background-color: #eef6fe;
			}

			&--green {
				background-color: #e8fcf4;
			}

			&--purple {
				background-color: #f5effc;
			}

			&--success {
				background-color: #ecfbe7;
			}

			&--danger {
				background-color: #fdeceb;
			}

			&--orange {
				background-color: #fef2e6;
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
