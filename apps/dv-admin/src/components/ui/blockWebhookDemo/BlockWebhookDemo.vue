<script setup lang="ts">
	import type { IProps } from "@dv-admin/components/ui/blockWebhookDemo/types";
	import BlockSection from "@dv-admin/components/ui/BlockSection/BlockSection.vue";
	import { computed } from "vue";
	import IconWebhookRequest from "@dv-admin/components/icons/IconWebhookRequest.vue";
	import IconWebhookResponse from "@dv-admin/components/icons/IconWebhookResponse.vue";
	import { UiCopyText } from "@dv.net/ui-kit";
	import { checkIsJSON } from "@shared/utils/helpers/general";

	const props = defineProps<IProps>();

	const errorText: string =
		"Error: The specified webhook was not found. Check that the URL is correct or the resource is accessible.";
	const isRequest = computed<boolean>(() => props.type === "request");
	const currentTextMessage = computed<string | object>(() => {
		const text = isRequest.value ? props.webhook.request : props.webhook.response;
		return checkIsJSON(text) ? JSON.parse(text) : errorText;
	});
</script>

<template>
	<block-section
		padding="md"
		radius="md"
		class="webhook"
		:class="[{ success: webhook.is_success && !isRequest }, { error: !webhook.is_success && !isRequest }]"
	>
		<div class="webhook__top">
			<div class="webhook__icon">
				<icon-webhook-request v-if="isRequest" />
				<icon-webhook-response v-else />
			</div>
			<span>
				{{ $t(isRequest ? "Request" : "Response") }}
			</span>
			<span
				v-if="!isRequest"
				class="webhook__label"
				:class="[{ success: webhook.is_success }, { error: !webhook.is_success }]"
			>
				{{ $t(webhook.is_success ? "Success" : "Error") }}
			</span>
			<span class="webhook__point" :class="[{ success: webhook.is_success }, { error: !webhook.is_success }]"> • </span>
			<span v-if="isRequest">{{ webhook.url }}</span>
			<span
				v-if="!isRequest"
				class="webhook__text"
				:class="[{ success: webhook.is_success }, { error: !webhook.is_success }]"
			>
				{{ $t("Response code") }}: {{ webhook.status_code }}
			</span>
			<ui-copy-text v-if="isRequest" :copied-text="webhook.url" size-icon="sm" color-icon="#828282" />
		</div>
		<div class="webhook__code-container">
			<block-section
				:mode="isRequest ? 'grey-border' : 'white'"
				padding="md"
				radius="sm"
				class="webhook__code"
				:class="{ success: webhook.is_success }"
			>
				<pre>{{ currentTextMessage }}</pre>
			</block-section>
			<ui-copy-text
				class="webhook__copy-body"
				:copied-text="typeof currentTextMessage === 'string' ? currentTextMessage : JSON.stringify(currentTextMessage)"
				size-icon="sm"
				color-icon="#828282"
			/>
		</div>
	</block-section>
</template>

<style scoped lang="scss">
	.webhook {
		display: flex;
		flex-direction: column;
		gap: 8px;
		&.success {
			border: 1px solid #1f9649;
			background-color: #e6faed;
		}
		&.error {
			border: 1px solid #dd4c1e;
			background-color: #fee2e7;
		}
		&__top {
			display: flex;
			align-items: center;
			gap: 8px;
			color: $secondary;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
		}
		&__icon {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		&__label {
			color: $white;
			font-size: 10px;
			font-weight: 500;
			line-height: 12px;
			border-radius: 4px;
			padding: 4px 12px;
			&.success {
				background-color: #1f9649;
			}
			&.error {
				background-color: #dd4c1e;
			}
		}
		&__text {
			&.success {
				color: #1f9649;
			}
			&.error {
				color: #dd4c1e;
			}
		}
		&__point {
			font-weight: 400;
			&.success {
				color: #1f9649;
			}
			&.error {
				color: #dd4c1e;
			}
		}
		&__code-container {
			position: relative;
		}
		&__code {
			max-height: 144px;
			word-break: break-all;
			overflow-y: auto;
			color: $grey-opacity;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			pre {
				white-space: pre-wrap;
			}
		}
		&__copy-body {
			position: absolute;
			right: 16px;
			top: 16px;
		}
	}
</style>
