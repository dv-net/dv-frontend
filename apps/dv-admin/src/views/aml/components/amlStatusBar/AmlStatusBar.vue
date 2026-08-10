<script setup lang="ts">
	import { computed, ref } from "vue";
	import { storeToRefs } from "pinia";
	import { useRouter } from "vue-router";
	import { UiSkeleton } from "@dv.net/ui-kit";
	import { useAmlStore } from "@dv-admin/stores/aml";
	import { useGeneralStore } from "@dv-admin/stores/general";
	import { postApiAmlSettings } from "@dv-admin/utils/services/aml.ts";
	import IconWallet from "@dv-admin/components/icons/aml/IconWallet.vue";
	import IconAmlProvider from "@dv-admin/components/icons/aml/IconAmlProvider.vue";
	import IconEdit from "@dv-admin/components/icons/aml/IconEdit.vue";
	import IconPower from "@dv-admin/components/icons/aml/IconPower.vue";

	const props = withDefaults(
		defineProps<{
			isLoading?: boolean;
		}>(),
		{
			isLoading: false
		}
	);

	const router = useRouter();
	const amlStore = useAmlStore();
	const { formAmlScoreTransaction, isCurrentProviderEnabled } = storeToRefs(amlStore);
	const { dictionary } = storeToRefs(useGeneralStore());

	const isLoadingToggle = ref(false);

	const providerSlug = computed(() => formAmlScoreTransaction.value.provider_slug || null);

	const providerLabel = computed(() => {
		if (!providerSlug.value) return null;
		return (
			dictionary.value?.available_aml_providers.find((provider) => provider.slug === providerSlug.value)?.label ??
			providerSlug.value
		);
	});

	const checksBalance = "—";

	const handleEditProvider = () => {
		const slug = providerSlug.value || dictionary.value?.available_aml_providers[0]?.slug;
		if (!slug) {
			router.push({ name: "aml-keys" });
			return;
		}
		formAmlScoreTransaction.value.provider_slug = slug;
		router.push({ name: "aml-keys" });
	};

	const handleToggleEnabled = async () => {
		if (!providerSlug.value || isLoadingToggle.value) return;
		try {
			isLoadingToggle.value = true;
			const data = await postApiAmlSettings({
				enabled: !isCurrentProviderEnabled.value,
				provider_slug: providerSlug.value
			});
			if (data) amlStore.amlSettings = data;
		} catch (error) {
			console.error(error);
		} finally {
			isLoadingToggle.value = false;
		}
	};
</script>

<template>
	<ui-skeleton v-if="props.isLoading" :rowHeight="96" :rows="1" :item-border-radius="24" />
	<section v-else class="aml-status">
		<article class="aml-status__card">
			<div class="aml-status__left">
				<span class="aml-status__icon aml-status__icon--wallet">
					<icon-wallet />
				</span>
				<p class="aml-status__label">{{ $t("Checks balance") }}</p>
			</div>
			<p class="aml-status__value">{{ checksBalance }}</p>
		</article>
		<article class="aml-status__card">
			<div class="aml-status__left">
				<span class="aml-status__icon">
					<icon-aml-provider />
				</span>
				<div class="aml-status__provider">
					<p class="aml-status__label">{{ providerLabel || "—" }}</p>
					<button v-if="providerSlug" type="button" class="aml-status__edit" @click="handleEditProvider">
						<icon-edit />
					</button>
				</div>
			</div>
			<div v-if="providerSlug" class="aml-status__badges">
				<button
					type="button"
					class="aml-status__power"
					:class="isCurrentProviderEnabled ? 'aml-status__power--on' : 'aml-status__power--off'"
					:disabled="isLoadingToggle"
					:title="$t(isCurrentProviderEnabled ? 'Enabled' : 'Disabled')"
					@click="handleToggleEnabled"
				>
					<icon-power />
				</button>
				<div
					class="aml-status__badge"
					:class="isCurrentProviderEnabled ? 'aml-status__badge--positive' : 'aml-status__badge--neutral'"
				>
					<span class="aml-status__dot" />
					<p class="aml-status__badge-text">
						{{ $t(isCurrentProviderEnabled ? "Enabled" : "Disabled") }}
					</p>
				</div>
			</div>
			<p v-else class="aml-status__value">—</p>
		</article>
	</section>
</template>

<style scoped lang="scss">
	.aml-status {
		display: flex;
		gap: 6px;
		padding: 6px;
		border-radius: 24px;
		background-color: $blue-opacity;

		&__card {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			flex: 1;
			min-width: 0;
			min-height: 82px;
			padding: 24px;
			border-radius: 20px;
			background-color: $white;
			box-shadow: 0 0 8px rgba(0, 0, 0, 0.04);
		}

		&__left {
			display: flex;
			align-items: center;
			gap: 12px;
			min-width: 0;
		}

		&__badges {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-shrink: 0;
		}

		&__icon {
			@extend .center;
			flex-shrink: 0;
			width: 32px;
			height: 32px;

			&--wallet {
				color: rgb(22, 126, 180);
			}
		}

		&__provider {
			display: flex;
			align-items: center;
			gap: 8px;
			min-width: 0;
		}

		&__label {
			margin: 0;
			color: $black;
			font-size: 20px;
			font-weight: 500;
			line-height: 24px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		&__value {
			margin: 0;
			color: $black;
			font-size: 32px;
			font-weight: 700;
			line-height: 34px;
			flex-shrink: 0;
		}

		&__edit {
			@extend .center;
			flex-shrink: 0;
			width: 28px;
			height: 28px;
			padding: 0;
			border: none;
			border-radius: 8px;
			background: transparent;
			color: rgb(48, 51, 69);
			cursor: pointer;
			transition:
				background-color 0.15s ease,
				color 0.15s ease,
				transform 0.1s ease;

			&:hover {
				background-color: rgba(48, 51, 69, 0.06);
				color: rgb(25, 104, 229);
			}

			&:active {
				background-color: rgba(48, 51, 69, 0.1);
				transform: scale(0.92);
			}
		}

		&__power {
			@extend .center;
			flex-shrink: 0;
			width: 36px;
			height: 36px;
			padding: 0;
			border: none;
			border-radius: 50%;
			box-shadow: 0 0 8px rgba(0, 0, 0, 0.04);
			cursor: pointer;
			transition:
				background-color 0.15s ease,
				color 0.15s ease,
				transform 0.1s ease,
				box-shadow 0.15s ease;

			&:disabled {
				cursor: default;
				opacity: 0.7;
			}

			&:not(:disabled):active {
				transform: scale(0.92);
			}

			&--on {
				color: rgb(31, 150, 73);
				background-color: rgba(31, 150, 73, 0.1);

				&:not(:disabled):hover {
					background-color: rgba(31, 150, 73, 0.16);
				}

				&:not(:disabled):active {
					background-color: rgba(31, 150, 73, 0.22);
				}
			}

			&--off {
				color: rgb(107, 109, 128);
				background-color: rgba(164, 165, 177, 0.16);

				&:not(:disabled):hover {
					background-color: rgba(164, 165, 177, 0.24);
				}

				&:not(:disabled):active {
					background-color: rgba(164, 165, 177, 0.32);
					transform: scale(0.92);
				}
			}
		}

		&__badge {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-shrink: 0;
			padding: 6px 16px;
			border-radius: 100px;
			box-shadow: 0 0 8px rgba(0, 0, 0, 0.04);

			&--positive {
				background-color: rgba(31, 150, 73, 0.08);
				color: rgb(31, 150, 73);

				.aml-status__dot {
					background-color: rgb(31, 150, 73);
				}
			}

			&--neutral {
				background-color: rgba(164, 165, 177, 0.16);
				color: rgb(107, 109, 128);

				.aml-status__dot {
					background-color: rgb(107, 109, 128);
				}
			}
		}

		&__dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			flex-shrink: 0;
		}

		&__badge-text {
			margin: 0;
			font-size: 14px;
			font-weight: 500;
			line-height: 20px;
			white-space: nowrap;
		}
	}
</style>
