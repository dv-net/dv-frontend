<script setup lang="ts">
	import { UiButton, UiFormItem, UiInput, UiSkeleton, UiSwitch, UiTabs, UiTabsItem } from "@dv.net/ui-kit";
	import { storeToRefs } from "pinia";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { useAmlSettingsProjectStore } from "@dv-admin/stores/projects/amlSettings";
	import { AML_PROVIDERS } from "@dv-admin/utils/constants/transferCheck";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { computed, ref, watch } from "vue";
	import { useRouter } from "vue-router";

	const router = useRouter();

	const { dictionary } = storeToRefs(useGeneralStore());
	const amlSettingsProjectStore = useAmlSettingsProjectStore();
	const { amlSettingsProject, formAmlSettings, isLoadingConnectedProviders } = storeToRefs(amlSettingsProjectStore);
	const {
		getConnectedAmlProviders,
		initFormAmlSettings,
		changeFormAmlProvider,
		isProviderGloballyConnected,
		setFormAmlProviderEnabled,
		isFormAmlProviderEnabled,
		getInitialActiveTabSlug
	} = amlSettingsProjectStore;

	const activeProviderTab = ref<string>("");

	const availableAmlProviders = computed<string[]>(() => dictionary.value?.available_aml_providers ?? []);

	const isCurrentProviderGloballyConnected = computed<boolean>(() =>
		isProviderGloballyConnected(activeProviderTab.value)
	);

	const isCurrentProviderEnabled = computed<boolean>({
		get: () => isFormAmlProviderEnabled(activeProviderTab.value),
		set: (value: boolean) => setFormAmlProviderEnabled(activeProviderTab.value, value)
	});

	const connectedStoreProvider = computed<string | null>(() => {
		if (!amlSettingsProject.value?.enabled) return null;
		return amlSettingsProject.value.provider_slug;
	});

	const currentNameAmlProvider = (aml: string): string => {
		return aml in AML_PROVIDERS ? AML_PROVIDERS[aml] : aml;
	};

	const goToConnectPage = (providerSlug: string) => {
		router.push({ name: "transfer-check-connect-aml", params: { aml: providerSlug } });
	};

	const handleProviderChange = (slug: string) => {
		if (isProviderGloballyConnected(slug)) {
			changeFormAmlProvider(slug);
		}
	};

	const loadAmlProviders = async () => {
		const providers = availableAmlProviders.value;
		if (!providers.length) return;

		await getConnectedAmlProviders(providers);
		initFormAmlSettings(providers);
		activeProviderTab.value = getInitialActiveTabSlug(providers);
	};

	watch(dictionary, loadAmlProviders, { immediate: true });
</script>

<template>
	<block-section v-if="availableAmlProviders.length" class="aml-settings">
		<div class="header">
			<h3 class="global-title-h3">{{ $t("AML settings") }}</h3>
			<span v-if="connectedStoreProvider" class="header__badge">
				<span class="header__badge-dot" />
				{{ $t("{aml} connected", { aml: currentNameAmlProvider(connectedStoreProvider) }) }}
			</span>
		</div>

		<ui-skeleton
			v-if="isLoadingConnectedProviders"
			:rowHeight="136"
			:rows="1"
			:item-border-radius="12"
		/>

		<div v-else class="body">
			<ui-tabs
				v-model="activeProviderTab"
				class="body__tabs"
				width-mode="content"
				mode="light"
				@change="handleProviderChange"
			>
				<ui-tabs-item v-for="item in availableAmlProviders" :key="item" :value="item">
					{{ currentNameAmlProvider(item) }}
				</ui-tabs-item>
			</ui-tabs>

			<div v-if="!isCurrentProviderGloballyConnected" class="body__connect">
				<p class="body__connect-text">
					{{ $t("aml is not connected", { aml: currentNameAmlProvider(activeProviderTab) }) }}
				</p>
				<ui-button mode="neutral" size="lg" class="body__connect-btn" @click="goToConnectPage(activeProviderTab)">
					{{ $t("Connect") }} {{ currentNameAmlProvider(activeProviderTab) }}
				</ui-button>
			</div>

			<div v-else class="body__controls">
				<ui-switch v-model="isCurrentProviderEnabled" :label="$t('Enable AML check for this store')" />
				<ui-form-item :label="$t('Fraud score for actions (trigger threshold)')">
					<ui-input v-model="formAmlSettings.risk_threshold" type="number" size="lg">
						<template #append>%</template>
					</ui-input>
				</ui-form-item>
			</div>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.aml-settings {
		display: flex;
		flex-direction: column;
		gap: 16px;
		.header {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 12px;
			min-height: 32px;
			&__badge {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				padding: 6px 12px;
				border-radius: 40px;
				background-color: #f7f9fb;
				color: #1f9649;
				font-size: 14px;
				font-weight: 500;
				line-height: 20px;
			}

			&__badge-dot {
				width: 8px;
				height: 8px;
				border-radius: 50%;
				background-color: #1f9649;
				flex-shrink: 0;
			}
		}
		.body {
			display: flex;
			flex-direction: column;
			&__tabs {
				&:deep(.ui-tabs-item__button) {
					min-width: 200px;
				}
			}
			&__connect {
				display: flex;
				align-items: center;
				justify-content: space-between;
				flex-wrap: wrap;
				gap: 12px 16px;
				margin-top: 16px;
				padding: 16px 20px;
				min-height: 80px;
				border-radius: 12px;
				border: 1px solid #e1e8f1;
				background-color: #f7f9fb;

				&-text {
					margin: 0;
					color: #6b6d80;
					font-size: 16px;
					font-weight: 400;
					line-height: 20px;
				}

				&-btn {
					flex-shrink: 0;
				}
			}
			&__controls {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 16px;
				margin-top: 16px;
				&:deep(.ui-form-item__footer) {
					display: none;
				}
				&:deep(.ui-input) {
					padding: 0 0 0 12px;
					.ui-input__append {
						display: flex;
						align-items: center;
						justify-content: center;
						background-color: red;
						height: 100%;
						color: rgba(0, 0, 0, 1);
						background-color: rgba(225, 232, 241, 1);
						width: 60px;
						font-size: 16px;
						font-weight: 600;
					}
				}
			}
		}
	}
</style>
