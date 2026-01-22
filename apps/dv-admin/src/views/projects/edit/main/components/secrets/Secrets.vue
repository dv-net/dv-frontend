<script setup lang="ts">
	import { UiButton, UiConfirm } from "@dv.net/ui-kit";
	import RowActionInput from "@dv-admin/views/projects/edit/main/components/rowActionInput/RowActionInput.vue";
	import { storeToRefs } from "pinia";
	import { computed, ref } from "vue";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { useApiKeysProjectStore } from "@dv-admin/stores/projects/apiKeys";

	defineProps<{ uuid: string }>();

	const { keysProject, isLoadingCreateApiKey } = storeToRefs(useApiKeysProjectStore());
	const { webhooksSecret, isLoadingGenerateSecretKey } = storeToRefs(useProjectsStore());
	const { postKeyProject } = useApiKeysProjectStore();
	const { postStoreSecret } = useProjectsStore();

	const isShowSecret = ref<boolean>(false);

	const isHideBlockBottomApiKey = computed<boolean>(() => !keysProject.value.length && !webhooksSecret.value);
</script>

<template>
	<div v-if="!isHideBlockBottomApiKey" class="block__bottom">
		<row-action-input
			v-for="(item, index) in keysProject"
			:key="index"
			:label="$t('API keys for working with API')"
			:icon-title="$t('API keys for working with API')"
			:icon-text="$t('Used to receive deposit addresses and generate a link to the payment form.')"
			v-model="item.key"
			:isCopyValue="true"
			readonly
		>
			<ui-confirm
				:method="() => postKeyProject(uuid, item.id, $t('A new API key has been created to work with the API'))"
				@click.stop
				class="align-self-center"
				:title="$t('Generate a new API key?')"
			>
				<ui-button class="ml-8" type="outline" size="md" :loading="isLoadingCreateApiKey[item.id]">
					{{ $t("Generate new") }}
				</ui-button>
			</ui-confirm>
		</row-action-input>
		<row-action-input
			v-if="webhooksSecret"
			:label="$t('Secret key for verification')"
			v-model="webhooksSecret"
			:icon-title="$t('Secret key for verification')"
			:icon-text="$t('Used to verify the authenticity of webhooks.')"
			readonly
			:isCopyValue="true"
			:type-input="isShowSecret ? 'text' : 'password'"
		>
			<ui-button type="outline" size="md" @click.stop="isShowSecret = !isShowSecret" class="align-self-center ml-8">
				{{ $t(isShowSecret ? "Hide" : "Show") }}
			</ui-button>
			<ui-confirm
				:method="() => postStoreSecret(uuid, $t('New verification key has been generated'))"
				@click.stop
				class="align-self-center"
				:title="$t('Generate a new verification key?')"
			>
				<ui-button type="outline" size="md" :loading="isLoadingGenerateSecretKey">
					{{ $t("Generate new") }}
				</ui-button>
			</ui-confirm>
		</row-action-input>
	</div>
</template>

<style scoped lang="scss">
	.block__bottom {
		border-top: 1px solid $grey;
		padding-top: 20px;
		display: flex;
		flex-direction: column;
		gap: 32px;
		&:deep(.ui-button) {
			border-radius: 4px;
		}
		.align-self-center {
			align-self: center;
		}
	}
</style>
