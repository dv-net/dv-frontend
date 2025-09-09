<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import { useI18n } from "vue-i18n";
	import { storeToRefs } from "pinia";
	import { useRouter } from "vue-router";
	import { UiButton, UiForm, UiFormItem, UiInput, UiLink, UiSkeleton, UiTabs, UiTabsItem } from "@dv.net/ui-kit";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import CompletedIcon from "./components/CompletedIcon.vue";
	import InProgressIcon from "./components/InProgressIcon.vue";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import Webhooks from "@dv-admin/views/projects/edit/main/components/webhooks/Webhooks.vue";
	import Secrets from "@dv-admin/views/projects/edit/main/components/secrets/Secrets.vue";
	import { useDashboardStore } from "@dv-admin/stores/dashboard";
	import { getCurrentBlockchain, isValidUrl } from "@shared/utils/helpers/general";
	import DisplayHash from "@shared/components/ui/displayHash/DisplayHash.vue";
	import BlockchainIcon from "@shared/components/ui/blockchainIcon/BlockchainIcon.vue";
	import { getApiUserSettings } from "@dv-admin/services/api/systemSettings";
	import { useAuthStore } from "@dv-admin/stores/auth";

	const { processingWallets } = storeToRefs(useDashboardStore());
	const { currentProject, projects, isLoading } = storeToRefs(useProjectsStore());
	const { quickStartGuideSetting } = storeToRefs(useUserSettingsStore());
	const { getProjects, getAllInfoProjects, putOneProject, resetCurrentProject } = useProjectsStore();
	const { postUserSettings, getUserSettings } = useUserSettingsStore();
	const { isShowMainLoader } = storeToRefs(useAuthStore());

	const { locale } = useI18n();
	const router = useRouter();
	const { t } = useI18n();

	const formRef = ref<HTMLFormElement | null>(null);
	const formError = ref<string>("");
	const isLoadingFinishBtn = ref<boolean>(false);
	const currentProjectId = ref<string>("");
	const currentStep = ref<1 | 2 | 3 | 4>(2);
	const totalSteps = 4;

	interface Step {
		id: 1 | 2 | 3 | 4;
		title: string;
		isActive: boolean;
		isCompleted: boolean;
	}

	const steps = ref<Step[]>([
		{
			id: 1,
			title: "Software installation on server or Merchant registration",
			isActive: false,
			isCompleted: true
		},
		{ id: 2, title: "Set your project URL", isActive: true, isCompleted: false },
		{
			id: 3,
			title: "WebHook and API setup",
			isActive: false,
			isCompleted: false
		},
		{ id: 4, title: "Top up of Processing wallets", isActive: false, isCompleted: false }
	]);
	const defaultSteps = JSON.stringify(steps.value);

	const goToNextStep = async () => {
		if (currentStep.value < totalSteps) {
			steps.value[currentStep.value - 1].isCompleted = true;
			steps.value[currentStep.value - 1].isActive = false;
			currentStep.value++;
			steps.value[currentStep.value - 1].isActive = true;
		}

		if (currentStep.value === 3 && steps.value[currentStep.value - 1].isCompleted) goToNextStep();
		if (currentStep.value === 4 && steps.value[currentStep.value - 1].isCompleted) {
			steps.value[currentStep.value - 1].isActive = false;
		}
	};

	const setStepIsCompleted = (step: number) => {
		steps.value[step - 1].isCompleted = true;
		steps.value[step - 1].isActive = false;
	};

	const changeCurrentProject = async (project: string) => {
		if (currentProject.value?.id === project) return;

		try {
			resetCurrentProject();
			await getAllInfoProjects(project);
		} catch (error) {
			console.error(error);
		}

		steps.value = JSON.parse(defaultSteps);
		currentStep.value = 2;
		currentProjectId.value = currentProject.value?.id || "";
	};

	const skipQuickStart = async () => {
		isLoadingFinishBtn.value = true;
		try {
			const data = {
				name: "quick_start_guide_status",
				value: "completed",
				is_editable: true,
				available_values: null,
				two_factor_verification_required: false
			};
			await postUserSettings(data, t("Quick start passed"));
			await getUserSettings();
			await router.push({ name: "dashboard" });
		} catch (error) {
			console.error(error);
		} finally {
			isLoadingFinishBtn.value = false;
		}
	};

	const saveProjectNameHandler = async () => {
		if (!currentProject.value) return;
		formError.value = "";
		if (currentProject.value?.site !== null && !isValidUrl(currentProject.value?.site)) {
			formError.value = t("Please enter a valid URL");
			return;
		}
		await putOneProject(t("The project has been saved"));
		goToNextStep();
	};

	onMounted(async () => {
		isShowMainLoader.value = false;
		if (!quickStartGuideSetting.value) await getApiUserSettings();
		if (quickStartGuideSetting.value?.value === "completed") {
			await router.push({ name: "dashboard" });
			return;
		}
		await getProjects();
		await Promise.all([changeCurrentProject(projects.value[0].id), useDashboardStore().getProcessingWallets()]);
	});
</script>

<template>
	<h1 class="global-title-h1 pb-32">{{ $t("Quick start") }}</h1>

	<ui-tabs
		v-if="projects.length > 1"
		class="quick-start__tabs"
		v-model="currentProjectId"
		@change="changeCurrentProject"
	>
		<ui-tabs-item v-for="item in projects" :value="item.id" :key="item.id">
			{{ item?.name || item?.site }}
		</ui-tabs-item>
	</ui-tabs>

	<ui-skeleton v-if="isLoading || !currentProject" :rows="5" :item-border-radius="16" :row-height="107" />
	<block-section v-else class="quick-start" mode="grey-border" radius="lg" padding="xxl">
		<div class="quick-start__header">
			<h1 class="quick-start__title">{{ t("Let's set up your merchant") }}</h1>
			<div class="progress-bar">
				<span class="progress-bar__text">{{ currentStep }}/{{ totalSteps }}</span>
				<div class="progress-bar__track">
					<div class="progress-bar__fill" :style="{ width: `${(currentStep / totalSteps) * 100}%` }" />
				</div>
			</div>
		</div>

		<div class="steps">
			<div
				v-for="step in steps"
				:key="step.id"
				class="step"
				:class="{
					'step--active': step.isActive,
					'step--completed': step.isCompleted
				}"
			>
				<div class="step__header">
					<div class="step__header__left-side">
						<completed-icon v-if="step.isCompleted" />
						<in-progress-icon v-else />

						<h2 class="step__title">&nbsp;{{ step.id }}.</h2>
						<h2 :class="{ step__title: true, 'step__title__line-decoration': step.isCompleted }">
							{{ t(step.title) }}
						</h2>
					</div>

					<UiButton
						v-if="(!step.isCompleted && !step.isActive) || (step.id === 4 && !step.isCompleted)"
						type="tertiary"
						@click="setStepIsCompleted(step.id)"
						:disabled="isLoading"
					>
						{{ t("Set up later") }}
					</UiButton>
				</div>

				<div v-if="step.isActive" class="step__content">
					<ui-form
						ref="formRef"
						:model="currentProject"
						class="step__form"
						:class="{ 'step__form-gap': currentStep === 2 }"
						@submit.prevent="goToNextStep"
					>
						<div v-if="currentStep === 2" class="form-group">
							<ui-form-item
								:error="formError"
								name="site"
								:label="$t('This URL will be used on the payment form to return the client to your store')"
							>
								<UiInput
									v-model="currentProject.site"
									:placeholder="t('URL of your project')"
									is-empty-value-null
									class="gray-background"
								/>
							</ui-form-item>
						</div>

						<div v-if="currentStep === 3" class="form-group">
							<div class="flex gap-4">
								<span class="step__description">{{ t("Enter the URL for WebHook and review the") }}</span>
								<ui-link
									class="step__description link"
									:href="`https://docs.dv.net/${locale}/integration/webhooks.html`"
									target="_blank"
								>
									{{ t("documentation") }}
								</ui-link>
							</div>

							<block-section mode="grey-border" radius="lg">
								<h2 class="global-title-h3">{{ $t("Your API key") }}</h2>

								<div class="step__webhooks-description-container">
									<span class="step__webhooks-description">
										{{
											t(
												"To work via the API, add the following HTTP header to your requests. Full integration documentation can be found at"
											)
										}}
									</span>
									<ui-link
										class="step__webhooks-description pl-2"
										:href="`https://docs.dv.net/${locale}/operations/get-v1-external-exchange-balances.html`"
										target="_blank"
									>
										{{ t("link") }}
									</ui-link>
									<span class="step__webhooks-description">
										{{
											t(
												". In this section you can get your API key to work with the API, as well as generate a Secret Key to verify the signature of incoming payments"
											)
										}}.
									</span>
								</div>

								<secrets :key="currentProjectId" :uuid="currentProjectId" />
							</block-section>
							<webhooks :key="currentProjectId" :uuid="currentProjectId" background="gray" />
						</div>

						<div v-if="currentStep === 4" class="form-group">
							<div>
								<div class="step__description mb-12">
									{{
										t(
											"Below are your processing wallets - they will be visible on your dashboard and will be used to pay for transfers from hot wallets to your cold ones"
										)
									}}.
								</div>
								<div class="step__description step__description__bold mb-4">{{ t("How does it work?") }}</div>
								<div class="step__description">
									{{
										t(
											"Since it is not possible to specify a comment with customer data when sending cryptocurrency, all merchants create a unique wallet for each user. This allows you to determine who the payment came from. However, there is a fee for transferring funds from the client's wallet to yours. We pay it from the processing wallet, so it will need to be replenished as soon as payments start coming in"
										)
									}}.
								</div>
							</div>

							<div class="step__blockchain-container">
								<div v-for="item in processingWallets" :key="item.address">
									<block-section class="step__blockchain" mode="grey-border" radius="lg">
										<div class="step__blockchain__header">
											<blockchain-icon :type="item.currency.id" class="step__blockchain__icon" />
											<span class="blockchain__title">{{ getCurrentBlockchain(item.currency.id) }}</span>
										</div>
										<display-hash
											type="address"
											:hash="item.address"
											:count-prefix="23"
											:is-link="false"
											:currency-id="item.currency.id"
											:size-icon="'sm'"
										/>
									</block-section>
								</div>
							</div>
						</div>

						<div v-if="currentStep !== 4" class="step__actions">
							<UiButton type="tertiary" @click="goToNextStep()" :disabled="isLoading">
								{{ t("Set up later") }}
							</UiButton>
							<UiButton
								mode="neutral"
								:loading="isLoading"
								@click="() => (currentStep === 2 ? saveProjectNameHandler() : goToNextStep())"
							>
								{{ t(currentStep === 2 ? "Save" : "Next") }}
							</UiButton>
						</div>
					</ui-form>
				</div>
			</div>

			<UiButton v-if="currentStep === 4" mode="neutral" size="xl" :loading="isLoadingFinishBtn" @click="skipQuickStart">
				{{ t("Finish") }}
			</UiButton>
		</div>
	</block-section>

	<div v-if="currentStep !== 4" class="quick-start__footer">
		<UiButton v-show="!isLoading" type="secondary" size="lg" :loading="isLoadingFinishBtn" @click="skipQuickStart">
			{{ t("Skip and set up later") }}
		</UiButton>
	</div>
</template>

<style scoped lang="scss">
	.quick-start {
		margin-bottom: 20px;

		&__tabs {
			flex-wrap: wrap;
			max-width: 100%;
			margin-bottom: 16px;

			> button {
				width: fit-content;
			}
		}

		&__title {
			color: $black;
			font-size: 24px;
			font-weight: 600;
			line-height: 28px;
		}

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 40px;
		}

		.progress-bar {
			display: flex;
			align-items: center;
			gap: 8px;

			&__text {
				color: #1968e5;
				font-size: 16px;
				font-weight: 600;
				line-height: 20px;
			}

			&__track {
				width: 200px;
				height: 6px;
				background-color: #d6dfec;
				border-radius: 3px;
				overflow: hidden;
			}

			&__fill {
				height: 100%;
				background-color: #1968e5;
				transition: width 0.3s ease;
			}
		}

		.steps {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		.step {
			border: 1px solid $grey;
			border-radius: 8px;
			overflow: hidden;
			background-color: white;

			&__header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-right: 8px;

				&__left-side {
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 16px;
				}
			}

			&__title {
				position: relative;
				font-size: 18px;
				font-weight: 500;
				color: var(--text-primary);

				&__line-decoration {
					text-decoration-line: line-through;
				}
			}

			&__content {
				margin: 0 16px 16px 52px;
				padding-top: 12px;
				border-top: 1px solid $grey;
			}

			&__form {
				display: flex;
				flex-direction: column;
				gap: 20px;
				&-gap {
					gap: 0;
				}
			}

			&__description {
				color: #303345;
				font-size: 14px;
				font-weight: 400;
				line-height: 20px;

				&__bold {
					font-weight: 500;
				}
			}

			&__webhooks-description-container {
				padding: 8px 0 20px;
			}

			&__webhooks-description {
				color: #6b6d80;
				font-size: 16px;
				font-weight: 400;
				line-height: 20px;
			}

			&__blockchain-container {
				display: flex;
				flex-wrap: wrap;
				gap: 12px;
			}

			&__blockchain {
				width: 100%;
				min-width: 306px;
				padding: 20px 16px;

				&__header {
					display: flex;
					align-items: center;
					gap: 8px;
					margin-bottom: 12px;
				}

				&__icon {
					height: 32px;
					width: 32px;
				}

				&__title {
					font-size: 18px;
					font-weight: 500;
					line-height: 24px;
				}
			}

			&__actions {
				display: flex;
				gap: 8px;
				justify-content: flex-end;
			}

			&--active {
				border-color: #1968e5;
			}

			&--completed {
				.step__title {
					color: #80828e;
				}
			}
		}

		.form-group {
			display: flex;
			flex-direction: column;
			gap: 16px;

			.gray-background {
				background-color: #f7f9fb;
			}
		}

		&__footer {
			display: flex;
			justify-content: flex-end;
		}
	}
</style>
