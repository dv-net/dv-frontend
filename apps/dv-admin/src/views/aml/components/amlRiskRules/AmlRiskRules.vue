<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { storeToRefs } from "pinia";
	import { UiCheckbox, UiInput, UiSelect, UiSkeleton } from "@dv.net/ui-kit";
	import { useAmlStore } from "@dv-admin/stores/aml";
	import { AML_RISK_ACTION_REJECT, AML_RISK_TYPE_LABELS } from "@dv-admin/utils/constants/aml";
	import type { IAmlRiskRuleResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general.ts";
	import { useI18n } from "vue-i18n";

	const { t } = useI18n();
	const props = withDefaults(
		defineProps<{
			isLoading?: boolean;
		}>(),
		{
			isLoading: false
		}
	);

	const amlStore = useAmlStore();
	const { formAmlScoreTransaction, amlRiskRules, amlSignalCategories, isLoadingAmlRiskRules } =
		storeToRefs(amlStore);
	const { getAmlRiskRules, putAmlRiskRules } = amlStore;

	const localRules = ref<IAmlRiskRuleResponse[]>([]);
	const actionValue = ref(AML_RISK_ACTION_REJECT);

	const showSkeleton = computed(() => props.isLoading || isLoadingAmlRiskRules.value);

	const actionOptions = computed<IUiSelectOptions[]>(() => [
		{ label: t("Do not accept payment"), value: AML_RISK_ACTION_REJECT }
	]);

	const signalLabelByCategory = computed(() => {
		return Object.fromEntries(amlSignalCategories.value.map((item) => [item.category, item.label]));
	});

	const getRiskLabel = (riskType: string): string => {
		if (riskType in AML_RISK_TYPE_LABELS) {
			return t(AML_RISK_TYPE_LABELS[riskType]);
		}
		return signalLabelByCategory.value[riskType] || riskType;
	};

	const syncLocalRules = () => {
		const next = amlRiskRules.value;
		const canUpdateInPlace =
			localRules.value.length === next.length &&
			localRules.value.every((rule, index) => rule.risk_type === next[index]?.risk_type);

		if (canUpdateInPlace) {
			next.forEach((rule, index) => {
				localRules.value[index].enabled = rule.enabled;
				localRules.value[index].threshold = Number(rule.threshold);
				localRules.value[index].action = rule.action;
			});
			return;
		}

		localRules.value = next.map((rule) => ({
			...rule,
			threshold: Number(rule.threshold)
		}));
	};

	const saveRule = async (rule: IAmlRiskRuleResponse) => {
		const slug = formAmlScoreTransaction.value.provider_slug;
		if (!slug) return;
		try {
			await putAmlRiskRules(slug, [
				{
					risk_type: rule.risk_type,
					enabled: rule.enabled,
					threshold: Number(rule.threshold),
					action: AML_RISK_ACTION_REJECT
				}
			]);
		} catch (error) {
			console.error(error);
			syncLocalRules();
		}
	};

	const handleToggleEnabled = async (rule: IAmlRiskRuleResponse, enabled: boolean) => {
		rule.enabled = enabled;
		await saveRule(rule);
	};

	const handleThresholdChange = async (rule: IAmlRiskRuleResponse) => {
		const threshold = Number(rule.threshold);
		if (Number.isNaN(threshold) || threshold < 0 || threshold > 100) {
			syncLocalRules();
			return;
		}
		rule.threshold = threshold;
		await saveRule(rule);
	};

	watch(
		amlRiskRules,
		() => {
			syncLocalRules();
		},
		{ immediate: true, deep: true }
	);

	watch(
		() => formAmlScoreTransaction.value.provider_slug,
		async (slug) => {
			if (!slug) return;
			await getAmlRiskRules(slug);
		},
		{ immediate: true }
	);
</script>

<template>
	<section class="risk-rules">
		<div class="risk-rules__intro">
			<h2 class="global-title-h3">{{ $t("Behavior model") }}</h2>
			<p class="risk-rules__subtitle">
				{{ $t("Configure thresholds and actions for individual risk types") }}
			</p>
		</div>

		<div class="risk-rules__card">
			<ui-skeleton v-if="showSkeleton" :rows="5" :row-height="44" :rows-gap="16" :item-border-radius="12" />

			<div v-else class="risk-rules__content">
				<div class="risk-rules__head">
					<span class="risk-rules__head-cell">{{ $t("Risk") }}</span>
					<span class="risk-rules__head-cell">{{ $t("Trigger threshold") }}</span>
					<span class="risk-rules__head-cell">{{ $t("Action") }}</span>
				</div>

				<div class="risk-rules__body">
					<div v-for="rule in localRules" :key="rule.risk_type" class="risk-rules__row">
						<div class="risk-rules__risk">
							<ui-checkbox
								:model-value="rule.enabled"
								size="sm"
								@update:model-value="(value: boolean) => handleToggleEnabled(rule, value)"
							>
								{{ getRiskLabel(rule.risk_type) }}
							</ui-checkbox>
						</div>

						<div class="risk-rules__field">
							<ui-input v-model="rule.threshold" type="number" size="md" @change="handleThresholdChange(rule)">
								<template #append>%</template>
							</ui-input>
						</div>

						<div class="risk-rules__field">
							<ui-select v-model="actionValue" :options="actionOptions" size="md" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.risk-rules {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 6px;
		border-radius: 24px;
		background-color: $blue-opacity;
		margin: 24px 0;

		&__intro {
			display: flex;
			flex-direction: column;
			gap: 6px;
			padding: 16px 24px;
		}

		&__subtitle {
			margin: 0;
			color: $secondary;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
		}

		&__card {
			width: 100%;
			padding: 24px;
			border-radius: 20px;
			background-color: $white;
			box-shadow: 0 0 8px rgba(0, 0, 0, 0.04);
		}

		&__content {
			display: flex;
			flex-direction: column;
			gap: 20px;
		}

		&__head,
		&__row {
			display: grid;
			grid-template-columns: minmax(160px, 1fr) minmax(180px, 344px) minmax(180px, 344px);
			gap: 34px;
			align-items: center;
		}

		&__head {
			padding: 8px 0;
			border-radius: 12px;
			background-color: $blue-opacity;
			box-shadow: 0 0 8px rgba(0, 0, 0, 0.04);
		}

		&__head-cell {
			color: $secondary;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			&:first-child {
				padding-left: 32px;
			}
		}

		&__body {
			display: flex;
			flex-direction: column;
			gap: 16px;
		}

		&__risk {
			min-width: 0;

			:deep(.ui-checkbox) {
				align-items: center;
				gap: 12px;
			}
		}

		&__field {
			min-width: 0;
			width: 100%;

			:deep(.ui-input),
			:deep(.ui-select) {
				width: 100%;
			}
		}
	}

	@media (max-width: 900px) {
		.risk-rules {
			&__head,
			&__row {
				grid-template-columns: 1fr;
				gap: 12px;
			}

			&__head {
				padding: 12px 16px;
			}

			&__head-cell {
				&:first-child {
					padding-left: 0;
				}

				&:not(:first-child) {
					display: none;
				}
			}
		}
	}
</style>
