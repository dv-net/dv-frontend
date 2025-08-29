<script setup lang="ts">
	import { UiButton } from "@dv.net/ui-kit";
	import RowActionInput from "@dv-admin/views/projects/edit/main/components/rowActionInput/RowActionInput.vue";
	import BlockWebhookDemo from "@dv-admin/components/ui/blockWebhookDemo/BlockWebhookDemo.vue";
	import { storeToRefs } from "pinia";
	import { useProjectsWebhooksStore } from "@dv-admin/stores/projects/webhooks";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { computed } from "vue";

	const { webhooksProject, loadingWebhookTestStates, loadingWebhookChangeStates } =
		storeToRefs(useProjectsWebhooksStore());
	const { putWebhooksProject, postWebhooksProject, postWebhookSendTest } = useProjectsWebhooksStore();

	const props = defineProps<{ uuid: string; background?: "gray" }>();

	const isHaveHistory = computed<boolean>(() => webhooksProject.value.some((item) => item?.history));
</script>

<template>
	<div :class="{ webhooks: true, gray: props.background === 'gray' }">
		<div class="flex flex-column p-24">
			<div class="webhooks__top">
				<h2 class="global-title-h3">{{ $t("Webhooks") }}</h2>
				<p class="webhooks__description">
					{{ $t("Webhooks allow you to send HTTP events related to your store to another server") }}
				</p>
			</div>
			<div class="webhooks__bottom">
				<row-action-input
					v-for="(item, index) in webhooksProject"
					:key="index"
					:label="$t(item.label)"
					v-model="item.url"
					:subtitle="$t(item.description)"
					:icon-title="$t(item.label)"
					:icon-text="$t(item.tooltip)"
				>
					<ui-button
						v-if="item?.id"
						class="ml-8 mt-6"
						type="outline"
						size="md"
						:loading="loadingWebhookTestStates[item.id]"
						@click.stop="postWebhookSendTest(item.id, $t('Webhook test passed'))"
					>
						{{ $t("Test") }}
					</ui-button>
					<ui-button
						:class="{ 'mt-6': true, 'ml-8': !item?.id }"
						type="secondary"
						size="md"
						:loading="item?.id ? loadingWebhookChangeStates[item.id] : loadingWebhookChangeStates[index as number]"
						@click.stop="
							item?.id
								? putWebhooksProject(uuid, item.id, $t('Webhook saved'))
								: postWebhooksProject(uuid, index as number, $t('Webhook created'))
						"
					>
						{{ item?.id ? $t("Save") : $t("Create") }}
					</ui-button>
				</row-action-input>
			</div>
		</div>
		<div v-if="isHaveHistory" class="demo">
			<h4 class="demo__title">{{ $t("Test data") }}:</h4>
			<block-section class="flex flex-column gap-24" padding="lg" radius="md">
				<template v-for="(item, index) in webhooksProject" :key="index">
					<div v-if="item?.history" class="flex flex-column gap-16">
						<block-webhook-demo type="request" :webhook="item.history!" />
						<block-webhook-demo type="response" :webhook="item.history!" />
					</div>
				</template>
			</block-section>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.webhooks {
		display: flex;
		flex-direction: column;
		border-radius: 16px;
		border: 1px solid $grey;
		overflow: hidden;

		&.gray {
			background-color: $blue-opacity;
		}
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
		&__bottom {
			border-top: 1px solid $grey;
			padding-top: 20px;
			display: flex;
			flex-direction: column;
			gap: 32px;
			&:deep(.ui-button) {
				border-radius: 4px;
			}
		}
		.demo {
			display: flex;
			flex-direction: column;
			gap: 12px;
			border-top: 1px solid $grey;
			background-color: $blue-opacity;
			padding: 20px 24px 24px 24px;
			&__title {
				color: $secondary;
				font-size: 16px;
				font-weight: 500;
				line-height: 20px;
			}
		}
	}
</style>
