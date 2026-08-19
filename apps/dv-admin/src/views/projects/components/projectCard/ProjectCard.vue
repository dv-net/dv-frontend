<script setup lang="ts">
	import { computed, ref } from "vue";
	import { useI18n } from "vue-i18n";
	import { UiButton, UiCheckbox, UiConfirm, UiTextarea } from "@dv.net/ui-kit";
	import type { IStoreResponse } from "@dv-admin/utils/types/api/apiGo";
	import { formatDate } from "@dv-admin/utils/helpers/dateParse";
	import { STORE_VERIFICATION_STATUS, STORE_VERIFICATION_STATUS_LABELS } from "@dv-admin/utils/constants/root";
	import { useProjectsStore } from "@dv-admin/stores/projects";
	import { storeToRefs } from "pinia";
	import { HTTP_PROTOCOL_REGEX } from "@shared/utils/constants/regex";
	import IconWarningTriangle from "@dv-admin/components/icons/projects/IconWarningTriangle.vue";
	import IconArchiveBox from "@dv-admin/components/icons/projects/IconArchiveBox.vue";
	import IconCalendarMark from "@dv-admin/components/icons/projects/IconCalendarMark.vue";
	import IconDollarMinimal from "@dv-admin/components/icons/projects/IconDollarMinimal.vue";
	import IconEditPencil from "@dv-admin/components/icons/projects/IconEditPencil.vue";
	import IconExternalArrow from "@dv-admin/components/icons/projects/IconExternalArrow.vue";
	import IconVinylRecord from "@dv-admin/components/icons/projects/IconVinylRecord.vue";
	import IconWalletBold from "@dv-admin/components/icons/projects/IconWalletBold.vue";
	import IconDocument from "@dv-admin/components/icons/projects/IconDocument.vue";
	import IconAddCircle from "@dv-admin/components/icons/projects/IconAddCircle.vue";

	const props = defineProps<{
		store: IStoreResponse;
		archive: (store: IStoreResponse) => Promise<void>;
	}>();

	const emit = defineEmits<{
		edit: [];
		createPayment: [];
		webhooks: [];
	}>();

	const { t } = useI18n();
	const { postResendVerifyStore, refreshAfterResendVerify } = useProjectsStore();
	const { isLoadingResendVerify } = storeToRefs(useProjectsStore());

	const resendComment = ref("");
	const agreeChecked = ref(false);

	const showVerificationAlert = computed(() => {
		const s = props.store.verification_status;
		return s === STORE_VERIFICATION_STATUS.REJECTED || s === STORE_VERIFICATION_STATUS.NEEDS_CLARIFICATION;
	});


	const alertDescription = computed(() => {
		if (props.store.rejection_reason) return props.store.rejection_reason;
		return t("Please pass moderation or switch to OpenSource version, otherwise your project may be stopped");
	});

	const canResend = computed(() => agreeChecked.value && resendComment.value.trim().length > 0);

	const isResendLoading = computed(() => isLoadingResendVerify.value[props.store.id] || false);

	const handleResend = async () => {
		if (!canResend.value) return;
		await postResendVerifyStore(props.store.id, resendComment.value.trim());
		await refreshAfterResendVerify(props.store.id);
		resendComment.value = "";
		agreeChecked.value = false;
	};

	const siteHref = computed<string>(() => {
		const site = props.store.site?.trim();
		if (!site) return "";
		return HTTP_PROTOCOL_REGEX.test(site) ? site : `https://${site}`;
	});

	const statusLabel = computed(() => {
		const verification = props.store.verification_status as STORE_VERIFICATION_STATUS | undefined;
		const label = verification ? STORE_VERIFICATION_STATUS_LABELS[verification] : undefined;
		if (label) return t(label);
		return t(props.store.status ? "Active" : "Disabled");
	});

	const statusVariant = computed<"success" | "warning" | "danger" | "neutral">(() => {
		const verification = props.store.verification_status;
		if (verification === STORE_VERIFICATION_STATUS.SUCCESS) return "success";
		if (verification === STORE_VERIFICATION_STATUS.PENDING) return "warning";
		if (verification === STORE_VERIFICATION_STATUS.NEEDS_CLARIFICATION) return "warning";
		if (verification === STORE_VERIFICATION_STATUS.REJECTED) return "danger";
		return props.store.status ? "success" : "neutral";
	});
</script>

<template>
	<article class="project-card">
		<header class="project-card__header">
			<div class="project-card__identity">
				<div class="project-card__title-row">
					<h2 class="project-card__name">{{ store.name }}</h2>
					<a v-if="siteHref" class="project-card__url" :href="siteHref" target="_blank" rel="noopener noreferrer">
						<span class="project-card__url-text">{{ store.site }}</span>
						<icon-external-arrow />
					</a>
				</div>
				<p v-if="store.description" class="project-card__description">{{ store.description }}</p>
			</div>
			<div class="project-card__meta">
				<time class="project-card__date" :datetime="store.created_at">
					{{ formatDate(store.created_at) }}
					<icon-calendar-mark class="project-card__date-icon" />
				</time>
			</div>
		</header>

		<div class="project-card__metrics">
			<div class="metric">
				<div class="metric__icon" aria-hidden="true">
					<icon-vinyl-record />
				</div>
				<div class="metric__body">
					<span class="metric__label">{{ $t("Status") }}</span>
					<span class="metric__value" :class="`metric__value--${statusVariant}`">{{ statusLabel }}</span>
				</div>
			</div>
			<div class="metric">
				<div class="metric__icon" aria-hidden="true">
					<icon-wallet-bold />
				</div>
				<div class="metric__body">
					<span class="metric__label">{{ $t("Total payments") }}</span>
					<span class="metric__value">—</span>
				</div>
			</div>
			<div class="metric">
				<div class="metric__icon" aria-hidden="true">
					<icon-dollar-minimal />
				</div>
				<div class="metric__body">
					<span class="metric__label">{{ $t("Top-up amount") }}</span>
					<span class="metric__value">—</span>
				</div>
			</div>
		</div>

		<div v-if="showVerificationAlert" class="verification-block">
			<div class="verification-block__alert">
				<div class="verification-block__icon" :class="{ 'verification-block__icon--rejected': store.verification_status === STORE_VERIFICATION_STATUS.REJECTED }">
					<icon-warning-triangle />
				</div>
				<div class="verification-block__text">
					<span class="verification-block__title" :class="{ 'verification-block__title--rejected': store.verification_status === STORE_VERIFICATION_STATUS.REJECTED }">{{ $t("Comment from administrator") }}</span>
					<p class="verification-block__description">{{ alertDescription }}</p>
				</div>
			</div>
			<div class="verification-block__form">
				<ui-textarea
					v-model="resendComment"
					class="verification-block__textarea"
					:placeholder="$t('Describe what changes you have made')"
					:rows="3"
					filled
					max-length="255"
				/>
			</div>
			<div class="verification-block__footer">
				<ui-checkbox v-model="agreeChecked" size="sm">
					{{ $t("My project complies with laws and regulations") }}
				</ui-checkbox>
				<ui-button
					type="primary"
					left-icon-name="verified-user"
					left-icon-type="filled"
					:loading="isResendLoading"
					:disabled="!canResend"
					@click="handleResend"
				>
					{{ $t("Submit for moderation") }}
				</ui-button>
			</div>
		</div>

		<div class="project-card__actions">
			<ui-confirm
				class="project-card__confirm"
				:title="$t('Archive this shop?')"
				:text="$t('Archive shop confirm')"
				:method="() => archive(store)"
				position="top-start"
			>
				<template #default="{ loading: isArchiving }">
					<ui-button class="project-card__action" type="secondary" :loading="isArchiving">
						<icon-archive-box />
						{{ $t("Archive.verb") }}
					</ui-button>
				</template>
			</ui-confirm>
			<ui-button class="project-card__action" type="secondary" @click="emit('webhooks')">
				<icon-document />
				{{ $t("Webhooks") }}
			</ui-button>
			<ui-button class="project-card__action" type="secondary" @click="emit('createPayment')">
				<icon-add-circle />
				{{ $t("Create payment") }}
			</ui-button>
			<ui-button class="project-card__action" type="secondary" @click="emit('edit')">
				<icon-edit-pencil />
				{{ $t("Edit") }}
			</ui-button>
		</div>
	</article>
</template>

<style scoped lang="scss">
	.project-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px;
		border-radius: 20px;
		background: $white;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);

		&__header {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: 16px;

			@include mediamax(768) {
				flex-direction: column;
			}
		}

		&__identity {
			display: flex;
			flex-direction: column;
			gap: 8px;
			min-width: 0;
		}

		&__title-row {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 8px 12px;
			min-width: 0;
		}

		&__name {
			margin: 0;
			color: $black;
			font-size: 18px;
			font-weight: 700;
			line-height: 24px;
		}

		&__url {
			display: flex;
			align-items: center;
			gap: 4px;
			min-width: 0;
			color: $blue;
			font-size: 20px;
			font-weight: 400;
			line-height: 24px;

			&-text {
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		&__description {
			margin: 0;
			color: $secondary;
			font-size: 14px;
			font-weight: 400;
			line-height: 20px;
			overflow-wrap: anywhere;
		}

		&__meta {
			display: inline-flex;
			align-items: center;
			gap: 12px;
			flex-shrink: 0;
		}

		&__date {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			flex-shrink: 0;
			color: $black;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			white-space: nowrap;
		}

		&__date-icon {
			display: block;
			flex-shrink: 0;
			color: $black;
		}

		&__metrics {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 8px;

			@include mediamax(890) {
				grid-template-columns: 1fr;
			}
		}

		&__actions {
			display: grid;
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: 8px;

			@include mediamax(890) {
				grid-template-columns: 1fr 1fr;
			}

			&:deep(.ui-tooltip) {
				width: 100%;

				.ui-tooltip__trigger {
					width: 100%;
				}
			}
		}

		&__confirm {
			width: 100%;
			min-width: 0;
		}

		&__action {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			width: 100%;

			&:deep(.ui-button__content) {
				font-size: 12px;
			}
		}
	}

	.verification-block {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin: 8px 0;

		&__alert {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 8px;
			border-radius: 16px;
			border: 1px solid $grey;
		}

		&__icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			flex-shrink: 0;
			border-radius: 12px;
			background: #e6a100;

			&--rejected {
				background: rgba(255, 108, 45, 1);
			}
		}

		&__text {
			display: flex;
			flex-direction: column;
			gap: 4px;
			min-width: 0;
		}

		&__title {
			color: #e6a100;
			font-size: 12px;
			font-weight: 500;
			line-height: 16px;

			&--rejected {
				color: rgba(255, 108, 45, 1);
			}
		}

		&__description {
			margin: 0;
			color: $black;
			font-size: 14px;
			font-weight: 500;
			line-height: 16px;
			word-break: break-word;
		}

		&__form {
			display: flex;
			flex-direction: column;
		}

		&__textarea {
			border-radius: 16px;
		}

		&__footer {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			flex-wrap: wrap;
		}

	}

	.metric {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
		padding: 8px;
		border-radius: 16px;
		background: $white;
		box-shadow: inset 0 0 0 1px $grey;

		&__icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 40px;
			height: 40px;
			flex-shrink: 0;
			border-radius: 12px;
			background: $blue-opacity;
			color: $black;
		}

		&__body {
			display: flex;
			flex-direction: column;
			gap: 2px;
			min-width: 0;
		}

		&__label {
			color: $secondary;
			font-size: 12px;
			font-weight: 500;
			line-height: 16px;
		}

		&__value {
			display: inline-flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 6px;
			overflow-wrap: anywhere;
			color: $black;
			font-size: 14px;
			font-weight: 500;
			line-height: 16px;

			&--success {
				color: #1b8f3a;
			}

			&--warning {
				color: rgba(255, 158, 0, 1);
			}

			&--danger {
				color: #c4452d;
			}

			&--neutral {
				color: $secondary;
			}
		}
	}
</style>
