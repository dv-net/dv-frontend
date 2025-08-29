<script setup lang="ts">
	import { useRoute } from "vue-router";
	import GlobalInput from "@dv-admin/components/ui/globalInput/GlobalInput.vue";
	import { UiButton, UiInput, UiSkeleton } from "@dv.net/ui-kit";
	import Breadcrumbs from "@dv-admin/components/ui/breadcrumbs/Breadcrumbs.vue";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { storeToRefs } from "pinia";
	import { useTransferCheckStore } from "@dv-admin/stores/transferCheck";
	import { computed, onMounted, ref } from "vue";
	import { AML_PROVIDERS, AML_SETTING_LABELS } from "@dv-admin/utils/constants/transferCheck";
	import type { IAmlKeysResponse } from "@dv-admin/utils/types/api/apiGo.ts";
	import { deleteApiAmlKeys, postApiAmlKeys } from "@dv-admin/services/api/transferCheck.ts";
	import { useNotifications } from "@shared/utils/composables/useNotifications.ts";
	import { useI18n } from "vue-i18n";

	const route = useRoute();
	const { t } = useI18n();
	const { notify } = useNotifications();

	const { amlKeys, isHaveKeysCurrentAml } = storeToRefs(useTransferCheckStore());
	const { getAmlKeys } = useTransferCheckStore();

	const aml = route.params.aml as string;
	const isLoadingAmlKeys = ref<boolean>(true);
	const isLoadingDeleteAmlKeys = ref<boolean>(false);
	const isLoadingPostAmlKeys = ref<boolean>(false);
	const copyAmlKeys = ref<IAmlKeysResponse[]>([]);

	const isDisabledBtn = computed<boolean>(() => {
		if (!copyAmlKeys.value.length) return true;
		return !copyAmlKeys.value.every((item) => Boolean(item.value));
	});

	const currentNameAmlProvider = (aml: string): string => {
		return aml in AML_PROVIDERS ? AML_PROVIDERS[aml] : aml;
	};

	const getStartData = async () => {
		try {
			await getAmlKeys(aml);
			copyAmlKeys.value = amlKeys.value.map((item) => ({ ...item }));
		} catch (error: any) {
			throw error;
		} finally {
			isLoadingAmlKeys.value = false;
		}
	};

	const postAmlKeys = async () => {
		try {
			isLoadingPostAmlKeys.value = true;
			await postApiAmlKeys(aml, copyAmlKeys.value);
			await getStartData();
			notify(t("Keys saved successfully"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingPostAmlKeys.value = false;
		}
	};

	const deleteAmlKeys = async () => {
		try {
			isLoadingDeleteAmlKeys.value = true;
			await deleteApiAmlKeys(aml);
			await getStartData();
			notify(t("AML provider keys deleted"), "success");
		} catch (error: any) {
			console.error(error);
		} finally {
			isLoadingDeleteAmlKeys.value = false;
		}
	};

	onMounted(async () => {
		await getStartData();
	});
</script>

<template>
	<div class="page">
		<breadcrumbs :back-route-title="$t('AML check of transfer')" back-name-route="transfer-check" />
		<form class="page__form" @submit.prevent="postAmlKeys">
			<block-section class="flex flex-column gap-24" mode="grey-border">
				<h2 class="global-title-h3">{{ $t("Basic settings") }}</h2>
				<ui-skeleton
					v-if="isLoadingAmlKeys"
					:rows="2"
					:row-height="72"
					:item-border-radius="8"
					:rows-gap="24"
					first-color="var(--color-background-tertiary)"
					second-color="var(--color-background-secondary)"
				/>
				<template v-else>
					<global-input
						v-for="item in copyAmlKeys"
						:key="item.name"
						:title="item.name in AML_SETTING_LABELS ? $t(AML_SETTING_LABELS[item.name]) : item.name"
						isNoTranslation
					>
						<ui-input v-model="item.value" />
					</global-input>
				</template>
			</block-section>
			<div class="flex flex-y-center flex-x-between">
				<ui-button
					mode="neutral"
					size="xl"
					native-type="submit"
					:loading="isLoadingPostAmlKeys"
					:disabled="isDisabledBtn"
				>
					{{ $t(isHaveKeysCurrentAml ? "Change" : "Connect") }} {{ currentNameAmlProvider(aml) }}
				</ui-button>
				<ui-button
					type="secondary"
					size="xl"
					left-icon-name="delete"
					left-icon-size="md"
					:disabled="!isHaveKeysCurrentAml"
					:loading="isLoadingDeleteAmlKeys"
					@click="deleteAmlKeys"
				>
					{{ $t("Delete keys") }}
				</ui-button>
			</div>
		</form>
	</div>
</template>

<style scoped lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		gap: 32px;
		&__form {
			display: flex;
			flex-direction: column;
			gap: 32px;
			max-width: 720px;
			width: 100%;
		}
	}
</style>
