<script setup lang="ts">
	import { UiIcon, UiLink, UiSkeleton } from "@dv.net/ui-kit/dist";
	import { storeToRefs } from "pinia";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { computed } from "vue";
	import { useRoute } from "vue-router";
	import { useApiKeysProjectStore } from "@dv-admin/stores/projects/apiKeys";
	import Secrets from "@dv-admin/views/projects/edit/main/components/secrets/Secrets.vue";
	import Webhooks from "@dv-admin/views/projects/edit/main/components/webhooks/Webhooks.vue";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { useI18n } from "vue-i18n";

	const { keysProject } = storeToRefs(useApiKeysProjectStore());
	const { postKeyProject } = useApiKeysProjectStore();
	const { isLoading } = storeToRefs(useProjectsStore());

	const { locale } = useI18n();
	const route = useRoute();
	const uuid = route.params.id as string;

	const isShowBtnAddKey = computed<boolean>(() => !isLoading.value && !keysProject.value.length);

	const goToDocumentation = () => {
		window.open(`https://docs.dv.net/${locale.value}/`, "_blank");
	};
</script>

<template>
	<div class="main">
		<block-section class="documentation" mode="grey-border" radius="md">
			<div class="documentation__btn" @click="goToDocumentation">
				<ui-link class="flex flex-y-center gap-8">
					<ui-icon name="description (1)" type="400" />
					<span>{{ $t("API Documentation") }}</span>
				</ui-link>
			</div>
			<p class="documentation__text">
				{{ $t("Complete instructions for developers on how to work with our product") }}
			</p>
		</block-section>
		<block-section class="block">
			<div class="block__top">
				<div class="flex flex-y-center flex-x-between">
					<h2 class="global-title-h3">{{ $t("Your API key") }}</h2>
					<ui-link
						v-if="isShowBtnAddKey"
						:text="$t('Generate new')"
						@click.stop="postKeyProject(uuid, 'uniqueKey', $t('A new API key has been created to work with the API'))"
					/>
				</div>
				<p class="block__description">
					{{
						$t(
							"The API key allows you to check the status of incoming payments, send cryptocurrency via web requests, and connect payment systems to your applications. This will help automate transaction processing. For more information, see our documentation"
						)
					}}
				</p>
			</div>
			<ui-skeleton
				v-if="isLoading"
				class="block__bottom"
				:rows="2"
				:rowHeight="44"
				:rows-gap="32"
				:item-border-radius="8"
			/>
			<secrets v-else :uuid="uuid" />
		</block-section>
		<webhooks :uuid="uuid" />
	</div>
</template>

<style scoped lang="scss">
	.main {
		display: flex;
		flex-direction: column;
		gap: 32px;
		.documentation {
			padding: 12px 16px !important;
			margin-bottom: 8px;
			display: flex;
			align-items: center;
			gap: 16px;
			&__btn {
				padding: 11px 16px;
				border-radius: 8px;
				border: 1px solid $grey-light;
				background-color: #ecf0f5;
				@extend .pointer;
			}
			&__text {
				color: $secondary;
				font-size: 16px;
				font-weight: 500;
				line-height: 24px;
			}
		}
		.block {
			display: flex;
			flex-direction: column;
			&__top {
				display: flex;
				flex-direction: column;
				gap: 8px;
				padding-bottom: 20px;
			}
			&__description {
				color: $secondary;
				font-size: 16px;
				font-weight: 400;
				line-height: 20px;
			}
		}
	}
</style>
