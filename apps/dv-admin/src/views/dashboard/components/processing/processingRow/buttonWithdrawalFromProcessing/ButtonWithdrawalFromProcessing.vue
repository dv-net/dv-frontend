<script setup lang="ts">
	import { UiIcon, UiLink, UiTooltip } from "@dv.net/ui-kit";
	import IconWithdrawalFromProcessing from "@dv-admin/components/icons/dashboard/IconWithdrawalFromProcessing.vue";
	import { useUserSettingsStore } from "@dv-admin/stores/userSettings";
	import { computed } from "vue";
	import { storeToRefs } from "pinia";

	const { userSettings } = storeToRefs(useUserSettingsStore());

	const { currencyId } = defineProps<{ currencyId: string }>();
	const emits = defineEmits(["close"]);
	const isShowWithdrawalFromProcessing = defineModel<Record<string, boolean>>({ default: {}, required: true });

	const settingWithdrawFromProcessing = computed<string | undefined>(() => {
		return userSettings.value.find((item) => item.name === "withdraw_from_processing")?.value;
	});

	const isWithdrawEnabled = computed<boolean>(() => settingWithdrawFromProcessing.value === "enabled");

	const handleClose = () => {
		isShowWithdrawalFromProcessing.value[currencyId] = false;
		emits("close");
	};
</script>

<template>
	<div class="button-withdrawal-from-processing">
		<transition name="fade-scale" mode="out-in">
			<ui-icon
				v-if="isShowWithdrawalFromProcessing[currencyId]"
				key="close"
				type="400"
				name="close"
				size="lg"
				color="#444444"
				class="button-withdrawal-from-processing__close"
				@click="handleClose"
			/>
			<ui-tooltip
				v-else
				key="withdrawal"
				:title="`${$t('Withdrawal from processing')} ${$t('wallets.many3')}`"
				:text="isWithdrawEnabled ? $t('You can withdraw funds from the current processing ring') : undefined"
			>
				<icon-withdrawal-from-processing
					:class="['flex-shrink-0', isWithdrawEnabled ? 'pointer' : 'disabled']"
					@click="isWithdrawEnabled && (isShowWithdrawalFromProcessing[currencyId] = true)"
				/>
				<template v-if="!isWithdrawEnabled" #text>
					<div class="fz-12">
						{{ $t("This feature is disabled") }}.
						<ui-link size="md" :to="{ name: 'settings-system-general' }">
							{{ $t("Go to settings") }}
						</ui-link>
					</div>
				</template>
			</ui-tooltip>
		</transition>
	</div>
</template>

<style scoped lang="scss">
	.button-withdrawal-from-processing {
		display: flex;
		justify-content: flex-end;
		flex-grow: 1;
		.disabled {
			opacity: 0.4;
			cursor: not-allowed;
			pointer-events: auto;
		}
		&__close {
			transition: transform 0.3s ease-in-out;
			@media (hover: hover) {
				&:hover {
					cursor: pointer;
					transform: scale(1.01);
				}
			}
		}
		.fade-scale-enter-active {
			transition: all 0.2s ease-out;
		}
		.fade-scale-leave-active {
			transition: all 0.2s ease-in;
		}
		.fade-scale-enter-from {
			opacity: 0;
			transform: scale(0.8);
		}
		.fade-scale-leave-to {
			opacity: 0;
			transform: scale(0.8);
		}
	}
</style>