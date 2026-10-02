<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import { storeToRefs } from "pinia";
	import { UiCheckbox, UiIcon, UiInput, UiSelect, UiSkeleton } from "@dv.net/ui-kit";
	import { useAmlStore } from "@dv-admin/stores/aml";
	import TooltipHelper from "@dv-admin/components/ui/tooltipHelper/TooltipHelper.vue";
	import {
		AML_PROVIDER_AML_BOT,
		AML_RISK_ACTION_ACCEPT_AND_FLAG,
		AML_RISK_ACTION_REJECT,
		AML_RISK_LEVEL_THRESHOLD,
		AML_RISK_LEVEL_THRESHOLD_LABELS,
		AML_RISK_TYPE_LABELS,
		AML_RISK_TYPE_RISK_LEVEL,
		AML_RISK_TYPE_SUM_OF_SIGNALS,
		AML_RISK_TYPE_TOTAL_SCORE,
		type TAmlRiskLevelThreshold
	} from "@dv-admin/utils/constants/aml";
	import type { IAmlRiskRuleResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import type { IUiSelectOptions } from "@dv-admin/utils/types/general.ts";
	import { useI18n } from "vue-i18n";

	const { t } = useI18n();
	const { isLoading = false } = defineProps<{
		isLoading?: boolean;
	}>();

	const amlStore = useAmlStore();
	const { formAmlScoreTransaction, amlRiskRules, amlSignalCategories, isLoadingAmlRiskRules } =
		storeToRefs(amlStore);
	const { getAmlRiskRules, putAmlRiskRules } = amlStore;

	const localRules = ref<IAmlRiskRuleResponse[]>([]);
	const isSecondaryExpanded = ref(false);

	const PRIMARY_RISK_TYPES = [AML_RISK_TYPE_TOTAL_SCORE, AML_RISK_TYPE_RISK_LEVEL] as const;

	const showSkeleton = computed(() => isLoading || isLoadingAmlRiskRules.value);

	const riskLevelThresholdOptions = computed<IUiSelectOptions[]>(() =>
		Object.values(AML_RISK_LEVEL_THRESHOLD).map((value) => ({
			label: t(AML_RISK_LEVEL_THRESHOLD_LABELS[value]),
			value: String(value)
		}))
	);

	const signalLabelByCategory = computed(() => {
		return Object.fromEntries(amlSignalCategories.value.map((item) => [item.category, item.label]));
	});

	const primaryRules = computed(() => {
		const byType = new Map(localRules.value.map((rule) => [rule.risk_type, rule]));
		return PRIMARY_RISK_TYPES.map((type) => byType.get(type)).filter(
			(rule): rule is IAmlRiskRuleResponse => Boolean(rule)
		);
	});

	const secondaryRules = computed(() =>
		localRules.value.filter(
			(rule) => !(PRIMARY_RISK_TYPES as readonly string[]).includes(rule.risk_type)
		)
	);

	const isAmlBotProvider = computed(
		() => formAmlScoreTransaction.value.provider_slug === AML_PROVIDER_AML_BOT
	);

	const isRiskLevelRule = (riskType: string): boolean => riskType === AML_RISK_TYPE_RISK_LEVEL;

	const isRejectOnlyRiskType = (riskType: string): boolean =>
		riskType === AML_RISK_TYPE_TOTAL_SCORE || riskType === AML_RISK_TYPE_SUM_OF_SIGNALS;

	const normalizeAction = (riskType: string, action: string): string => {
		if (isRejectOnlyRiskType(riskType)) return AML_RISK_ACTION_REJECT;
		if (action === AML_RISK_ACTION_ACCEPT_AND_FLAG) return AML_RISK_ACTION_ACCEPT_AND_FLAG;
		return AML_RISK_ACTION_REJECT;
	};

	const isValidRiskLevelThreshold = (threshold: number): threshold is TAmlRiskLevelThreshold =>
		Object.values(AML_RISK_LEVEL_THRESHOLD).includes(threshold as TAmlRiskLevelThreshold);

	const normalizeThreshold = (riskType: string, threshold: number | string): number => {
		const value = Number(threshold);
		if (isRiskLevelRule(riskType)) {
			if (isValidRiskLevelThreshold(value)) return value;
			return AML_RISK_LEVEL_THRESHOLD.medium;
		}
		return value;
	};

	const getActionOptions = (riskType: string): IUiSelectOptions[] => {
		const options: IUiSelectOptions[] = [
			{ label: t("Do not accept payment"), value: AML_RISK_ACTION_REJECT }
		];
		if (!isRejectOnlyRiskType(riskType)) {
			options.push({
				label: t("Accept and flag address"),
				value: AML_RISK_ACTION_ACCEPT_AND_FLAG
			});
		}
		return options;
	};

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
				localRules.value[index].threshold = normalizeThreshold(rule.risk_type, rule.threshold);
				localRules.value[index].action = normalizeAction(rule.risk_type, rule.action);
			});
			return;
		}

		localRules.value = next.map((rule) => ({
			...rule,
			threshold: normalizeThreshold(rule.risk_type, rule.threshold),
			action: normalizeAction(rule.risk_type, rule.action)
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
					threshold: normalizeThreshold(rule.risk_type, rule.threshold),
					action: normalizeAction(rule.risk_type, rule.action)
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

	const handleRiskLevelThresholdChange = async (rule: IAmlRiskRuleResponse, value: string | null) => {
		if (value === null) return;
		rule.threshold = Number(value);
		await handleThresholdChange(rule);
	};

	const handleThresholdChange = async (rule: IAmlRiskRuleResponse) => {
		const threshold = Number(rule.threshold);
		if (isRiskLevelRule(rule.risk_type)) {
			if (!isValidRiskLevelThreshold(threshold)) {
				syncLocalRules();
				return;
			}
			rule.threshold = threshold;
			await saveRule(rule);
			return;
		}
		if (Number.isNaN(threshold) || threshold < 0 || threshold > 100) {
			syncLocalRules();
			return;
		}
		rule.threshold = threshold;
		await saveRule(rule);
	};

	const handleActionChange = async (rule: IAmlRiskRuleResponse) => {
		rule.action = normalizeAction(rule.risk_type, rule.action);
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
			isSecondaryExpanded.value = false;
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
			<ui-skeleton v-if="showSkeleton" :rows="2" :row-height="46" :rows-gap="16" :item-border-radius="12" />

			<div v-else class="risk-rules__content">
				<div class="risk-rules__head">
					<span class="risk-rules__head-cell">{{ $t("Risk") }}</span>
					<span class="risk-rules__head-cell">{{ $t("Trigger threshold") }}</span>
					<span class="risk-rules__head-cell">{{ $t("Action") }}</span>
				</div>

				<div class="risk-rules__body">
					<div v-for="rule in primaryRules" :key="rule.risk_type" class="risk-rules__row">
						<div class="risk-rules__risk">
							<ui-checkbox
								:model-value="rule.enabled"
								size="sm"
								@update:model-value="(value: boolean) => handleToggleEnabled(rule, value)"
							>
								{{ getRiskLabel(rule.risk_type) }}
							</ui-checkbox>
							<tooltip-helper
								v-if="isRiskLevelRule(rule.risk_type) && isAmlBotProvider"
								class="risk-rules__risk-help"
								:title="$t('Risk level')"
								:text="$t('AMLBot PRO mode signal limit')"
								icon-color="#dd4c1e"
								icon-type="400"
								icon-size="sm"
							/>
						</div>

						<div class="risk-rules__field">
							<ui-select
								v-if="isRiskLevelRule(rule.risk_type)"
								:model-value="String(rule.threshold)"
								:options="riskLevelThresholdOptions"
								size="md"
								@update:model-value="(value) => handleRiskLevelThresholdChange(rule, value)"
							/>
							<ui-input
								v-else
								v-model="rule.threshold"
								type="number"
								size="md"
								@change="handleThresholdChange(rule)"
							>
								<template #append>%</template>
							</ui-input>
						</div>

						<div class="risk-rules__field">
							<ui-select
								v-model="rule.action"
								:options="getActionOptions(rule.risk_type)"
								size="md"
								@change="handleActionChange(rule)"
							/>
						</div>
					</div>

					<div v-if="secondaryRules.length" class="risk-rules__secondary">
						<button
							type="button"
							class="risk-rules__toggle"
							@click="isSecondaryExpanded = !isSecondaryExpanded"
						>
							<span>{{ isSecondaryExpanded ? $t("Hide") : $t("Show more") }}</span>
							<ui-icon
								class="risk-rules__toggle-icon"
								:class="{ 'risk-rules__toggle-icon--open': isSecondaryExpanded }"
								name="arrow-forward 1"
								type="400"
								size="md"
							/>
						</button>

						<div
							class="risk-rules__collapse"
							:class="{ 'risk-rules__collapse--open': isSecondaryExpanded }"
						>
							<div class="risk-rules__collapse-clip">
								<div class="risk-rules__collapse-inner">
									<div
										v-for="rule in secondaryRules"
										:key="rule.risk_type"
										class="risk-rules__row"
									>
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
											<ui-input
												v-model="rule.threshold"
												type="number"
												size="md"
												@change="handleThresholdChange(rule)"
											>
												<template #append>%</template>
											</ui-input>
										</div>

										<div class="risk-rules__field">
											<ui-select
												v-model="rule.action"
												:options="getActionOptions(rule.risk_type)"
												size="md"
												@change="handleActionChange(rule)"
											/>
										</div>
									</div>
								</div>
							</div>
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

			@media (max-width: 900px) {
				grid-template-columns: 1fr;
				gap: 12px;
			}
		}

		&__row {
			padding: 1px;
		}

		&__head {
			padding: 8px 0;
			border-radius: 12px;
			background-color: $blue-opacity;
			box-shadow: 0 0 8px rgba(0, 0, 0, 0.04);

			@media (max-width: 900px) {
				padding: 12px 16px;
			}
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

				@media (max-width: 900px) {
					padding-left: 0;
				}
			}

			@media (max-width: 900px) {
				&:not(:first-child) {
					display: none;
				}
			}
		}

		&__body {
			display: flex;
			flex-direction: column;
			gap: 16px;
		}

		&__risk {
			display: flex;
			align-items: center;
			gap: 6px;
			min-width: 0;

			:deep(.ui-checkbox) {
				align-items: center;
				gap: 12px;
				min-width: 0;
			}
		}

		&__risk-help {
			flex-shrink: 0;
			line-height: 0;
		}

		&__field {
			min-width: 0;
			width: 100%;

			:deep(.ui-input),
			:deep(.ui-select) {
				width: 100%;
			}
		}

		&__secondary {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		&__toggle {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding: 4px 0;
			border: none;
			background: transparent;
			color: $blue;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			cursor: pointer;
			transition: opacity 0.2s ease;

			@media (hover: hover) {
				&:hover {
					opacity: 0.7;
				}
			}
		}

		&__collapse {
			display: grid;
			grid-template-rows: 0fr;
			width: 100%;
			transition: grid-template-rows 0.3s ease;

			&--open {
				grid-template-rows: 1fr;
			}
		}

		&__collapse-clip {
			overflow: hidden;
			min-height: 0;
		}

		&__collapse-inner {
			display: flex;
			flex-direction: column;
			gap: 24px;
			padding: 16px 0 0;
		}

		&__toggle-icon {
			transform: rotate(90deg);
			transition: transform 0.25s ease;

			&--open {
				transform: rotate(-90deg);
			}
		}
	}
</style>
